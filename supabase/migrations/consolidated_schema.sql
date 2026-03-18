-- ========================================================
-- TEA MAX MILK TEA HUB - MASTER IDEMPOTENT DATABASE SETUP
-- ========================================================

-- 1. EXTENSIONS & FUNCTIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Unified updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Price calculation functions
DROP FUNCTION IF EXISTS is_discount_active(boolean, timestamptz, timestamptz);
CREATE OR REPLACE FUNCTION is_discount_active(
  discount_active boolean,
  discount_start_date timestamptz,
  discount_end_date timestamptz
)
RETURNS boolean AS $$
BEGIN
  IF NOT discount_active THEN RETURN false; END IF;
  IF discount_start_date IS NULL AND discount_end_date IS NULL THEN RETURN discount_active; END IF;
  RETURN (
    (discount_start_date IS NULL OR now() >= discount_start_date) AND
    (discount_end_date IS NULL OR now() <= discount_end_date)
  );
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS get_effective_price(decimal, decimal, boolean, timestamptz, timestamptz);
CREATE OR REPLACE FUNCTION get_effective_price(
  price decimal,
  discount_price decimal,
  discount_active boolean,
  discount_start_date timestamptz,
  discount_end_date timestamptz
)
RETURNS decimal AS $$
BEGIN
  IF is_discount_active(discount_active, discount_start_date, discount_end_date) AND discount_price IS NOT NULL THEN
    RETURN discount_price;
  END IF;
  RETURN price;
END;
$$ LANGUAGE plpgsql;

-- 2. TABLES SCHEMA
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '☕',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  category text NOT NULL REFERENCES categories(id),
  popular boolean DEFAULT false,
  available boolean DEFAULT true,
  image_url text,
  flavors text[] DEFAULT ARRAY[]::text[],
  discount_price decimal(10,2),
  discount_start_date timestamptz,
  discount_end_date timestamptz,
  discount_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Rename base_price to price if it exists (for compatibility)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'base_price') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'price') THEN
      ALTER TABLE menu_items RENAME COLUMN base_price TO price;
    ELSE
      -- Drop base_price if price already exists
      ALTER TABLE menu_items DROP COLUMN base_price;
    END IF;
  END IF;

  -- Add flavors column if it somehow missed (extra safety)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'flavors') THEN
    ALTER TABLE menu_items ADD COLUMN flavors text[] DEFAULT ARRAY[]::text[];
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS add_ons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id text PRIMARY KEY,
  value text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  description text,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_methods (
  id text PRIMARY KEY,
  name text NOT NULL,
  account_number text NOT NULL,
  account_name text NOT NULL,
  qr_code_url text NOT NULL,
  active boolean DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  contact_number text NOT NULL,
  service_type text NOT NULL CHECK (service_type IN ('pickup', 'delivery')),
  address text,
  landmark text,
  pickup_time text,
  payment_method text NOT NULL,
  reference_number text,
  total_price decimal(10,2) NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
  name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL,
  variation_name text,
  flavor_name text,
  add_ons jsonb DEFAULT '[]'::jsonb,
  total_item_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. TRIGGERS (IDEMPOTENT)
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. SECURITY & POLICIES (IDEMPOTENT)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies with multiple possible names
DO $$
DECLARE
    t text;
    p text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('categories', 'menu_items', 'variations', 'add_ons', 'site_settings', 'payment_methods', 'orders', 'order_items')
    LOOP
        FOR p IN SELECT policyname FROM pg_policies WHERE tablename = t AND schemaname = 'public'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I', p, t);
        END LOOP;
    END LOOP;
END $$;

-- Standardized policies
CREATE POLICY "Anyone can read categories" ON categories FOR SELECT TO public USING (active = true);
CREATE POLICY "Anyone can manage categories" ON categories FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can read menu items" ON menu_items FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can manage menu items" ON menu_items FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can read variations" ON variations FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can manage variations" ON variations FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can read add-ons" ON add_ons FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can manage add-ons" ON add_ons FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can read site settings" ON site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can manage site settings" ON site_settings FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can read payment methods" ON payment_methods FOR SELECT TO public USING (active = true);
CREATE POLICY "Anyone can manage payment methods" ON payment_methods FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can manage orders" ON orders FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage order items" ON order_items FOR ALL TO public USING (true) WITH CHECK (true);

-- 5. STORAGE (IDEMPOTENT)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

DO $$
DECLARE
    p text;
BEGIN
    FOR p IN SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', p);
    END LOOP;
END $$;

CREATE POLICY "Public read for menu images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'menu-images');
CREATE POLICY "Anyone can upload menu images" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'menu-images');
CREATE POLICY "Anyone can update menu images" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'menu-images');
CREATE POLICY "Anyone can delete menu images" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'menu-images');

-- 6. INITIAL DATA (TEA MAX SPECIFIC)

-- Categories
INSERT INTO categories (id, name, icon, sort_order, active) VALUES 
('burger', 'Burger', '🍔', 10, true),
('hotdogs', 'Hotdogs', '🌭', 11, true),
('eggdrop', 'Eggdrop', '🥪', 12, true),
('fries-nachos', 'Fries, Nachos & Onion Rings', '🍟', 13, true),
('pasta', 'Pasta', '🍝', 14, true),
('milk-tea', 'Milk Tea', '🧋', 15, true),
('fruit-tea', 'Fruit Tea', '🍹', 16, true),
('fruit-soda', 'Fruit Soda', '🥤', 17, true),
('milkshake', 'Milkshake', '🥤', 18, true),
('cheesecake', 'Cheesecake', '🍰', 19, true),
('premiums', 'Premiums', '🌟', 20, true),
('coffee-new', 'Coffee', '☕', 21, true),
('yogurt', 'Yogurt', '🍦', 22, true),
('chicken-wings', 'Chicken Wings', '🍗', 9, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon, sort_order = EXCLUDED.sort_order;

-- Site Settings
INSERT INTO site_settings (id, value, type, description) VALUES
  ('site_name', 'Tea Max Milk Tea Hub', 'text', 'The name of the cafe/restaurant'),
  ('site_logo', 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', 'image', 'The logo image URL for the site'),
  ('site_description', 'Discover our curated selection of handcrafted beverages at Tea Max Milk Tea Hub.', 'text', 'Short description of the cafe'),
  ('site_tagline', 'Milk Tea Hub', 'text', 'Short tagline shown under the site name'),
  ('currency', '₱', 'text', 'Currency symbol for prices'),
  ('currency_code', 'PHP', 'text', 'Currency code for payments'),
  ('store_hours', '06:00 AM - 10:00 PM', 'text', 'Store operating hours'),
  ('contact_number', '0945 210 6254', 'text', 'Contact phone number'),
  ('address', 'Purok 3 Barangay Trenchera, Tayug Pangasinan', 'text', 'Store address'),
  ('facebook_url', 'https://www.facebook.com/teamaxmilkteahub', 'text', 'Facebook page URL'),
  ('facebook_handle', '@teamaxmilkteahub', 'text', 'Facebook page handle')
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value;

-- Payment Methods
INSERT INTO payment_methods (id, name, account_number, account_name, qr_code_url, sort_order, active) VALUES
  ('gcash', 'GCash', '0945 210 6254', 'Tea Max Hub', 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg', 1, true)
ON CONFLICT (id) DO UPDATE SET account_number = EXCLUDED.account_number;

-- Menu Items & Variations
DO $$
DECLARE
    v_milktea_flavors text[] := ARRAY['Avocado', 'Black Forrest', 'Blueberry', 'Cappuccino', 'Caramel', 'Caramel Macchiato', 'Choco Hazelnut', 'Choco Mousse', 'Choco Nutella', 'Coffee Caramel', 'Coffee Latte', 'Cookies & Cream', 'Dark Choco', 'Double Dutch', 'Hazelnut Macchiato', 'Hershey''s', 'Hokkaido', 'Honey Dew', 'Java Chips', 'Mocca', 'Nutella', 'Okinawa', 'Oreo', 'Pearl Milk Tea', 'Red Velvet', 'Salted Caramel', 'Taro', 'Thai', 'Tiramisu', 'Ube Matcha', 'Vanilla', 'White Rabbit', 'Wintermelon', 'Wintermelon Latte'];
    v_fruittea_flavors text[] := ARRAY['Strawberry', 'Blueberry', 'Lemon', 'Mango', 'Kiwi', 'Lychee', 'Green Apple', 'Peach', 'Passion', 'Passion Mango', 'Peach Mango', 'Kiwi Lychee'];
    v_fruitsoda_flavors text[] := ARRAY['Strawberry Soda', 'Blueberry Soda', 'Rootbeer Float', 'Bubblegum Soda', 'Lychee Soda', 'Green Apple Soda', 'Raspberry Soda', 'Passion Soda', 'Kiwi Soda'];
    v_milkshake_flavors text[] := ARRAY['Oreo in a Cup', 'Kitkat', 'Avocado Shake', 'Strawberry Shake', 'Mango Shake'];
    v_cheesecake_flavors text[] := ARRAY['Oreo Cheesecake', 'Blueberry Cheesecake', 'Strawberry Cheesecake', 'Mango Cheesecake', 'Avocado Cheesecake'];
    v_yogurt_flavors text[] := ARRAY['Mango Yogurt', 'Strawberry Yogurt', 'Blueberry Yogurt'];
    v_item_name text;
    v_item_id uuid;
BEGIN
    -- Items
    INSERT INTO menu_items (id, name, description, price, category, popular) VALUES
    (uuid_generate_v5(uuid_nil(), 'Classic Burger'), 'Classic Burger', '100% Beef Patty with fresh lettuce and tomatoes', 109, 'burger', true),
    (uuid_generate_v5(uuid_nil(), 'Cheese Burger'), 'Cheese Burger', 'Classic burger with melted cheddar cheese', 99, 'burger', false),
    (uuid_generate_v5(uuid_nil(), 'Chicken Burger'), 'Chicken Burger', 'Crispy chicken fillet with special sauce', 109, 'burger', true),
    (uuid_generate_v5(uuid_nil(), 'Smash Burger'), 'Smash Burger', 'Smashed beef patty, crispy edges, juicy center', 140, 'burger', true),
    (uuid_generate_v5(uuid_nil(), 'Hawaiian Burger'), 'Hawaiian Burger', 'Beef patty topped with grilled pineapple', 150, 'burger', false),
    (uuid_generate_v5(uuid_nil(), 'Cheesy Bacon'), 'Cheesy Bacon', 'Beef patty with bacon and loads of cheese', 130, 'burger', false),
    (uuid_generate_v5(uuid_nil(), 'Chili Burger'), 'Chili Burger', 'Spicy beef patty with chili sauce', 150, 'burger', false),
    (uuid_generate_v5(uuid_nil(), '1 pc Burger Steak'), '1 pc Burger Steak', 'Served with rice and mushroom gravy', 79, 'burger', false),
    (uuid_generate_v5(uuid_nil(), '2 pcs Burger Steak'), '2 pcs Burger Steak', 'Served with rice and mushroom gravy', 149, 'burger', false),
    (uuid_generate_v5(uuid_nil(), 'Chili-Dog Classic'), 'Chili-Dog Classic', 'Classic hotdog with chili con carne', 99, 'hotdogs', false),
    (uuid_generate_v5(uuid_nil(), 'Chili-Dog Jalapeno'), 'Chili-Dog Jalapeno', 'Spicy hotdog with jalapenos', 109, 'hotdogs', false),
    (uuid_generate_v5(uuid_nil(), 'Regular Egglicious'), 'Regular Egglicious', 'Fluffy scrambled eggs in brioche toast', 100, 'eggdrop', false),
    (uuid_generate_v5(uuid_nil(), 'Spam Egglicious'), 'Spam Egglicious', 'Spam and fluffy eggs', 100, 'eggdrop', false),
    (uuid_generate_v5(uuid_nil(), 'Ham Egglicious'), 'Ham Egglicious', 'Ham and fluffy eggs', 100, 'eggdrop', false),
    (uuid_generate_v5(uuid_nil(), 'Bacon Egglicious'), 'Bacon Egglicious', 'Bacon and fluffy eggs', 100, 'eggdrop', false),
    (uuid_generate_v5(uuid_nil(), 'Spam & Cheesy'), 'Spam & Cheesy', 'Spam with extra cheese', 120, 'eggdrop', false),
    (uuid_generate_v5(uuid_nil(), 'Bacon & Cheesy'), 'Bacon & Cheesy', 'Bacon with extra cheese', 120, 'eggdrop', false),
    (uuid_generate_v5(uuid_nil(), 'Ham & Cheesy'), 'Ham & Cheesy', 'Ham with extra cheese', 120, 'eggdrop', false),
    (uuid_generate_v5(uuid_nil(), 'Burger & Cheesy'), 'Burger & Cheesy', 'Burger patty with extra cheese', 130, 'eggdrop', false),
    (uuid_generate_v5(uuid_nil(), 'Cheese Fries'), 'Cheese Fries', 'Crispy fries with cheese powder', 50, 'fries-nachos', false),
    (uuid_generate_v5(uuid_nil(), 'BBQ Fries'), 'BBQ Fries', 'Crispy fries with BBQ flavor', 50, 'fries-nachos', false),
    (uuid_generate_v5(uuid_nil(), 'Spicy BBQ Fries'), 'Spicy BBQ Fries', 'Crispy fries with spicy BBQ flavor', 50, 'fries-nachos', false),
    (uuid_generate_v5(uuid_nil(), 'Fries Overload'), 'Fries Overload', 'Fries loaded with toppings', 99, 'fries-nachos', true),
    (uuid_generate_v5(uuid_nil(), 'Nachos'), 'Nachos', 'Crispy nachos with beef, cheese, and salsa', 85, 'fries-nachos', true),
    (uuid_generate_v5(uuid_nil(), 'Onion Rings'), 'Onion Rings', 'Golden crispy onion rings', 70, 'fries-nachos', false),
    (uuid_generate_v5(uuid_nil(), 'Creamy Carbonara'), 'Creamy Carbonara', 'Creamy white sauce pasta with bacon', 89, 'pasta', false),
    (uuid_generate_v5(uuid_nil(), 'Charlie-Chan'), 'Charlie-Chan', 'Spicy oriental pasta', 89, 'pasta', true),
    (uuid_generate_v5(uuid_nil(), 'Spaghetti'), 'Spaghetti', 'Classic Filipino style sweet spaghetti', 89, 'pasta', false)
    ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;

    -- Chicken Wings
    v_item_id := uuid_generate_v5(uuid_nil(), 'Chicken Wings');
    INSERT INTO menu_items (id, name, description, price, category, popular, flavors)
    VALUES (v_item_id, 'Chicken Wings', 'Crispy fried chicken wings with your choice of flavor', 149, 'chicken-wings', true, ARRAY['Plain', 'BBQ', 'Hot & Spicy', 'Garlic Parmesan', 'Honey Butter', 'Buffalo', 'Sweet Chili', 'Soy Garlic'])
    ON CONFLICT (id) DO UPDATE SET flavors = EXCLUDED.flavors;
    
    INSERT INTO variations (id, menu_item_id, name, price) VALUES
    (uuid_generate_v5(v_item_id, '6 pcs'), v_item_id, '6 pcs', 149),
    (uuid_generate_v5(v_item_id, '12 pcs'), v_item_id, '12 pcs', 279)
    ON CONFLICT (id) DO NOTHING;

    -- Coffee
    INSERT INTO menu_items (id, name, price, category, popular, description) 
    VALUES (uuid_generate_v5(uuid_nil(), 'Caramel Macchiato Coffee'), 'Caramel Macchiato Coffee', 80, 'coffee-new', false, 'Hot/Cold Coffee'),
           (uuid_generate_v5(uuid_nil(), 'Thai Coffee'), 'Thai Coffee', 80, 'coffee-new', false, 'Hot/Cold Coffee'),
           (uuid_generate_v5(uuid_nil(), 'Hazelnut Latte'), 'Hazelnut Latte', 80, 'coffee-new', false, 'Hot/Cold Coffee'),
           (uuid_generate_v5(uuid_nil(), 'Matcha Coffee Latte'), 'Matcha Coffee Latte', 80, 'coffee-new', false, 'Hot/Cold Coffee'),
           (uuid_generate_v5(uuid_nil(), 'Baileys'), 'Baileys', 80, 'coffee-new', false, 'Hot/Cold Coffee'),
           (uuid_generate_v5(uuid_nil(), 'Hazelnut Macchiato Coffee'), 'Hazelnut Macchiato Coffee', 80, 'coffee-new', false, 'Hot/Cold Coffee'),
           (uuid_generate_v5(uuid_nil(), 'Choco Coffee'), 'Choco Coffee', 80, 'coffee-new', false, 'Hot/Cold Coffee'),
           (uuid_generate_v5(uuid_nil(), 'Caramel Sea Salt Latte'), 'Caramel Sea Salt Latte', 80, 'coffee-new', false, 'Hot/Cold Coffee'),
           (uuid_generate_v5(uuid_nil(), 'Butterscotch Coffee'), 'Butterscotch Coffee', 80, 'coffee-new', false, 'Hot/Cold Coffee')
    ON CONFLICT (id) DO NOTHING;

    v_item_id := uuid_generate_v5(uuid_nil(), 'Cafe Americano');
    INSERT INTO menu_items (id, name, price, category, popular, description) VALUES (v_item_id, 'Cafe Americano', 50, 'coffee-new', false, 'Hot/Cold Coffee') ON CONFLICT (id) DO NOTHING;
    INSERT INTO variations (id, menu_item_id, name, price) VALUES (uuid_generate_v5(v_item_id, 'Small'), v_item_id, 'Small', 50), (uuid_generate_v5(v_item_id, 'Large'), v_item_id, 'Large', 70) ON CONFLICT (id) DO NOTHING;

    -- Loops for Milk Tea, Fruit Tea, etc.
    FOREACH v_item_name IN ARRAY v_milktea_flavors LOOP
        v_item_id := uuid_generate_v5(uuid_nil(), v_item_name);
        INSERT INTO menu_items (id, name, price, category, popular, description) VALUES (v_item_id, v_item_name, 70, 'milk-tea', false, 'Premium Milk Tea') ON CONFLICT (id) DO NOTHING;
        
        INSERT INTO variations (id, menu_item_id, name, price) VALUES 
        (uuid_generate_v5(v_item_id, 'Medium'), v_item_id, 'Medium', 70), 
        (uuid_generate_v5(v_item_id, 'Large'), v_item_id, 'Large', 80), 
        (uuid_generate_v5(v_item_id, 'Extra Large'), v_item_id, 'Extra Large', 120) 
        ON CONFLICT (id) DO NOTHING;
        
        INSERT INTO add_ons (id, menu_item_id, name, price, category) VALUES 
        (uuid_generate_v5(v_item_id, 'Nata'), v_item_id, 'Nata', 15, 'Sinkers'), 
        (uuid_generate_v5(v_item_id, 'Pearl'), v_item_id, 'Pearl', 15, 'Sinkers'), 
        (uuid_generate_v5(v_item_id, 'Pudding'), v_item_id, 'Pudding', 15, 'Sinkers'), 
        (uuid_generate_v5(v_item_id, 'Popping Boba'), v_item_id, 'Popping Boba', 15, 'Sinkers'), 
        (uuid_generate_v5(v_item_id, 'Coffee Jelly'), v_item_id, 'Coffee Jelly', 15, 'Sinkers'), 
        (uuid_generate_v5(v_item_id, 'Rainbow Jelly'), v_item_id, 'Rainbow Jelly', 15, 'Sinkers'), 
        (uuid_generate_v5(v_item_id, 'Cream Cheese'), v_item_id, 'Cream Cheese', 15, 'Sinkers') 
        ON CONFLICT (id) DO NOTHING;
    END LOOP;

    FOREACH v_item_name IN ARRAY v_fruittea_flavors LOOP
        v_item_id := uuid_generate_v5(uuid_nil(), v_item_name);
        INSERT INTO menu_items (id, name, price, category, popular, description) VALUES (v_item_id, v_item_name, 70, 'fruit-tea', false, 'Refreshing Fruit Tea') ON CONFLICT (id) DO NOTHING;
        
        INSERT INTO variations (id, menu_item_id, name, price) VALUES 
        (uuid_generate_v5(v_item_id, 'Medium'), v_item_id, 'Medium', 70), 
        (uuid_generate_v5(v_item_id, 'Large'), v_item_id, 'Large', 80), 
        (uuid_generate_v5(v_item_id, 'Extra Large'), v_item_id, 'Extra Large', 120) 
        ON CONFLICT (id) DO NOTHING;
        
        INSERT INTO add_ons (id, menu_item_id, name, price, category) VALUES 
        (uuid_generate_v5(v_item_id, 'Nata'), v_item_id, 'Nata', 15, 'Sinkers'), 
        (uuid_generate_v5(v_item_id, 'Pearl'), v_item_id, 'Pearl', 15, 'Sinkers'), 
        (uuid_generate_v5(v_item_id, 'Popping Boba'), v_item_id, 'Popping Boba', 15, 'Sinkers') 
        ON CONFLICT (id) DO NOTHING;
    END LOOP;

    FOREACH v_item_name IN ARRAY v_fruitsoda_flavors LOOP
        v_item_id := uuid_generate_v5(uuid_nil(), v_item_name);
        INSERT INTO menu_items (id, name, price, category, popular, description) VALUES (v_item_id, v_item_name, 70, 'fruit-soda', false, 'Sparkling Fruit Soda') ON CONFLICT (id) DO NOTHING;
        
        INSERT INTO variations (id, menu_item_id, name, price) VALUES 
        (uuid_generate_v5(v_item_id, 'Medium'), v_item_id, 'Medium', 70), 
        (uuid_generate_v5(v_item_id, 'Large'), v_item_id, 'Large', 80), 
        (uuid_generate_v5(v_item_id, 'Extra Large'), v_item_id, 'Extra Large', 120) 
        ON CONFLICT (id) DO NOTHING;
    END LOOP;

    FOREACH v_item_name IN ARRAY v_milkshake_flavors LOOP
        v_item_id := uuid_generate_v5(uuid_nil(), v_item_name);
        INSERT INTO menu_items (id, name, price, category, popular, description) VALUES (v_item_id, v_item_name, 90, 'milkshake', false, 'Creamy Milkshake') ON CONFLICT (id) DO NOTHING;
        INSERT INTO variations (id, menu_item_id, name, price) VALUES (uuid_generate_v5(v_item_id, 'Large'), v_item_id, 'Large', 90) ON CONFLICT (id) DO NOTHING;
    END LOOP;

    FOREACH v_item_name IN ARRAY v_cheesecake_flavors LOOP
        v_item_id := uuid_generate_v5(uuid_nil(), v_item_name);
        INSERT INTO menu_items (id, name, price, category, popular, description) VALUES (v_item_id, v_item_name, 85, 'cheesecake', false, 'Rich Cheesecake Series') ON CONFLICT (id) DO NOTHING;
        INSERT INTO variations (id, menu_item_id, name, price) VALUES (uuid_generate_v5(v_item_id, 'Medium'), v_item_id, 'Medium', 85), (uuid_generate_v5(v_item_id, 'Large'), v_item_id, 'Large', 95) ON CONFLICT (id) DO NOTHING;
    END LOOP;

    FOREACH v_item_name IN ARRAY v_yogurt_flavors LOOP
        v_item_id := uuid_generate_v5(uuid_nil(), v_item_name);
        INSERT INTO menu_items (id, name, price, category, popular, description) VALUES (v_item_id, v_item_name, 80, 'yogurt', false, 'Fresh Yogurt Drink') ON CONFLICT (id) DO NOTHING;
        INSERT INTO variations (id, menu_item_id, name, price) VALUES (uuid_generate_v5(v_item_id, 'Medium'), v_item_id, 'Medium', 80), (uuid_generate_v5(v_item_id, 'Large'), v_item_id, 'Large', 90) ON CONFLICT (id) DO NOTHING;
    END LOOP;

    -- Premiums
    v_item_id := uuid_generate_v5(uuid_nil(), 'Meiji Apollo');
    INSERT INTO menu_items (id, name, price, category, popular, description) VALUES (v_item_id, 'Meiji Apollo', 85, 'premiums', false, 'Premium Drink') ON CONFLICT (id) DO NOTHING;
    INSERT INTO variations (id, menu_item_id, name, price) VALUES (uuid_generate_v5(v_item_id, 'Medium'), v_item_id, 'Medium', 85), (uuid_generate_v5(v_item_id, 'Large'), v_item_id, 'Large', 95) ON CONFLICT (id) DO NOTHING;

    v_item_id := uuid_generate_v5(uuid_nil(), 'Milo G');
    INSERT INTO menu_items (id, name, price, category, popular, description) VALUES (v_item_id, 'Milo G', 100, 'premiums', false, 'Premium Drink') ON CONFLICT (id) DO NOTHING;
    INSERT INTO variations (id, menu_item_id, name, price) VALUES (uuid_generate_v5(v_item_id, 'Medium'), v_item_id, 'Medium', 100), (uuid_generate_v5(v_item_id, 'Large'), v_item_id, 'Large', 110) ON CONFLICT (id) DO NOTHING;

    v_item_id := uuid_generate_v5(uuid_nil(), 'Brown Sugar Latte');
    INSERT INTO menu_items (id, name, price, category, popular, description) VALUES (v_item_id, 'Brown Sugar Latte', 100, 'premiums', false, 'Premium Drink') ON CONFLICT (id) DO NOTHING;
    INSERT INTO variations (id, menu_item_id, name, price) VALUES (uuid_generate_v5(v_item_id, 'Large'), v_item_id, 'Large', 100) ON CONFLICT (id) DO NOTHING;

    v_item_id := uuid_generate_v5(uuid_nil(), 'Taro Halo-Halo');
    INSERT INTO menu_items (id, name, price, category, popular, description) VALUES (v_item_id, 'Taro Halo-Halo', 95, 'premiums', false, 'Premium Drink') ON CONFLICT (id) DO NOTHING;
    INSERT INTO variations (id, menu_item_id, name, price) VALUES (uuid_generate_v5(v_item_id, 'Large'), v_item_id, 'Large', 95) ON CONFLICT (id) DO NOTHING;

END $$;
