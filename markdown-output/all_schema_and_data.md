-- ========================================================
-- TEA MAX MILK TEA HUB - COMPLETE DATABASE SETUP
-- Consolidated from all migrations, removing unrelated data.
-- ========================================================

-- 1. EXTENSIONS & FUNCTIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

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
  base_price decimal(10,2) NOT NULL,
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

-- 3. TRIGGERS
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. ROW LEVEL SECURITY (ANON USE CASE)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Public READ policies
CREATE POLICY "Public read" ON categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read" ON menu_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read" ON variations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read" ON add_ons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read" ON site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read" ON payment_methods FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Public read" ON orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read" ON order_items FOR SELECT TO anon, authenticated USING (true);

-- Public MANAGE policies (Since app uses anon key primarily)
CREATE POLICY "Public manage" ON categories FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "Public manage" ON menu_items FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "Public manage" ON variations FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "Public manage" ON add_ons FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "Public manage" ON site_settings FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "Public manage" ON payment_methods FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "Public manage" ON orders FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "Public manage" ON order_items FOR ALL TO anon, authenticated USING (true);

-- 5. STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for menu images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'menu-images');
CREATE POLICY "Anyone can upload menu images" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'menu-images');
CREATE POLICY "Anyone can update menu images" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'menu-images');
CREATE POLICY "Anyone can delete menu images" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'menu-images');

-- 6. INITIAL DATA (TEA MAX SPECIFIC)

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
ON CONFLICT (id) DO NOTHING;

-- Categories & Menu Items (Tea Max)
DO $$
DECLARE
    -- Category IDs
    v_burger_cat_id text := 'burger';
    v_hotdog_cat_id text := 'hotdogs';
    v_eggdrop_cat_id text := 'eggdrop';
    v_snacks_cat_id text := 'fries-nachos';
    v_pasta_cat_id text := 'pasta';
    v_milktea_cat_id text := 'milk-tea';
    v_fruittea_cat_id text := 'fruit-tea';
    v_fruitsoda_cat_id text := 'fruit-soda';
    v_milkshake_cat_id text := 'milkshake';
    v_cheesecake_cat_id text := 'cheesecake';
    v_premiums_cat_id text := 'premiums';
    v_coffee_cat_id text := 'coffee-new';
    v_yogurt_cat_id text := 'yogurt';
    v_wings_cat_id text := 'chicken-wings';
    
    v_item_name text;
    v_item_id uuid;
    
    -- Arrays
    v_milktea_flavors text[] := ARRAY['Avocado', 'Black Forrest', 'Blueberry', 'Cappuccino', 'Caramel', 'Caramel Macchiato', 
                            'Choco Hazelnut', 'Choco Mousse', 'Choco Nutella', 'Coffee Caramel', 'Coffee Latte', 
                            'Cookies & Cream', 'Dark Choco', 'Double Dutch', 'Hazelnut Macchiato', 'Hershey''s', 
                            'Hokkaido', 'Honey Dew', 'Java Chips', 'Mocca', 'Nutella', 'Okinawa', 'Oreo', 
                            'Pearl Milk Tea', 'Red Velvet', 'Salted Caramel', 'Taro', 'Thai', 'Tiramisu', 
                            'Ube Matcha', 'Vanilla', 'White Rabbit', 'Wintermelon', 'Wintermelon Latte'];
    v_fruittea_flavors text[] := ARRAY['Strawberry', 'Blueberry', 'Lemon', 'Mango', 'Kiwi', 'Lychee', 'Green Apple', 'Peach', 'Passion', 'Passion Mango', 'Peach Mango', 'Kiwi Lychee'];
    v_fruitsoda_flavors text[] := ARRAY['Strawberry Soda', 'Blueberry Soda', 'Rootbeer Float', 'Bubblegum Soda', 'Lychee Soda', 'Green Apple Soda', 'Raspberry Soda', 'Passion Soda', 'Kiwi Soda'];
    v_milkshake_flavors text[] := ARRAY['Oreo in a Cup', 'Kitkat', 'Avocado Shake', 'Strawberry Shake', 'Mango Shake'];
    v_cheesecake_flavors text[] := ARRAY['Oreo Cheesecake', 'Blueberry Cheesecake', 'Strawberry Cheesecake', 'Mango Cheesecake', 'Avocado Cheesecake'];
    v_yogurt_flavors text[] := ARRAY['Mango Yogurt', 'Strawberry Yogurt', 'Blueberry Yogurt'];
BEGIN
    -- Insert Categories
    INSERT INTO categories (id, name, icon, sort_order, active) VALUES 
    (v_burger_cat_id, 'Burger', '🍔', 10, true),
    (v_hotdog_cat_id, 'Hotdogs', '🌭', 11, true),
    (v_eggdrop_cat_id, 'Eggdrop', '🥪', 12, true),
    (v_snacks_cat_id, 'Fries, Nachos & Onion Rings', '🍟', 13, true),
    (v_pasta_cat_id, 'Pasta', '🍝', 14, true),
    (v_milktea_cat_id, 'Milk Tea', '🧋', 15, true),
    (v_fruittea_cat_id, 'Fruit Tea', '🍹', 16, true),
    (v_fruitsoda_cat_id, 'Fruit Soda', '🥤', 17, true),
    (v_milkshake_cat_id, 'Milkshake', '🥤', 18, true),
    (v_cheesecake_cat_id, 'Cheesecake', '🍰', 19, true),
    (v_premiums_cat_id, 'Premiums', '🌟', 20, true),
    (v_coffee_cat_id, 'Coffee', '☕', 21, true),
    (v_yogurt_cat_id, 'Yogurt', '🍦', 22, true),
    (v_wings_cat_id, 'Chicken Wings', '🍗', 9, true)
    ON CONFLICT (id) DO NOTHING;

    -- 1. BURGERS
    INSERT INTO menu_items (name, description, base_price, category, popular) VALUES
    ('Classic Burger', '100% Beef Patty with fresh lettuce and tomatoes', 109, v_burger_cat_id, true),
    ('Cheese Burger', 'Classic burger with melted cheddar cheese', 99, v_burger_cat_id, false),
    ('Chicken Burger', 'Crispy chicken fillet with special sauce', 109, v_burger_cat_id, true),
    ('Smash Burger', 'Smashed beef patty, crispy edges, juicy center', 140, v_burger_cat_id, true),
    ('Hawaiian Burger', 'Beef patty topped with grilled pineapple', 150, v_burger_cat_id, false),
    ('Cheesy Bacon', 'Beef patty with bacon and loads of cheese', 130, v_burger_cat_id, false),
    ('Chili Burger', 'Spicy beef patty with chili sauce', 150, v_burger_cat_id, false),
    ('1 pc Burger Steak', 'Served with rice and mushroom gravy', 79, v_burger_cat_id, false),
    ('2 pcs Burger Steak', 'Served with rice and mushroom gravy', 149, v_burger_cat_id, false);

    -- 2. HOTDOGS
    INSERT INTO menu_items (name, description, base_price, category, popular) VALUES
    ('Chili-Dog Classic', 'Classic hotdog with chili con carne', 99, v_hotdog_cat_id, false),
    ('Chili-Dog Jalapeno', 'Spicy hotdog with jalapenos', 109, v_hotdog_cat_id, false);

    -- 3. EGGDROP
    INSERT INTO menu_items (name, description, base_price, category, popular) VALUES
    ('Regular Egglicious', 'Fluffy scrambled eggs in brioche toast', 100, v_eggdrop_cat_id, false),
    ('Spam Egglicious', 'Spam and fluffy eggs', 100, v_eggdrop_cat_id, false),
    ('Ham Egglicious', 'Ham and fluffy eggs', 100, v_eggdrop_cat_id, false),
    ('Bacon Egglicious', 'Bacon and fluffy eggs', 100, v_eggdrop_cat_id, false),
    ('Spam & Cheesy', 'Spam with extra cheese', 120, v_eggdrop_cat_id, false),
    ('Bacon & Cheesy', 'Bacon with extra cheese', 120, v_eggdrop_cat_id, false),
    ('Ham & Cheesy', 'Ham with extra cheese', 120, v_eggdrop_cat_id, false),
    ('Burger & Cheesy', 'Burger patty with extra cheese', 130, v_eggdrop_cat_id, false);

    -- 4. SNACKS
    INSERT INTO menu_items (name, description, base_price, category, popular) VALUES
    ('Cheese Fries', 'Crispy fries with cheese powder', 50, v_snacks_cat_id, false),
    ('BBQ Fries', 'Crispy fries with BBQ flavor', 50, v_snacks_cat_id, false),
    ('Spicy BBQ Fries', 'Crispy fries with spicy BBQ flavor', 50, v_snacks_cat_id, false),
    ('Fries Overload', 'Fries loaded with toppings', 99, v_snacks_cat_id, true),
    ('Nachos', 'Crispy nachos with beef, cheese, and salsa', 85, v_snacks_cat_id, true),
    ('Onion Rings', 'Golden crispy onion rings', 70, v_snacks_cat_id, false);

    -- 5. PASTA
    INSERT INTO menu_items (name, description, base_price, category, popular) VALUES
    ('Creamy Carbonara', 'Creamy white sauce pasta with bacon', 89, v_pasta_cat_id, false),
    ('Charlie-Chan', 'Spicy oriental pasta', 89, v_pasta_cat_id, true),
    ('Spaghetti', 'Classic Filipino style sweet spaghetti', 89, v_pasta_cat_id, false);

    -- 6. MILK TEA LOOP
    FOREACH v_item_name IN ARRAY v_milktea_flavors
    LOOP
        INSERT INTO menu_items (name, base_price, category, popular, description)
        VALUES (v_item_name, 70, v_milktea_cat_id, false, 'Premium Milk Tea')
        RETURNING id INTO v_item_id;

        INSERT INTO variations (menu_item_id, name, price) VALUES
        (v_item_id, 'Medium', 70), (v_item_id, 'Large', 80), (v_item_id, 'Extra Large', 120);
        
        INSERT INTO add_ons (menu_item_id, name, price, category) VALUES
        (v_item_id, 'Nata', 15, 'Sinkers'), (v_item_id, 'Pearl', 15, 'Sinkers'), (v_item_id, 'Pudding', 15, 'Sinkers'), 
        (v_item_id, 'Popping Boba', 15, 'Sinkers'), (v_item_id, 'Coffee Jelly', 15, 'Sinkers'), 
        (v_item_id, 'Rainbow Jelly', 15, 'Sinkers'), (v_item_id, 'Cream Cheese', 15, 'Sinkers');
    END LOOP;

    -- 7. FRUIT TEA LOOP
    FOREACH v_item_name IN ARRAY v_fruittea_flavors
    LOOP
        INSERT INTO menu_items (name, base_price, category, popular, description)
        VALUES (v_item_name, 70, v_fruittea_cat_id, false, 'Refreshing Fruit Tea')
        RETURNING id INTO v_item_id;

        INSERT INTO variations (menu_item_id, name, price) VALUES
        (v_item_id, 'Medium', 70), (v_item_id, 'Large', 80), (v_item_id, 'Extra Large', 120);
    END LOOP;

    -- 8. FRUIT SODA LOOP
    FOREACH v_item_name IN ARRAY v_fruitsoda_flavors
    LOOP
        INSERT INTO menu_items (name, base_price, category, popular, description)
        VALUES (v_item_name, 70, v_fruitsoda_cat_id, false, 'Sparkling Fruit Soda')
        RETURNING id INTO v_item_id;

        INSERT INTO variations (menu_item_id, name, price) VALUES
        (v_item_id, 'Medium', 70), (v_item_id, 'Large', 80), (v_item_id, 'Extra Large', 120);
    END LOOP;

    -- 9. MILKSHAKE LOOP
    FOREACH v_item_name IN ARRAY v_milkshake_flavors
    LOOP
        INSERT INTO menu_items (name, base_price, category, popular, description)
        VALUES (v_item_name, 90, v_milkshake_cat_id, false, 'Creamy Milkshake')
        RETURNING id INTO v_item_id;

        INSERT INTO variations (menu_item_id, name, price) VALUES (v_item_id, 'Large', 90);
    END LOOP;

    -- 10. CHEESECAKE LOOP
    FOREACH v_item_name IN ARRAY v_cheesecake_flavors
    LOOP
        INSERT INTO menu_items (name, base_price, category, popular, description)
        VALUES (v_item_name, 85, v_cheesecake_cat_id, false, 'Rich Cheesecake Series')
        RETURNING id INTO v_item_id;

        INSERT INTO variations (menu_item_id, name, price) VALUES (v_item_id, 'Medium', 85), (v_item_id, 'Large', 95);
    END LOOP;

    -- 11. PREMIUMS
    INSERT INTO menu_items (name, base_price, category, popular, description) VALUES ('Meiji Apollo', 85, v_premiums_cat_id, false, 'Premium Drink') RETURNING id INTO v_item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES (v_item_id, 'Medium', 85), (v_item_id, 'Large', 95);

    INSERT INTO menu_items (name, base_price, category, popular, description) VALUES ('Milo G', 100, v_premiums_cat_id, false, 'Premium Drink') RETURNING id INTO v_item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES (v_item_id, 'Medium', 100), (v_item_id, 'Large', 110);

    -- 12. COFFEE
     INSERT INTO menu_items (name, base_price, category, popular, description) 
     VALUES ('Caramel Macchiato Coffee', 80, v_coffee_cat_id, false, 'Hot/Cold Coffee'),
            ('Thai Coffee', 80, v_coffee_cat_id, false, 'Hot/Cold Coffee'),
            ('Hazelnut Latte', 80, v_coffee_cat_id, false, 'Hot/Cold Coffee'),
            ('Matcha Coffee Latte', 80, v_coffee_cat_id, false, 'Hot/Cold Coffee'),
            ('Baileys', 80, v_coffee_cat_id, false, 'Hot/Cold Coffee');

    -- 13. YOGURT LOOP
    FOREACH v_item_name IN ARRAY v_yogurt_flavors
    LOOP
        INSERT INTO menu_items (name, base_price, category, popular, description)
        VALUES (v_item_name, 80, v_yogurt_cat_id, false, 'Fresh Yogurt Drink')
        RETURNING id INTO v_item_id;

        INSERT INTO variations (menu_item_id, name, price) VALUES (v_item_id, 'Medium', 80), (v_item_id, 'Large', 90);
    END LOOP;

    -- 14. CHICKEN WINGS (Special Add)
    INSERT INTO menu_items (name, description, base_price, category, popular, flavors)
    VALUES ('Chicken Wings', 'Crispy fried chicken wings with your choice of flavor', 149, v_wings_cat_id, true, ARRAY['Plain', 'BBQ', 'Hot & Spicy', 'Garlic Parmesan', 'Honey Butter', 'Buffalo', 'Sweet Chili', 'Soy Garlic'])
    RETURNING id INTO v_item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES (v_item_id, '6 pcs', 149), (v_item_id, '12 pcs', 279);

END $$;
