import React, { useState } from "react";
import { ArrowLeft, Upload, Loader2, Check, Lock } from "lucide-react";
import { supabase } from "../utils/supabase";
import { toast } from "sonner";

interface AdminPanelProps {
  onClose: () => void;
}

const CATEGORIES_LIST = [
  "ХУДИ/ЗИПКИ",
  "ЖАКЕТЫ",
  "ОБУВЬ",
  "ДЖИНСЫ",
  "ФУТБОЛКИ",
  "ЛОНГИ/СВИТШОТЫ",
  "СУМКИ",
  "АКСЕССУАРЫ",
  "ШТАНЫ",
  "ГОЛОВНЫЕ УБОРЫ",
  "РЕМНИ",
  "БОМБЕРЫ",
  "ПУХОВИКИ",
];

const SIZES_LIST = ["OS", "44", "46", "48", "50", "52", "54"];
const COLORS_LIST = ["ЧЕРНЫЙ", "БЕЛЫЙ", "СЕРЫЙ", "ХАКИ", "БОРДОВЫЙ"];

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES_LIST[0]);
  const [price, setPrice] = useState("€ ");
  const [description, setDescription] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["OS"]);
  const [selectedColors, setSelectedColors] = useState<string[]>(["ЧЕРНЫЙ"]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const envPassword = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";
    if (password === envPassword) {
      setIsAuthenticated(true);
      toast.success("Доступ разрешен");
    } else {
      toast.error("Неверный пароль администратора");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      toast.error("Supabase не настроен. Проверьте файл .env");
      return;
    }

    if (!name.trim()) return toast.error("Введите название товара");
    if (!price.trim()) return toast.error("Введите цену");
    if (!imageFile) return toast.error("Загрузите изображение товара");

    setIsLoading(true);

    try {
      // 1. Загрузка файла в Supabase Storage (бакет product-images)
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, imageFile);

      if (uploadError) {
        throw new Error(`Ошибка загрузки изображения: ${uploadError.message}`);
      }

      // 2. Получение публичной ссылки на изображение
      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      // 3. Создание записи в таблице products
      const { error: dbError } = await supabase.from("products").insert([
        {
          name: name.toUpperCase(),
          category,
          price,
          image_url: imageUrl,
          is_new: isNew,
          description,
          sizes: selectedSizes,
          colors: selectedColors,
        },
      ]);

      if (dbError) {
        throw new Error(`Ошибка сохранения в базу данных: ${dbError.message}`);
      }

      toast.success("Товар успешно добавлен в каталог!");
      
      // Сброс формы
      setName("");
      setPrice("€ ");
      setDescription("");
      setIsNew(false);
      setSelectedSizes(["OS"]);
      setSelectedColors(["ЧЕРНЫЙ"]);
      setImageFile(null);
      setImagePreview(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Произошла непредвиденная ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col justify-center items-center p-6 uppercase font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 hover:opacity-50 transition-opacity cursor-pointer"
        >
          <ArrowLeft strokeWidth={1} className="w-6 h-6" />
        </button>

        <div className="w-full max-w-sm flex flex-col gap-6 text-center">
          <div className="flex justify-center">
            <Lock strokeWidth={1} className="w-12 h-12 text-black" />
          </div>
          <div>
            <h1 className="text-xl tracking-[0.3em] font-light mb-1">UNDERBUY ADMIN</h1>
            <p className="text-[10px] tracking-widest text-gray-400">панель управления каталогом</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="ВВЕДИТЕ ПАРОЛЬ"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-black px-4 py-3 text-xs tracking-[0.2em] text-center focus:outline-none focus:ring-1 focus:ring-black"
              autoFocus
            />
            <button
              type="submit"
              className="bg-black text-white py-3 text-xs tracking-[0.2em] hover:bg-gray-800 transition-colors cursor-pointer"
            >
              ВОЙТИ
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-6 md:p-12 uppercase font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center pb-8 border-b border-gray-200 mb-8">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-[10px] tracking-[0.2em] hover:opacity-50 transition-opacity cursor-pointer"
          >
            <ArrowLeft strokeWidth={1} className="w-5 h-5" />
            <span>В КАТАЛОГ</span>
          </button>
          <h1 className="text-lg tracking-[0.3em] font-light">ДОБАВИТЬ ТОВАР</h1>
          <div className="w-24"></div> {/* Spacer to center title */}
        </header>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column: Image Upload & Preview */}
          <div className="flex flex-col gap-6">
            <h2 className="text-[10px] text-gray-400 tracking-[0.2em]">ИЗОБРАЖЕНИЕ</h2>
            
            <div className="border border-dashed border-gray-300 relative aspect-[3/4] bg-gray-50 flex flex-col justify-center items-center p-6 group transition-colors hover:border-black">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover absolute inset-0"
                  />
                  <label className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm border border-black text-center py-2 text-[10px] tracking-[0.2em] cursor-pointer hover:bg-black hover:text-white transition-all">
                    ИЗМЕНИТЬ ФОТО
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </>
              ) : (
                <label className="flex flex-col items-center gap-4 cursor-pointer text-center">
                  <Upload strokeWidth={1} className="w-8 h-8 text-gray-400 group-hover:text-black transition-colors" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] tracking-[0.1em] text-gray-500 group-hover:text-black transition-colors">
                      ВЫБЕРИТЕ ФАЙЛ С ИЗОБРАЖЕНИЕМ
                    </span>
                    <span className="text-[8px] tracking-[0.1em] text-gray-400">
                      PNG, JPG ИЛИ WEBP ДО 5MB
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Right Column: Fields */}
          <div className="flex flex-col gap-8">
            {/* Title */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-gray-400 tracking-[0.2em]">НАЗВАНИЕ ТОВАРА</label>
              <input
                type="text"
                placeholder="НАПРИМЕР: ARCHIVE JACKET 01"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-b border-gray-200 py-2 text-xs tracking-[0.1em] focus:outline-none focus:border-black placeholder:text-gray-300"
              />
            </div>

            {/* Category and Price */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-gray-400 tracking-[0.2em]">КАТЕГОРИЯ</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border-b border-gray-200 py-2 text-xs tracking-[0.1em] bg-transparent focus:outline-none focus:border-black rounded-none cursor-pointer"
                >
                  {CATEGORIES_LIST.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-gray-400 tracking-[0.2em]">ЦЕНА</label>
                <input
                  type="text"
                  placeholder="€ 1 200"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="border-b border-gray-200 py-2 text-xs tracking-[0.1em] focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-gray-400 tracking-[0.2em]">ОПИСАНИЕ</label>
              <textarea
                placeholder="КОНСТРУКЦИЯ ИЗ ПЛОТНОГО ХЛОПКА..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="border-b border-gray-200 py-2 text-xs tracking-[0.1em] focus:outline-none focus:border-black resize-none placeholder:text-gray-300 normal-case"
              />
            </div>

            {/* Sizes */}
            <div className="flex flex-col gap-3">
              <label className="text-[10px] text-gray-400 tracking-[0.2em]">РАЗМЕРЫ В НАЛИЧИИ</label>
              <div className="flex flex-wrap gap-2">
                {SIZES_LIST.map((size) => {
                  const active = selectedSizes.includes(size);
                  return (
                    <button
                      type="button"
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`border px-3 py-2 text-[10px] tracking-[0.1em] transition-colors cursor-pointer ${
                        active
                          ? "border-black bg-black text-white"
                          : "border-gray-200 text-gray-400 hover:border-black hover:text-black"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors */}
            <div className="flex flex-col gap-3">
              <label className="text-[10px] text-gray-400 tracking-[0.2em]">ЦВЕТА В НАЛИЧИИ</label>
              <div className="flex flex-wrap gap-2">
                {COLORS_LIST.map((color) => {
                  const active = selectedColors.includes(color);
                  return (
                    <button
                      type="button"
                      key={color}
                      onClick={() => toggleColor(color)}
                      className={`border px-3 py-2 text-[10px] tracking-[0.1em] transition-colors cursor-pointer ${
                        active
                          ? "border-black bg-black text-white"
                          : "border-gray-200 text-gray-400 hover:border-black hover:text-black"
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Is New Tag */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isNew"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="w-4 h-4 border border-black checked:bg-black rounded-none cursor-pointer focus:ring-0"
              />
              <label
                htmlFor="isNew"
                className="text-[10px] tracking-[0.2em] cursor-pointer select-none"
              >
                ОТМЕТИТЬ КАК НОВИНКУ (NEW)
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-4 text-xs tracking-[0.2em] hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>СОХРАНЕНИЕ...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>ОПУБЛИКОВАТЬ ТОВАР</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
