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

-- Standardized policies for anon and authenticated
CREATE POLICY "Public read" ON categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read" ON menu_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read" ON variations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read" ON add_ons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read" ON site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read" ON payment_methods FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Public read" ON orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read" ON order_items FOR SELECT TO anon, authenticated USING (true);

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

-- Categories
INSERT INTO categories (id, name, icon, sort_order, active) VALUES 
('burger', 'Burger', '🍔', 10, true),
('hotdogs', 'Hotdogs', '🌭', 11, true),
('eggdrop', 'Eggdrop', 'sandwich', 12, true),
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
ON CONFLICT (id) DO NOTHING;

-- Menu Items (Burgers, Hotdogs, Eggdrop, Snacks, Pasta)
INSERT INTO menu_items (name, description, base_price, category, popular) VALUES
('Classic Burger', '100% Beef Patty with fresh lettuce and tomatoes', 109, 'burger', true),
('Cheese Burger', 'Classic burger with melted cheddar cheese', 99, 'burger', false),
('Chicken Burger', 'Crispy chicken fillet with special sauce', 109, 'burger', true),
('Smash Burger', 'Smashed beef patty, crispy edges, juicy center', 140, 'burger', true),
('Hawaiian Burger', 'Beef patty topped with grilled pineapple', 150, 'burger', false),
('Cheesy Bacon', 'Beef patty with bacon and loads of cheese', 130, 'burger', false),
('Chili Burger', 'Spicy beef patty with chili sauce', 150, 'burger', false),
('1 pc Burger Steak', 'Served with rice and mushroom gravy', 79, 'burger', false),
('2 pcs Burger Steak', 'Served with rice and mushroom gravy', 149, 'burger', false),
('Chili-Dog Classic', 'Classic hotdog with chili con carne', 99, 'hotdogs', false),
('Chili-Dog Jalapeno', 'Spicy hotdog with jalapenos', 109, 'hotdogs', false),
('Regular Egglicious', 'Fluffy scrambled eggs in brioche toast', 100, 'eggdrop', false),
('Spam Egglicious', 'Spam and fluffy eggs', 100, 'eggdrop', false),
('Ham Egglicious', 'Ham and fluffy eggs', 100, 'eggdrop', false),
('Bacon Egglicious', 'Bacon and fluffy eggs', 100, 'eggdrop', false),
('Spam & Cheesy', 'Spam with extra cheese', 120, 'eggdrop', false),
('Bacon & Cheesy', 'Bacon with extra cheese', 120, 'eggdrop', false),
('Ham & Cheesy', 'Ham with extra cheese', 120, 'eggdrop', false),
('Burger & Cheesy', 'Burger patty with extra cheese', 130, 'eggdrop', false),
('Cheese Fries', 'Crispy fries with cheese powder', 50, 'fries-nachos', false),
('BBQ Fries', 'Crispy fries with BBQ flavor', 50, 'fries-nachos', false),
('Spicy BBQ Fries', 'Crispy fries with spicy BBQ flavor', 50, 'fries-nachos', false),
('Fries Overload', 'Fries loaded with toppings', 99, 'fries-nachos', true),
('Nachos', 'Crispy nachos with beef, cheese, and salsa', 85, 'fries-nachos', true),
('Onion Rings', 'Golden crispy onion rings', 70, 'fries-nachos', false),
('Creamy Carbonara', 'Creamy white sauce pasta with bacon', 89, 'pasta', false),
('Charlie-Chan', 'Spicy oriental pasta', 89, 'pasta', true),
('Spaghetti', 'Classic Filipino style sweet spaghetti', 89, 'pasta', false);

-- Chicken Wings
INSERT INTO menu_items (name, description, base_price, category, popular, flavors)
VALUES ('Chicken Wings', 'Crispy fried chicken wings with your choice of flavor', 149, 'chicken-wings', true, ARRAY['Plain', 'BBQ', 'Hot & Spicy', 'Garlic Parmesan', 'Honey Butter', 'Buffalo', 'Sweet Chili', 'Soy Garlic']);

-- Coffee
INSERT INTO menu_items (name, base_price, category, popular, description) 
VALUES ('Caramel Macchiato Coffee', 80, 'coffee-new', false, 'Hot/Cold Coffee'),
       ('Thai Coffee', 80, 'coffee-new', false, 'Hot/Cold Coffee'),
       ('Hazelnut Latte', 80, 'coffee-new', false, 'Hot/Cold Coffee'),
       ('Matcha Coffee Latte', 80, 'coffee-new', false, 'Hot/Cold Coffee'),
       ('Baileys', 80, 'coffee-new', false, 'Hot/Cold Coffee');

-- Variations for fixed items
INSERT INTO variations (menu_item_id, name, price)
SELECT id, '6 pcs', 0 FROM menu_items WHERE name = 'Chicken Wings'
UNION ALL
SELECT id, '12 pcs', 130 FROM menu_items WHERE name = 'Chicken Wings';

-- Bulk Menu Items for Drinks (Simplified mapping)
-- Note: Manually unrolled for performance and compatibility
INSERT INTO menu_items (name, base_price, category, popular, description)
SELECT f.name, 70, 'milk-tea', false, 'Premium Milk Tea' FROM (SELECT unnest(ARRAY['Avocado', 'Black Forrest', 'Blueberry', 'Cappuccino', 'Caramel', 'Caramel Macchiato', 'Choco Hazelnut', 'Choco Mousse', 'Choco Nutella', 'Coffee Caramel', 'Coffee Latte', 'Cookies & Cream', 'Dark Choco', 'Double Dutch', 'Hazelnut Macchiato', 'Hershey''s', 'Hokkaido', 'Honey Dew', 'Java Chips', 'Mocca', 'Nutella', 'Okinawa', 'Oreo', 'Pearl Milk Tea', 'Red Velvet', 'Salted Caramel', 'Taro', 'Thai', 'Tiramisu', 'Ube Matcha', 'Vanilla', 'White Rabbit', 'Wintermelon', 'Wintermelon Latte']) as name) f;

INSERT INTO menu_items (name, base_price, category, popular, description)
SELECT f.name, 70, 'fruit-tea', false, 'Refreshing Fruit Tea' FROM (SELECT unnest(ARRAY['Strawberry', 'Blueberry', 'Lemon', 'Mango', 'Kiwi', 'Lychee', 'Green Apple', 'Peach', 'Passion', 'Passion Mango', 'Peach Mango', 'Kiwi Lychee']) as name) f;

INSERT INTO menu_items (name, base_price, category, popular, description)
SELECT f.name, 70, 'fruit-soda', false, 'Sparkling Fruit Soda' FROM (SELECT unnest(ARRAY['Strawberry Soda', 'Blueberry Soda', 'Rootbeer Float', 'Bubblegum Soda', 'Lychee Soda', 'Green Apple Soda', 'Raspberry Soda', 'Passion Soda', 'Kiwi Soda']) as name) f;

-- Variations for drinks
INSERT INTO variations (menu_item_id, name, price)
SELECT id, 'Medium', 0 FROM menu_items WHERE category IN ('milk-tea', 'fruit-tea', 'fruit-soda');
INSERT INTO variations (menu_item_id, name, price)
SELECT id, 'Large', 10 FROM menu_items WHERE category IN ('milk-tea', 'fruit-tea', 'fruit-soda');
INSERT INTO variations (menu_item_id, name, price)
SELECT id, 'Extra Large', 50 FROM menu_items WHERE category IN ('milk-tea', 'fruit-tea', 'fruit-soda');

-- Add-ons for milk tea
INSERT INTO add_ons (menu_item_id, name, price, category)
SELECT id, 'Nata', 15, 'Sinkers' FROM menu_items WHERE category = 'milk-tea'
UNION ALL
SELECT id, 'Pearl', 15, 'Sinkers' FROM menu_items WHERE category = 'milk-tea'
UNION ALL
SELECT id, 'Cream Cheese', 15, 'Sinkers' FROM menu_items WHERE category = 'milk-tea';
