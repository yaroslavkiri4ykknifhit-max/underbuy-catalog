-- SQL-скрипт для настройки базы данных и хранилища в Supabase
-- Скопируйте этот код и выполните его в разделе SQL Editor в панели управления Supabase.

-- 1. Создание таблицы товаров (products)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price TEXT NOT NULL,
    image_url TEXT NOT NULL,
    is_new BOOLEAN DEFAULT false,
    description TEXT,
    sizes TEXT[] DEFAULT '{}',
    colors TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Создание таблицы заказов (orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_telegram TEXT,
    delivery_address TEXT NOT NULL,
    comment TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_price TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Включение Row Level Security (RLS) для безопасности (опционально, но рекомендуется)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Создание политик доступа для products
-- Разрешить всем читать товары (анонимные пользователи)
CREATE POLICY "Allow public read access to products" 
ON public.products FOR SELECT 
USING (true);

-- Разрешить вставку товаров (для админ-панели)
-- Примечание: Для продакшена лучше использовать авторизацию, но для простоты разрешаем вставку
CREATE POLICY "Allow public insert access to products" 
ON public.products FOR INSERT 
WITH CHECK (true);

-- Создание политик доступа для orders
-- Разрешить клиентам отправлять заказы (анонимная вставка)
CREATE POLICY "Allow public insert access to orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- Разрешить чтение заказов (для админки / отслеживания)
CREATE POLICY "Allow public read access to orders" 
ON public.orders FOR SELECT 
USING (true);

-- 3. Настройка хранилища Supabase Storage для картинок товаров
-- Создаем публичный бакет "product-images"
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Политика для публичного скачивания изображений
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- Политика для загрузки изображений (для админки)
CREATE POLICY "Allow uploads to product-images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images');
