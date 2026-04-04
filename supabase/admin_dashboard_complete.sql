-- Admin Dashboard Complete SQL File
-- Includes: Schema, Functions, Triggers, RLS Policies, and Initial Seed Data

-- 1. UTILITY FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. TABLES CREATION

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  base_price decimal(10,2) NOT NULL,
  category text REFERENCES categories(id) ON DELETE CASCADE,
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

-- Variations Table
CREATE TABLE IF NOT EXISTS variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add-ons Table
CREATE TABLE IF NOT EXISTS add_ons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  category text NOT NULL, -- e.g., 'Sinkers', 'Extras'
  created_at timestamptz DEFAULT now()
);

-- Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
  id text PRIMARY KEY,
  name text NOT NULL,
  account_number text NOT NULL,
  account_name text NOT NULL,
  qr_code_url text NOT NULL,
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id text PRIMARY KEY,
  value text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Orders Table
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

-- Order Items Table
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

-- 3. SECURITY (RLS Policies)

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Categories & Menu Items (Read: Public, Write: Admin)
CREATE POLICY "Public Read Categories" ON categories FOR SELECT TO public USING (true);
CREATE POLICY "Admin All Categories" ON categories FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Menu Items" ON menu_items FOR SELECT TO public USING (true);
CREATE POLICY "Admin All Menu Items" ON menu_items FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Variations" ON variations FOR SELECT TO public USING (true);
CREATE POLICY "Admin All Variations" ON variations FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Add-ons" ON add_ons FOR SELECT TO public USING (true);
CREATE POLICY "Admin All Add-ons" ON add_ons FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Payment Methods" ON payment_methods FOR SELECT TO public USING (true);
CREATE POLICY "Admin All Payment Methods" ON payment_methods FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Site Settings" ON site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Admin All Site Settings" ON site_settings FOR ALL TO public USING (true) WITH CHECK (true);

-- Orders & Order Items (Read/Write: Public/Anon)
CREATE POLICY "Anyone can select orders" ON orders FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update orders" ON orders FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete orders" ON orders FOR DELETE TO public USING (true);

CREATE POLICY "Anyone can select order items" ON order_items FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert order items" ON order_items FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update order items" ON order_items FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete order items" ON order_items FOR DELETE TO public USING (true);

-- 4. TRIGGERS
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. INITIAL SEED DATA
DO $$
DECLARE
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
    -- 5a. Categories
    INSERT INTO categories (id, name, icon, sort_order, active) VALUES 
    (v_wings_cat_id, 'Chicken Wings', '🍗', 9, true),
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
    (v_yogurt_cat_id, 'Yogurt', '🍦', 22, true)
    ON CONFLICT (id) DO NOTHING;

    -- 5b. Chicken Wings
    INSERT INTO menu_items (name, description, base_price, category, popular, available, flavors)
    VALUES ('Chicken Wings', 'Crispy fried chicken wings with your choice of flavor', 149, v_wings_cat_id, true, true, ARRAY['Plain', 'BBQ', 'Hot & Spicy', 'Garlic Parmesan', 'Honey Butter', 'Buffalo', 'Sweet Chili', 'Soy Garlic'])
    RETURNING id INTO v_item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES (v_item_id, '6 pcs', 149), (v_item_id, '12 pcs', 279);

    -- 5c. Burgers
    INSERT INTO menu_items (name, description, base_price, category, popular, available) VALUES
    ('Classic Burger', '100% Beef Patty with fresh lettuce and tomatoes', 109, v_burger_cat_id, true, true),
    ('Cheese Burger', 'Classic burger with melted cheddar cheese', 99, v_burger_cat_id, false, true),
    ('Chicken Burger', 'Crispy chicken fillet with special sauce', 109, v_burger_cat_id, true, true),
    ('Smash Burger', 'Smashed beef patty, crispy edges, juicy center', 140, v_burger_cat_id, true, true),
    ('Hawaiian Burger', 'Beef patty topped with grilled pineapple', 150, v_burger_cat_id, false, true),
    ('Cheesy Bacon', 'Beef patty with bacon and loads of cheese', 130, v_burger_cat_id, false, true),
    ('Chili Burger', 'Spicy beef patty with chili sauce', 150, v_burger_cat_id, false, true),
    ('1 pc Burger Steak', 'Served with rice and mushroom gravy', 79, v_burger_cat_id, false, true),
    ('2 pcs Burger Steak', 'Served with rice and mushroom gravy', 149, v_burger_cat_id, false, true);

    -- 5d. Eggdrop
    INSERT INTO menu_items (name, description, base_price, category, popular, available) VALUES
    ('Regular Egglicious', 'Fluffy scrambled eggs in brioche toast', 100, v_eggdrop_cat_id, false, true),
    ('Spam Egglicious', 'Spam and fluffy eggs', 100, v_eggdrop_cat_id, false, true),
    ('Ham Egglicious', 'Ham and fluffy eggs', 100, v_eggdrop_cat_id, false, true),
    ('Bacon Egglicious', 'Bacon and fluffy eggs', 100, v_eggdrop_cat_id, false, true),
    ('Spam & Cheesy', 'Spam with extra cheese', 120, v_eggdrop_cat_id, false, true),
    ('Bacon & Cheesy', 'Bacon with extra cheese', 120, v_eggdrop_cat_id, false, true),
    ('Ham & Cheesy', 'Ham with extra cheese', 120, v_eggdrop_cat_id, false, true),
    ('Burger & Cheesy', 'Burger patty with extra cheese', 130, v_eggdrop_cat_id, false, true);

    -- 5e. Milk Tea Loop
    FOREACH v_item_name IN ARRAY v_milktea_flavors
    LOOP
        INSERT INTO menu_items (name, base_price, category, popular, available, description)
        VALUES (v_item_name, 70, v_milktea_cat_id, false, true, 'Premium Milk Tea')
        RETURNING id INTO v_item_id;
        INSERT INTO variations (menu_item_id, name, price) VALUES (v_item_id, 'Medium', 70), (v_item_id, 'Large', 80), (v_item_id, 'Extra Large', 120);
        INSERT INTO add_ons (menu_item_id, name, price, category) VALUES
        (v_item_id, 'Nata', 15, 'Sinkers'), (v_item_id, 'Pearl', 15, 'Sinkers'), (v_item_id, 'Pudding', 15, 'Sinkers'),
        (v_item_id, 'Popping Boba', 15, 'Sinkers'), (v_item_id, 'Coffee Jelly', 15, 'Sinkers'), (v_item_id, 'Rainbow Jelly', 15, 'Sinkers'), (v_item_id, 'Cream Cheese', 15, 'Sinkers');
    END LOOP;

    -- 5f. Site Settings
    INSERT INTO site_settings (id, value, type, description) VALUES
      ('site_name', 'Tea Max Milk Tea Hub', 'text', 'The name of the cafe/restaurant'),
      ('site_logo', 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop', 'image', 'The logo image URL for the site'),
      ('site_description', 'Simple ingredients, exceptional taste. Discover our curated selection of handcrafted beverages at Tea Max Milk Tea Hub.', 'text', 'Short description of the cafe'),
      ('site_tagline', 'Milk Tea Hub', 'text', 'Short tagline shown under the site name'),
      ('currency', '₱', 'text', 'Currency symbol for prices'),
      ('currency_code', 'PHP', 'text', 'Currency code for payments'),
      ('hero_image', 'https://images.unsplash.com/photo-1544787210-22dbdc1763f6?q=80&w=2070&auto=format&fit=crop', 'image', 'Hero section background image'),
      ('hero_title', 'Pure Milk Tea &', 'text', 'Hero section main title'),
      ('hero_subtitle', 'Finest Coffee', 'text', 'Hero section subtitle'),
      ('hero_description', 'Simple ingredients, exceptional taste. Discover our curated selection of handcrafted beverages at Tea Max Milk Tea Hub.', 'text', 'Hero section description text'),
      ('store_hours', '06:00 AM - 10:00 PM', 'text', 'Store operating hours'),
      ('contact_number', '0945 210 6254', 'text', 'Contact phone number'),
      ('address', 'Purok 3 Barangay Trenchera, Tayug Pangasinan', 'text', 'Store address'),
      ('facebook_url', 'https://www.facebook.com/teamaxmilkteahub', 'text', 'Facebook page URL'),
      ('facebook_handle', '@teamaxmilkteahub', 'text', 'Facebook page handle')
    ON CONFLICT (id) DO NOTHING;

END $$;
