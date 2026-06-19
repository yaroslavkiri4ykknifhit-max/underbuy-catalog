import { useState, useEffect, useRef } from "react";
import { 
  Home, 
  Heart, 
  User, 
  Search, 
  Menu, 
  Plus, 
  Minus, 
  SlidersHorizontal, 
  X, 
  ArrowRight, 
  ShoppingBag, 
  Loader2,
  ChevronDown,
  LayoutGrid
} from "lucide-react";
import { supabase } from "./utils/supabase";
import CartDrawer, { CartItem, formatBYN, formatRUB, PriceDisplay } from "./components/ui/CartDrawer";
import AdminPanel from "./components/AdminPanel";
import { Toaster, toast } from "sonner";

const CATEGORIES = [
  "ВСЕ", "НАЛИЧИЕ", "ХУДИ/ЗИПКИ", "ЖАКЕТЫ", "ОБУВЬ", 
  "ДЖИНСЫ", "ФУТБОЛКИ", "ЛОНГИ/СВИТШОТЫ", "СУМКИ", 
  "АКСЕССУАРЫ", "ШТАНЫ", "ГОЛОВНЫЕ УБОРЫ", "РЕМНИ", 
  "БОМБЕРЫ", "ПУХОВИКИ"
];
const SIZES = ["OS", "44", "46", "48", "50", "52", "54"];
const COLORS = ["ЧЕРНЫЙ", "БЕЛЫЙ", "СЕРЫЙ", "ХАКИ", "БОРДОВЫЙ"];

const PRODUCTS_MOCK = [
  {
    id: 1,
    name: "ARCHIVE JACKET 01",
    brand: "UNDERBUY",
    category: "ЖАКЕТЫ",
    price: "€ 1 200",
    img: "https://images.unsplash.com/photo-1554882195-8cf792f9a571",
    isNew: true,
    aspect: "aspect-[4/5] md:aspect-[3/4]",
    span: "col-span-2 md:col-span-2",
    description: "Конструкция из плотного хлопка. Удлиненные рукава и асимметричная застежка-молния. Без подкладки для деконструированной посадки.",
    sizes: ["46", "48", "50"],
    colors: ["ЧЕРНЫЙ", "СЕРЫЙ"]
  },
  {
    id: 2,
    name: "VOID COAT",
    brand: "RICK OWENS",
    category: "ЖАКЕТЫ",
    price: "€ 2 450",
    img: "https://images.unsplash.com/photo-1595065666634-4725aa7e8379",
    isNew: false,
    aspect: "aspect-[3/4]",
    span: "col-span-1 md:col-span-1 md:mt-32",
    description: "Пальто из шерстяной смеси со структурированными плечами и полностью скрытой системой застежек. Брутальный подход к классическому крою.",
    sizes: ["48", "50", "52"],
    colors: ["ЧЕРНЫЙ"]
  },
  {
    id: 3,
    name: "STRUCTURE SHIRT",
    brand: "YOHJI YAMAMOTO",
    category: "ЛОНГИ/СВИТШОТЫ",
    price: "€ 850",
    img: "https://images.unsplash.com/photo-1645561305502-63a9ba09ab09",
    isNew: false,
    aspect: "aspect-[3/4]",
    span: "col-span-1 md:col-span-1",
    description: "Хрустящая поплиновая рубашка. Монохромная палитра с гипертрофированными пропорциями и необработанными краями.",
    sizes: ["OS", "44", "46"],
    colors: ["БЕЛЫЙ", "ЧЕРНЫЙ"]
  },
  {
    id: 4,
    name: "ARTEK STOOL 60",
    brand: "ARTEK",
    category: "АКСЕССУАРЫ",
    price: "€ 450",
    img: "https://images.unsplash.com/photo-1718049719671-3c0a592ac8c0",
    isNew: false,
    aspect: "aspect-square md:aspect-[16/9]",
    span: "col-span-2 md:col-span-2 mt-8 md:mt-0",
    description: "Переосмысленная классика. Табурет Artek Stool 60 с брутальной отделкой под бетон. Ультра-лимитированный тираж.",
    sizes: ["OS"],
    colors: ["СЕРЫЙ"]
  },
  {
    id: 5,
    name: "SILENT CHAIR",
    brand: "BALENCIAGA",
    category: "АКСЕССУАРЫ",
    price: "€ 1 100",
    img: "https://images.unsplash.com/photo-1554104683-c7063687d649",
    isNew: false,
    aspect: "aspect-[4/5]",
    span: "col-span-2 md:col-span-2",
    description: "Стул из холоднокатаного алюминия. Создан, чтобы существовать исключительно как молчаливый объект в пространстве. Тяжелый и бескомпромиссный.",
  }
];

const REVIEWS_MOCK = [
  {
    id: "r1",
    author: "Арсений",
    date: "2 нед. назад",
    rating: 5,
    text: "педали ахуенно подошли, бот бомбовый, доставка быстрая, за совет дяде лёше отдельный респект 🫶🫶🫶"
  },
  {
    id: "r2",
    author: "Владислав",
    date: "1 нед. назад",
    rating: 5,
    text: "куртка просто космос, качество вышка, доехала за 6 дней! продавцу респект за помощь с размером"
  },
  {
    id: "r3",
    author: "Кирилл",
    date: "3 дня назад",
    rating: 5,
    text: "все супер, доставка быстрая, шмот оригинальный, буду заказывать еще"
  },
  {
    id: "r4",
    author: "Артем",
    date: "2 дня назад",
    rating: 5,
    text: "заказал жилетку баленсиага, все проверили на оригинальность перед отправкой, очень доволен!"
  },
  {
    id: "r5",
    author: "Дмитрий",
    date: "5 дней назад",
    rating: 5,
    text: "доставка пушка, упаковано отлично. менеджер ответил на все тупые вопросы за 5 минут, респект!"
  }
];

function CustomSelect({ 
  label, 
  value, 
  options, 
  onChange 
}: { 
  label: string; 
  value: string; 
  options: string[]; 
  onChange: (val: string) => void; 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Закрывать список при клике вне его области
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1 flex flex-col gap-1 min-w-[100px]">
      <span className="text-[8px] tracking-[0.2em] text-gray-400 font-extrabold hidden md:block">
        {label}
      </span>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-black px-3 py-2.5 text-[9px] tracking-[0.2em] font-extrabold uppercase flex justify-between items-center cursor-pointer select-none rounded-none text-left"
      >
        <span className="truncate mr-2">{value}</span>
        <ChevronDown strokeWidth={1.5} className={`w-3.5 h-3.5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border border-black border-t-0 z-50 max-h-[126px] overflow-y-auto shadow-lg rounded-none scrollbar-thin">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2.5 text-[9px] tracking-[0.2em] font-extrabold text-left uppercase transition-colors rounded-none border-b border-gray-100 last:border-0 ${
                value === opt 
                  ? "bg-black text-white" 
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ 
  author, 
  rating = 5, 
  date, 
  text 
}: { 
  author: string; 
  rating?: number; 
  date: string; 
  text: string; 
}) {
  return (
    <div className="snap-start shrink-0 w-[85vw] md:w-[320px] border border-black bg-white p-5 flex flex-col justify-between gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex gap-0.5 text-black">
            {Array.from({ length: rating }).map((_, i) => (
              <span key={i} className="text-xs">★</span>
            ))}
          </div>
          <span className="text-[9px] tracking-[0.1em] text-gray-400 font-extrabold uppercase">{date}</span>
        </div>
        <p className="text-[10px] tracking-[0.05em] leading-relaxed text-gray-700 normal-case font-medium">
          {text}
        </p>
      </div>
      <span className="text-[10px] tracking-[0.1em] font-extrabold uppercase">{author}</span>
    </div>
  );
}

function FaqItem({ 
  question, 
  answer 
}: { 
  question: string; 
  answer: string; 
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-black bg-white select-none transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left cursor-pointer transition-colors hover:bg-gray-50"
      >
        <span className="text-[11px] tracking-[0.1em] font-black uppercase pr-4">{question}</span>
        <ChevronDown 
          strokeWidth={1.5} 
          className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[500px] border-t border-black p-4" : "max-h-0"}`}>
        <p className="text-[10px] tracking-[0.05em] text-gray-600 uppercase leading-relaxed font-bold">
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ВСЕ");
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeSize, setActiveSize] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Animation states for adding to cart
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isCartPop, setIsCartPop] = useState(false);

  // Sizing and Color selection in PDP
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activePdpImageIndex, setActivePdpImageIndex] = useState(0);

  // Cart and Modals State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Tab routing: "home" | "catalog" | "profile"
  const [activeTab, setActiveTab] = useState<"home" | "catalog" | "profile">("home");

  // Telegram WebApp states
  const [isTelegramAdmin, setIsTelegramAdmin] = useState(false);
  const [tgUser, setTgUser] = useState<any>(null);

  // Reviews states
  const [reviews, setReviews] = useState<any[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setTgUser(user);
        const adminId = import.meta.env.VITE_ADMIN_TELEGRAM_ID;
        if (adminId && String(user.id) === String(adminId)) {
          setIsTelegramAdmin(true);
        }
      }
    }
  }, []);
  
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("underbuy_cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Load products from Supabase
  useEffect(() => {
    async function loadProducts() {
      // Если ключи не заданы или являются плейсхолдерами, мгновенно показываем моки без ожидания сетевого таймаута
      const isPlaceholder = 
        !import.meta.env.VITE_SUPABASE_URL || 
        import.meta.env.VITE_SUPABASE_URL.includes("placeholder") ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY ||
        import.meta.env.VITE_SUPABASE_ANON_KEY === "placeholder";

      if (isPlaceholder) {
        setProducts(PRODUCTS_MOCK);
        setIsProductsLoading(false);
        return;
      }

      setIsProductsLoading(true);

      // Таймаут в 2.5 секунды для предотвращения долгого ожидания при медленной сети
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase timeout")), 2500)
      );

      try {
        const fetchPromise = supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        // Запуск гонки между запросом к БД и таймаутом
        const result: any = await Promise.race([fetchPromise, timeoutPromise]);

        if (result.error) throw result.error;

        if (result.data && result.data.length > 0) {
          setProducts(result.data);
        } else {
          setProducts(PRODUCTS_MOCK);
        }
      } catch (err) {
        console.warn("Using mock products (failed loading from Supabase / timeout):", err);
        setProducts(PRODUCTS_MOCK);
      } finally {
        setIsProductsLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Load reviews from Supabase
  useEffect(() => {
    async function loadReviews() {
      const isPlaceholder = 
        !import.meta.env.VITE_SUPABASE_URL || 
        import.meta.env.VITE_SUPABASE_URL.includes("placeholder") ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY ||
        import.meta.env.VITE_SUPABASE_ANON_KEY === "placeholder";

      if (isPlaceholder) {
        setReviews(REVIEWS_MOCK);
        setIsReviewsLoading(false);
        return;
      }

      setIsReviewsLoading(true);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase timeout")), 2500)
      );

      try {
        const fetchPromise = supabase
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false });

        const result: any = await Promise.race([fetchPromise, timeoutPromise]);

        if (result.error) throw result.error;

        if (result.data && result.data.length > 0) {
          setReviews([...result.data, ...REVIEWS_MOCK]);
        } else {
          setReviews(REVIEWS_MOCK);
        }
      } catch (err) {
        console.warn("Using mock reviews (failed loading from Supabase / timeout):", err);
        setReviews(REVIEWS_MOCK);
      } finally {
        setIsReviewsLoading(false);
      }
    }
    loadReviews();
  }, []);

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem("underbuy_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Lock body scroll when PDP or Admin panels are open
  useEffect(() => {
    if (selectedProduct || isAdminOpen || isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [selectedProduct, isAdminOpen, isCartOpen]);

  // Set default size and color when product is selected in PDP
  useEffect(() => {
    if (selectedProduct) {
      const productSizes = selectedProduct.sizes && selectedProduct.sizes.length > 0 
        ? selectedProduct.sizes 
        : SIZES;
      const productColors = selectedProduct.colors && selectedProduct.colors.length > 0 
        ? selectedProduct.colors 
        : COLORS;
      
      setSelectedSize(productSizes[0] || "OS");
      setSelectedColor(productColors[0] || "ЧЕРНЫЙ");
      setActivePdpImageIndex(0);
    } else {
      setSelectedSize(null);
      setSelectedColor(null);
      setActivePdpImageIndex(0);
    }
  }, [selectedProduct]);

  // Cart operations
  const handleAddToCart = () => {
    if (!selectedProduct) return;
    if (!selectedSize) {
      toast.error("Пожалуйста, выберите размер");
      return;
    }
    if (!selectedColor) {
      toast.error("Пожалуйста, выберите цвет");
      return;
    }

    setIsAddingToCart(true);

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => 
          item.id === selectedProduct.id && 
          item.size === selectedSize && 
          item.color === selectedColor
      );

      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += 1;
        return newCart;
      } else {
        return [
          ...prev,
          {
            id: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            img: (selectedProduct.images && selectedProduct.images.length > 0) ? selectedProduct.images[0] : (selectedProduct.image_url || selectedProduct.img),
            size: selectedSize,
            color: selectedColor,
            quantity: 1,
          },
        ];
      }
    });

    // Trigger pop animation for cart icons
    setIsCartPop(true);
    setTimeout(() => {
      setIsCartPop(false);
    }, 450);

    // Complete the adding sequence after 800ms
    setTimeout(() => {
      setIsAddingToCart(false);
      setSelectedProduct(null);
      setIsCartOpen(true);
    }, 800);
  };

  const handleUpdateQuantity = (id: string | number, size: string, color: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id && item.size === size && item.color === color) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string | number, size: string, color: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === id && item.size === size && item.color === color))
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Filter products based on selected category, brand, and search query
  const filteredProducts = products.filter((product) => {
    // Category filter
    if (activeCategory !== "ВСЕ") {
      if (product.category !== activeCategory) return false;
    }
    
    // Brand filter
    if (activeBrand && activeBrand !== "ВСЕ") {
      if (product.brand !== activeBrand) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchesName = product.name.toLowerCase().includes(query);
      const matchesBrand = product.brand && product.brand.toLowerCase().includes(query);
      const matchesCategory = product.category.toLowerCase().includes(query);
      const matchesDesc = product.description && product.description.toLowerCase().includes(query);
      if (!matchesName && !matchesBrand && !matchesCategory && !matchesDesc) return false;
    }

    return true;
  });

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white font-sans uppercase">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="flex justify-between items-center p-4 sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 h-[66px] md:h-[74px]">
        {isSearchOpen ? (
          <div className="flex-1 flex items-center gap-3 mx-2 animate-in fade-in duration-200">
            <Search strokeWidth={1} className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="ПОИСК ТОВАРА..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs tracking-[0.2em] focus:outline-none placeholder:text-gray-300 py-1"
              autoFocus
            />
            <button 
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery("");
              }}
              className="p-1 hover:opacity-50 transition-opacity cursor-pointer shrink-0"
            >
              <X strokeWidth={1} className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-[22px] md:text-[26px] tracking-[0.05em] font-black cursor-pointer select-none leading-none" onClick={() => {
              setActiveTab("home");
              setActiveCategory("ВСЕ");
              setIsAdminOpen(false);
            }}>
              UNDERBUY
            </h1>
            <div className="flex items-center gap-2">
              {/* Cart Icon in Header */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className={`p-2 group cursor-pointer relative ${isCartPop ? "animate-cart-pop" : ""}`}
              >
                <ShoppingBag strokeWidth={1} className="w-5 h-5 md:w-6 md:h-6 group-hover:opacity-50 transition-opacity" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {totalCartCount}
                  </span>
                )}
              </button>
              {activeTab === "catalog" && (
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 -mr-2 group cursor-pointer"
                >
                  <Search strokeWidth={1} className="w-5 h-5 md:w-6 md:h-6 group-hover:opacity-50 transition-opacity" />
                </button>
              )}
            </div>
          </>
        )}
      </header>

      {/* Categories & Filter Bar (Two Custom Minimalist Dropdowns) */}
      {activeTab === "catalog" && (
        <div className="sticky top-[65px] md:top-[73px] z-30 bg-white border-b border-gray-200 shadow-sm p-4 flex gap-4 w-full box-border">
          <CustomSelect 
            label="КАТЕГОРИЯ" 
            value={activeCategory} 
            options={CATEGORIES} 
            onChange={(val) => {
              setActiveCategory(val);
              setIsAdminOpen(false);
            }} 
          />
          <CustomSelect 
            label="БРЕНД" 
            value={activeBrand || "ВСЕ БРЕНДЫ"} 
            options={["ВСЕ БРЕНДЫ", ...(Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[])]} 
            onChange={(val) => {
              setActiveBrand(val === "ВСЕ БРЕНДЫ" ? null : val);
              setIsAdminOpen(false);
            }} 
          />
        </div>
      )}

      {/* Main Content */}
      <main className="pb-32 px-4 md:px-8 pt-6 overflow-x-hidden selection:bg-black selection:text-white">
        
        {/* TAB 1: HOME */}
        {activeTab === "home" && (
          <div className="flex flex-col gap-16 animate-in fade-in duration-300">
            {/* Landing Hero */}
            <div className="flex flex-col items-center justify-center text-center py-12 md:py-20 border-b border-gray-100">
              <h1 className="text-3xl md:text-5xl font-black tracking-[0.2em]">UNDERBUY</h1>
            </div>

            {/* 1. КАК ОФОРМИТЬ ЗАКАЗ */}
            <div className="flex flex-col gap-6">
              <h2 className="text-sm tracking-[0.2em] font-extrabold uppercase">КАК СДЕЛАТЬ ЗАКАЗ</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-extrabold text-xs shrink-0 select-none">1</div>
                  <div>
                    <h3 className="text-[11px] tracking-[0.1em] font-extrabold uppercase">Выбор вещей</h3>
                    <p className="text-[10px] tracking-[0.05em] text-gray-500 mt-1 uppercase leading-relaxed font-bold">Выберите нужные вещи в каталоге, настройте размер/цвет и добавьте их в корзину.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-extrabold text-xs shrink-0 select-none">2</div>
                  <div>
                    <h3 className="text-[11px] tracking-[0.1em] font-extrabold uppercase">Оформление</h3>
                    <p className="text-[10px] tracking-[0.05em] text-gray-500 mt-1 uppercase leading-relaxed font-bold">Перейдите в корзину, заполните форму с контактами и подтвердите заказ.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-extrabold text-xs shrink-0 select-none">3</div>
                  <div>
                    <h3 className="text-[11px] tracking-[0.1em] font-extrabold uppercase">Доставка</h3>
                    <p className="text-[10px] tracking-[0.05em] text-gray-500 mt-1 uppercase leading-relaxed font-bold">Мы бережно упакуем ваш заказ и отправим его быстрой авиадоставкой.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-extrabold text-xs shrink-0 select-none">4</div>
                  <div>
                    <h3 className="text-[11px] tracking-[0.1em] font-extrabold uppercase">Получение</h3>
                    <p className="text-[10px] tracking-[0.05em] text-gray-500 mt-1 uppercase leading-relaxed font-bold">Получите уведомление от менеджера в Telegram и заберите свой заказ.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. ОТЗЫВЫ */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm tracking-[0.2em] font-extrabold uppercase">ОТЗЫВЫ</h2>
                <div className="flex items-center gap-1.5 select-none">
                  <span className="text-xs">★</span>
                  <span className="text-[10px] tracking-[0.1em] font-extrabold">5.0</span>
                  <span className="text-[10px] tracking-[0.1em] text-gray-400 font-extrabold ml-1 uppercase">{reviews.length} ОТЗЫВОВ</span>
                </div>
              </div>
              
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-none">
                {reviews.map((rev) => (
                  <ReviewCard 
                    key={rev.id || `${rev.author}-${rev.created_at}`}
                    author={rev.author} 
                    date={rev.date} 
                    rating={rev.rating}
                    text={rev.text} 
                  />
                ))}
              </div>
            </div>

            {/* 3. ЧАСТЫЕ ВОПРОСЫ (FAQ) */}
            <div className="flex flex-col gap-6">
              <h2 className="text-sm tracking-[0.2em] font-extrabold uppercase">ЧАСТЫЕ ВОПРОСЫ</h2>
              <div className="flex flex-col gap-4 max-w-2xl">
                <FaqItem 
                  question="Как оформить заказ?" 
                  answer="Добавьте выбранные товары в корзину, заполните контактные данные (ФИО, телефон, Telegram, адрес доставки) и подтвердите заказ. Наш менеджер свяжется с вами в Telegram для завершения заказа." 
                />
                <FaqItem 
                  question="Сколько стоит доставка?" 
                  answer="Стоимость доставки рассчитывается индивидуально в зависимости от вашего города и веса посылки. Для большинства городов Беларуси и России действует фиксированная стоимость экспресс-доставки." 
                />
                <FaqItem 
                  question="Как отследить заказ?" 
                  answer="После отправки заказа менеджер предоставит вам трек-номер для отслеживания посылки в реальном времени." 
                />
                <FaqItem 
                  question="Какие способы оплаты?" 
                  answer="Мы принимаем переводы на карту, электронные платежи и оплату наличными при получении. Подробные реквизиты предоставит менеджер." 
                />
                <FaqItem 
                  question="Через сколько я получу заказ?" 
                  answer="Авиадоставка обычно занимает от 5 до 10 рабочих дней с момента подтверждения и отправки заказа." 
                />
                <FaqItem 
                  question="Можно ли заказать, если товара нет на площадке?" 
                  answer="Да! Вы можете прислать ссылку или фото любого товара нашему менеджеру в Telegram, и мы найдем, выкупим и доставим его для вас." 
                />
                <FaqItem 
                  question="Когда нужно оплачивать заказ?" 
                  answer="Оплата производится при оформлении заказа. Также вы можете воспользоваться опцией разделения платежа." 
                />
                <FaqItem 
                  question="Что если нет всей суммы оплатить сразу, можно 50/50?" 
                  answer="Да, конечно! У нас доступна оплата частями 50/50: половину стоимости вы оплачиваете при оформлении заказа для его запуска в работу и бронирования, а оставшиеся 50% — при получении товара в руки." 
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CATALOG */}
        {activeTab === "catalog" && (
          <div className="animate-in fade-in duration-300">
            {/* Loading Indicator (Skeleton Screen with Shimmer) */}
            {isProductsLoading && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-16">
                <div className="col-span-2 md:col-span-2 flex flex-col gap-3">
                  <div className="w-full aspect-[4/5] md:aspect-[3/4] shimmer-effect" />
                  <div className="flex justify-between items-start mt-2">
                    <div className="flex flex-col gap-2 w-full">
                      <div className="h-3.5 w-2/3 shimmer-effect" />
                      <div className="h-3 w-1/3 shimmer-effect" />
                    </div>
                    <div className="h-3.5 w-12 shimmer-effect shrink-0 ml-4" />
                  </div>
                </div>
                
                <div className="col-span-1 md:col-span-1 md:mt-32 flex flex-col gap-3">
                  <div className="w-full aspect-[3/4] shimmer-effect" />
                  <div className="flex justify-between items-start mt-2">
                    <div className="flex flex-col gap-2 w-full">
                      <div className="h-3.5 w-2/3 shimmer-effect" />
                      <div className="h-3 w-1/3 shimmer-effect" />
                    </div>
                    <div className="h-3.5 w-12 shimmer-effect shrink-0 ml-4" />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-1 flex flex-col gap-3">
                  <div className="w-full aspect-[3/4] shimmer-effect" />
                  <div className="flex justify-between items-start mt-2">
                    <div className="flex flex-col gap-2 w-full">
                      <div className="h-3.5 w-2/3 shimmer-effect" />
                      <div className="h-3 w-1/3 shimmer-effect" />
                    </div>
                    <div className="h-3.5 w-12 shimmer-effect shrink-0 ml-4" />
                  </div>
                </div>

                <div className="col-span-2 md:col-span-2 flex flex-col gap-3">
                  <div className="w-full aspect-square md:aspect-[16/9] shimmer-effect" />
                  <div className="flex justify-between items-start mt-2">
                    <div className="flex flex-col gap-2 w-full">
                      <div className="h-3.5 w-2/3 shimmer-effect" />
                      <div className="h-3 w-1/3 shimmer-effect" />
                    </div>
                    <div className="h-3.5 w-12 shimmer-effect shrink-0 ml-4" />
                  </div>
                </div>
              </div>
            )}

            {!isProductsLoading && (
              <>
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-24 text-[10px] tracking-[0.2em] text-gray-400 font-extrabold">
                    ПО ВАШЕМУ ЗАПРОСУ НИЧЕГО НЕ НАЙДЕНО
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-16">
                    {filteredProducts.map((product) => {
                      const productImg = (product.images && product.images.length > 0) ? product.images[0] : (product.image_url || product.img);
                      const aspectClass = product.aspect || "aspect-[3/4]";
                      const spanClass = product.span || "col-span-1 md:col-span-1";

                      return (
                        <div 
                          key={product.id}
                          onClick={() => setSelectedProduct(product)}
                          className={`${spanClass} group cursor-pointer flex flex-col gap-3`}
                        >
                          <div className={`relative overflow-hidden w-full ${aspectClass} bg-gray-100`}>
                            <img 
                              src={productImg} 
                              alt={product.name} 
                              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${product.name === 'STRUCTURE SHIRT' ? 'grayscale' : ''}`}
                            />
                            {product.is_new && (
                              <div className="absolute top-4 left-4 bg-black text-white px-2 py-1 text-[8px] tracking-[0.2em] font-extrabold">
                                NEW
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between items-start mt-2">
                            <div className="flex flex-col gap-1">
                              {product.brand && (
                                <span className="text-[9px] tracking-[0.2em] text-gray-400 font-extrabold">{product.brand}</span>
                              )}
                              <h2 className="text-[11px] md:text-xs tracking-[0.1em] font-bold">{product.name}</h2>
                              <p className="text-[10px] tracking-[0.1em] text-gray-500 font-bold">{product.category}</p>
                            </div>
                            <PriceDisplay price={product.price} size="md" align="end" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 3: PROFILE */}
        {activeTab === "profile" && (
          <div className="max-w-md mx-auto w-full flex flex-col justify-between min-h-[50vh] pt-6 animate-in fade-in duration-300">
            <div className="flex flex-col gap-8">
              <div>
                <p className="text-[10px] tracking-[0.2em] text-gray-400">ТИП АККАУНТА</p>
                {isTelegramAdmin ? (
                  <p className="text-sm tracking-[0.1em] font-extrabold mt-1 text-black uppercase">
                    АДМИНИСТРАТОР (ВХОД БЕЗ ПАРОЛЯ)
                  </p>
                ) : (
                  <p className="text-sm tracking-[0.1em] font-medium mt-1 uppercase">
                    ГОСТЬ (КЛИЕНТ)
                  </p>
                )}
                {tgUser && (
                  <p className="text-[9px] tracking-[0.05em] text-gray-400 mt-1 normal-case font-bold">
                    ВАШ TELEGRAM ID: <span className="font-extrabold text-black select-all">{tgUser.id}</span>
                    {!isTelegramAdmin && " (добавьте его в .env как VITE_ADMIN_TELEGRAM_ID для входа без пароля)"}
                  </p>
                )}
              </div>

              <div>
                <p className="text-[10px] tracking-[0.2em] text-gray-400">ИСТОРИЯ ЗАКАЗОВ</p>
                <p className="text-xs tracking-[0.1em] text-gray-500 normal-case mt-2">
                  У вас пока нет оформленных заказов. Вся история ваших покупок будет отображаться здесь.
                </p>
              </div>
            </div>

            {isTelegramAdmin && (
              <div className="w-full mt-12 pt-6 border-t border-gray-100 flex flex-col gap-4">
                <button
                  onClick={() => {
                    setIsAdminOpen(true);
                  }}
                  className="w-full border border-black py-3 text-[10px] tracking-[0.2em] text-center hover:bg-black hover:text-white transition-colors cursor-pointer"
                >
                  ПАНЕЛЬ АДМИНИСТРАТОРА
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Product Detail Modal (PDP) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* Close Button */}
          <button 
            onClick={() => setSelectedProduct(null)}
            className="absolute top-4 right-4 md:top-8 md:right-8 z-50 p-2 bg-white/50 backdrop-blur-sm rounded-full hover:bg-white transition-colors cursor-pointer"
          >
            <X strokeWidth={1} className="w-6 h-6" />
          </button>

          {/* Left: Huge Image */}
          <div className="w-full md:w-1/2 h-[50vh] md:h-screen bg-gray-100 overflow-hidden relative flex flex-col justify-end">
            {(() => {
              const pdpImages = (selectedProduct.images && selectedProduct.images.length > 0)
                ? selectedProduct.images
                : [selectedProduct.image_url || selectedProduct.img];
              const activePdpImage = pdpImages[activePdpImageIndex] || pdpImages[0];
              return (
                <>
                  <img 
                    src={activePdpImage} 
                    alt={selectedProduct.name}
                    className={`w-full h-full object-cover absolute inset-0 ${selectedProduct.name === 'STRUCTURE SHIRT' ? 'grayscale' : ''}`}
                  />
                  {pdpImages.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-white/80 backdrop-blur-sm px-3 py-2 border border-black/10">
                      {pdpImages.map((_, idx) => (
                        <button
                          key={`pdp-dot-${idx}`}
                          onClick={() => setActivePdpImageIndex(idx)}
                          className={`w-2 h-2 transition-all cursor-pointer ${
                            activePdpImageIndex === idx ? "bg-black w-5" : "bg-gray-300 hover:bg-black"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Right: Details */}
          <div className="w-full md:w-1/2 h-[50vh] md:h-screen overflow-y-auto p-6 md:p-16 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full flex flex-col gap-6">
              
              <div>
                {selectedProduct.brand && (
                  <span className="text-[10px] tracking-[0.3em] text-gray-400 font-extrabold block mb-1">
                    {selectedProduct.brand}
                  </span>
                )}
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tighter leading-none mb-2">
                  {selectedProduct.name}
                </h1>
                <p className="text-xs tracking-[0.2em] text-gray-500 font-bold">
                  {selectedProduct.category}
                </p>
              </div>

              <PriceDisplay price={selectedProduct.price} size="lg" align="start" />

              <p className="text-xs leading-relaxed text-gray-600 normal-case">
                {selectedProduct.description}
              </p>

              {/* SIZES */}
              <div className="mt-2">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] tracking-[0.2em] text-gray-500 font-medium">ВЫБЕРИТЕ РАЗМЕР</span>
                  <button className="text-[10px] tracking-[0.1em] underline decoration-gray-300 underline-offset-4 text-gray-500 hover:text-black">ТАБЛИЦА РАЗМЕРОВ</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(selectedProduct.sizes && selectedProduct.sizes.length > 0 ? selectedProduct.sizes : SIZES).map((size: string) => (
                    <button
                      key={`pdp-${size}`}
                      onClick={() => setSelectedSize(size)}
                      className={`border px-4 py-2 text-[10px] tracking-[0.1em] transition-colors cursor-pointer ${
                        selectedSize === size ? "border-black bg-black text-white" : "border-gray-200 hover:border-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* COLORS */}
              <div className="mt-2">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] tracking-[0.2em] text-gray-500 font-medium">ВЫБЕРИТЕ ЦВЕТ</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(selectedProduct.colors && selectedProduct.colors.length > 0 ? selectedProduct.colors : COLORS).map((color: string) => (
                    <button
                      key={`pdp-${color}`}
                      onClick={() => setSelectedColor(color)}
                      className={`border px-4 py-2 text-[10px] tracking-[0.1em] transition-colors cursor-pointer ${
                        selectedColor === color ? "border-black bg-black text-white" : "border-gray-200 hover:border-black"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Cart */}
              <button 
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className={`w-full py-4 text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-4 group mt-4 cursor-pointer border ${
                  isAddingToCart 
                    ? "bg-gray-100 text-gray-500 border-gray-100" 
                    : "bg-black text-white border-black hover:bg-gray-800"
                }`}
              >
                {isAddingToCart ? (
                  <span>ДОБАВЛЕНО ✓</span>
                ) : (
                  <>
                    <span>В КОРЗИНУ</span>
                    <ArrowRight strokeWidth={1} className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
              
            </div>
          </div>
        </div>
      )}

      {/* Profile is rendered inline as a tab */}

      {/* Cart Drawer Component */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Admin Panel overlay */}
      {isAdminOpen && (
        <AdminPanel onClose={() => setIsAdminOpen(false)} />
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 z-40">
        <div className="flex justify-between items-center px-4 md:px-24 py-4 md:py-6 max-w-4xl mx-auto">
          <button 
            onClick={() => {
              setActiveTab("home");
              setIsAdminOpen(false);
              setIsCartOpen(false);
            }} 
            className={`flex flex-col items-center gap-2 group w-16 cursor-pointer transition-colors ${
              activeTab === "home" ? "text-black" : "text-gray-400 hover:text-black"
            }`}
          >
            <Home strokeWidth={1.5} className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="text-[8px] md:text-[9px] tracking-[0.2em] font-bold">ГЛАВНАЯ</span>
          </button>

          <button 
            onClick={() => {
              setActiveTab("catalog");
              setIsAdminOpen(false);
              setIsCartOpen(false);
            }} 
            className={`flex flex-col items-center gap-2 group w-16 cursor-pointer transition-colors ${
              activeTab === "catalog" ? "text-black" : "text-gray-400 hover:text-black"
            }`}
          >
            <LayoutGrid strokeWidth={1.5} className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="text-[8px] md:text-[9px] tracking-[0.2em] font-bold">КАТАЛОГ</span>
          </button>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className={`flex flex-col items-center gap-2 group w-16 cursor-pointer relative transition-colors text-gray-400 hover:text-black ${isCartPop ? "animate-cart-pop" : ""}`}
          >
            <ShoppingBag strokeWidth={1.5} className="w-5 h-5 transition-transform group-hover:scale-110" />
            {totalCartCount > 0 && (
              <span className="absolute top-0 right-3 bg-black text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                {totalCartCount}
              </span>
            )}
            <span className="text-[8px] md:text-[9px] tracking-[0.2em] font-bold">КОРЗИНА</span>
          </button>
          
          <button 
            onClick={() => {
              setActiveTab("profile");
              setIsAdminOpen(false);
              setIsCartOpen(false);
            }}
            className={`flex flex-col items-center gap-2 group w-16 cursor-pointer transition-colors ${
              activeTab === "profile" ? "text-black" : "text-gray-400 hover:text-black"
            }`}
          >
            <User strokeWidth={1.5} className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="text-[8px] md:text-[9px] tracking-[0.2em] font-bold">ПРОФИЛЬ</span>
          </button>
        </div>
      </nav>
    </div>
  );
}