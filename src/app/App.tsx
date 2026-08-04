import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Heart, 
  User, 
  Search, 
  X, 
  ArrowRight, 
  ChevronDown,
  LayoutGrid,
  Info,
  ExternalLink,
  Compass,
  ShoppingBag,
  MessageSquare,
  HelpCircle
} from "lucide-react";
import { supabase } from "./utils/supabase";
import { PriceDisplay } from "./components/ui/CartDrawer";
import AdminPanel from "./components/AdminPanel";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { Toaster } from "sonner";

const CATEGORIES = [
  "ВСЕ", "НАЛИЧИЕ", "ХУДИ/ЗИПКИ", "ЖАКЕТЫ", "ОБУВЬ", 
  "ДЖИНСЫ", "ФУТБОЛКИ", "ЛОНГИ/СВИТШОТЫ", "СУМКИ", 
  "АКСЕССУАРЫ", "ШТАНЫ", "ГОЛОВНЫЕ УБОРЫ", "РЕМНИ", 
  "БОМБЕРЫ", "ПУХОВИКИ"
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

const KNOWN_BRANDS = [
  { keywords: ["ENFANTS RICHES DEPRIMES", "ENFANTS RICHES", "ENFATNS RICHES", "ERD"], clean: "ENFANTS RICHES DEPRIMES" },
  { keywords: ["GRAILZ PROJECT", "GRAILZ"], clean: "GRAILZ PROJECT" },
  { keywords: ["HYSTERIC GLAMOUR"], clean: "HYSTERIC GLAMOUR" },
  { keywords: ["THUG CLUB"], clean: "THUG CLUB" },
  { keywords: ["IF SIX WAS NINE"], clean: "IF SIX WAS NINE" },
  { keywords: ["SAINT LAURENT"], clean: "SAINT LAURENT" },
  { keywords: ["HOOD BY AIR", "HBA"], clean: "HOOD BY AIR" },
  { keywords: ["NO FAITH STUDIOS", "NO FAITH"], clean: "NO FAITH STUDIOS" },
  { keywords: ["PROTOCOL INDEX"], clean: "PROTOCOL INDEX" },
  { keywords: ["ALICE HOLLYWOOD"], clean: "ALICE HOLLYWOOD" },
  { keywords: ["MAISON MIHARA", "MIHARA YASUHIRO"], clean: "MAISON MIHARA YASUHIRO" },
  { keywords: ["MELANIN ARCHIVE"], clean: "MELANIN ARCHIVE" },
  { keywords: ["MOWALOLA"], clean: "MOWALOLA" },
  { keywords: ["FAR ARCHIVE"], clean: "FAR ARCHIVE" },
  { keywords: ["RACER WORLDWIDE"], clean: "RACER WORLDWIDE" },
  { keywords: ["14TH ADDICTION"], clean: "14TH ADDICTION" },
  { keywords: ["VIVIENNE WESTWOOD"], clean: "VIVIENNE WESTWOOD" },
  { keywords: ["BEAUTY:BEAST"], clean: "BEAUTY:BEAST" },
  { keywords: ["BALMAIN"], clean: "BALMAIN" },
  { keywords: ["HELIOT EMIL"], clean: "HELIOT EMIL" },
  { keywords: ["TORNADO MART"], clean: "TORNADO MART" },
  { keywords: ["COMME DES GARCONS"], clean: "COMME DES GARCONS" },
  { keywords: ["ACNE STUDIOS"], clean: "ACNE STUDIOS" },
  { keywords: ["POST ARCHIVE FACTION"], clean: "POST ARCHIVE FACTION" },
  { keywords: ["JUNYA WATANABE"], clean: "JUNYA WATANABE" },
  { keywords: ["ISABEL MARANT"], clean: "ISABEL MARANT" },
  { keywords: ["GIVENCHY"], clean: "GIVENCHY" },
  { keywords: ["DIOR"], clean: "DIOR" },
  { keywords: ["Y-PROJECT", "Y PROJECT"], clean: "Y-PROJECT" },
  { keywords: ["LGB", "L.G.B"], clean: "LGB" },
  { keywords: ["RICK OWENS", "RICKOWENS"], clean: "RICK OWENS" },
  { keywords: ["BALENCIAGA"], clean: "BALENCIAGA" },
  { keywords: ["VETEMENTS"], clean: "VETEMENTS" },
  { keywords: ["CHROME HEARTS", "CHROMEHEARTS"], clean: "CHROME HEARTS" },
  { keywords: ["MAISON MARGIELA", "MARGIELA"], clean: "MAISON MARGIELA" },
  { keywords: ["YOHJI YAMAMOTO", "YAMAMOTO"], clean: "YOHJI YAMAMOTO" },
  { keywords: ["RAF SIMONS", "RAFSIMONS"], clean: "RAF SIMONS" },
  { keywords: ["UNDERCOVER"], clean: "UNDERCOVER" },
  { keywords: ["HELMUT LANG", "HELMUTLANG"], clean: "HELMUT LANG" },
  { keywords: ["KIKO KOSTADINOV", "KIKO"], clean: "KIKO KOSTADINOV" },
  { keywords: ["ALYX", "1017 ALYX 9SM"], clean: "ALYX" },
  { keywords: ["OFF-WHITE", "OFF WHITE"], clean: "OFF-WHITE" },
  { keywords: ["STONE ISLAND", "STONEISLAND"], clean: "STONE ISLAND" },
  { keywords: ["C.P. COMPANY", "CP COMPANY", "C.P COMPANY"], clean: "C.P. COMPANY" },
  { keywords: ["NUMBER (N)INE", "NUMBER NINE", "NUMBER(N)INE"], clean: "NUMBER (N)INE" },
  { keywords: ["CARHARTT"], clean: "CARHARTT" },
  { keywords: ["ARC'TERYX", "ARCTERYX"], clean: "ARC'TERYX" },
  { keywords: ["STUSSY"], clean: "STUSSY" },
  { keywords: ["SUPREME"], clean: "SUPREME" },
  { keywords: ["DIESEL"], clean: "DIESEL" },
  { keywords: ["YEEZY"], clean: "YEEZY" },
  { keywords: ["UNDERBUY"], clean: "UNDERBUY" }
];

const CATEGORY_WORDS = [
  "HOODIE", "ZIP", "ZIPUP", "ZIP-UP", "ЗИПКА", "ХУДИ", "JACKET", "ЖАКЕТ", "COAT", "ПАЛЬТО", 
  "PANTS", "ШТАНЫ", "JEANS", "ДЖИНСЫ", "TSHIRT", "T-SHIRT", "ФУТБОЛКА", "SWEATSHIRT", "СВИТШОТ", 
  "LONGSLEEVE", "ЛОНГСЛИВ", "BAG", "СУМКА", "BELT", "РЕМЕНЬ", "HAT", "CAP", "КЕПКА", "ШАПКА", 
  "SNEAKERS", "КРОССОВКИ", "SHOES", "ОБУВЬ", "TEE", "SHIRT", "BOMBER", "БОМБЕР", "PUFFER", 
  "ПУХОВИК", "SWEATER", "СВИТЕР", "VEST", "ЖИЛЕТ", "ЖИЛЕТКА", "CARDIGAN", "КАРДИГАН", 
  "PULLOVER", "ПУЛОВЕР", "POLO", "ПОЛО", "BOOTS", "БОТИНКИ", "SLIDES", "СЛАЙДЫ", "SANDALS", "САНДАЛИИ",
  "COLLECTION", "COLLAB", "LIMITED", "EDITION", "SERIES", "PRE-FALL", "RESORT", 
  "FALL", "WINTER", "SPRING", "SUMMER", "SS", "FW", "AW", "COLLABORATION", "X"
];

function stripTelegramFormatting(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/\*\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function inferBrandFromTitle(title: string): string {
  const upperTitle = title.toUpperCase();
  for (const item of KNOWN_BRANDS) {
    if (item.keywords.some((keyword) => upperTitle.includes(keyword))) {
      return item.clean;
    }
  }

  return title.replace(/^[^A-ZА-Я0-9]+/i, "").split(/\s+/)[0] || "НЕИЗВЕСТНО";
}

function normalizeProduct(row: any) {
  const title = stripTelegramFormatting(row.title ?? row.name ?? row.product_name ?? "Без названия");
  const images = Array.isArray(row.images)
    ? row.images.filter(Boolean)
    : row.image_url
      ? [row.image_url]
      : row.img
        ? [row.img]
        : [];
  // The restored Telegram catalog keeps the source message in raw_text. It is
  // useful for auditing, but contains markup, delivery links and contact data,
  // so only show an explicit description in the product card.
  const rawDescription = row.description ?? "";

  return {
    ...row,
    id: row.id ?? row.telegram_message_id ?? title,
    name: title,
    brand: cleanBrandName(row.brand || inferBrandFromTitle(title)),
    category: stripTelegramFormatting(row.category).toUpperCase(),
    description: stripTelegramFormatting(rawDescription),
    images,
    image_url: images[0] ?? "",
    price: row.price ?? row.price_byn ?? row.price_rub ?? "",
    price_byn: row.price_byn ?? null,
    price_rub: row.price_rub ?? null,
    is_new: Boolean(row.is_new ?? row.isNew),
    created_at: row.created_at || null,
  };
}

const CATALOG_CACHE_KEY = "underbuy_catalog_cache_v2";
const SUPABASE_PAGE_SIZE = 500;

function sortProducts(rows: any[]) {
  const normalized = rows.map(normalizeProduct);

  normalized.sort((a: any, b: any) => {
    const msgA = Number(a.telegram_message_id || 0);
    const msgB = Number(b.telegram_message_id || 0);

    if (msgA > 0 && msgB > 0 && msgA !== msgB) {
      return msgB - msgA;
    }

    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    const safeTimeA = Number.isFinite(timeA) ? timeA : 0;
    const safeTimeB = Number.isFinite(timeB) ? timeB : 0;

    if (safeTimeA !== safeTimeB) {
      return safeTimeB - safeTimeA;
    }

    return Number(b.id || 0) - Number(a.id || 0);
  });

  return normalized;
}

function mergeCatalogProducts(liveProducts: any[], fallbackProducts: any[]) {
  const fallbackByTelegramId = new Map(
    fallbackProducts.map((product) => [String(product.telegram_message_id), product]),
  );

  return liveProducts.map((product) => {
    const fallback = fallbackByTelegramId.get(String(product.telegram_message_id));
    const images = product.images?.length ? product.images : fallback?.images || [];
    const brand = product.brand !== "НЕИЗВЕСТНО" ? product.brand : fallback?.brand || product.brand;

    return {
      ...product,
      brand,
      images,
      image_url: images[0] || product.image_url || fallback?.image_url || "",
    };
  });
}

function readSavedCatalog() {
  try {
    const saved = localStorage.getItem(CATALOG_CACHE_KEY);
    if (!saved) return [];

    const payload = JSON.parse(saved);
    return Array.isArray(payload?.products) ? payload.products : [];
  } catch {
    return [];
  }
}

function saveCatalog(products: any[]) {
  try {
    const compactProducts = products.map((product) => ({
      id: product.id,
      telegram_message_id: product.telegram_message_id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description,
      images: product.images,
      image_url: product.image_url,
      price: product.price,
      price_byn: product.price_byn,
      price_rub: product.price_rub,
      is_new: product.is_new,
      created_at: product.created_at,
      aspect: product.aspect,
      span: product.span,
    }));

    localStorage.setItem(
      CATALOG_CACHE_KEY,
      JSON.stringify({ savedAt: new Date().toISOString(), products: compactProducts }),
    );
  } catch {
    // The catalog still works when storage is unavailable (private mode, quota, etc.).
  }
}

async function loadAllSupabaseProducts() {
  const products: any[] = [];
  let beforeTelegramMessageId: number | null = null;

  while (true) {
    let query = supabase
      .from("products")
      .select("*")
      .order("telegram_message_id", { ascending: false })
      .limit(SUPABASE_PAGE_SIZE);

    if (beforeTelegramMessageId !== null) {
      query = query.lt("telegram_message_id", beforeTelegramMessageId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const page = data || [];
    products.push(...page);

    if (page.length < SUPABASE_PAGE_SIZE) break;

    const nextCursor = Number(page[page.length - 1]?.telegram_message_id);
    if (!Number.isFinite(nextCursor) || nextCursor === beforeTelegramMessageId) break;
    beforeTelegramMessageId = nextCursor;
  }

  return products;
}

async function loadStaticCatalog() {
  const response = await fetch(`${import.meta.env.BASE_URL}products-cache.json`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Static catalog request failed (${response.status})`);
  }

  const payload = await response.json();
  const rows = Array.isArray(payload) ? payload : payload?.products;
  return Array.isArray(rows) ? rows : [];
}

export function cleanBrandName(rawBrand: string | null | undefined): string {
  if (!rawBrand) return "НЕИЗВЕСТНО";
  let upper = rawBrand.trim().toUpperCase();
  
  // Clean seasonal collections (e.g., SS22, FW23, 22SS, 2024)
  upper = upper.replace(/\b(SS|FW|AW|AH|SP|SU|FA|WI)\d{2,4}\b/g, "");
  upper = upper.replace(/\b\d{2,4}(SS|FW|AW|AH|SP|SU|FA|WI)\b/g, "");
  upper = upper.replace(/\b(19|20)\d{2}\b/g, "");
  
  // Clean punctuation at boundaries but keep spaces
  upper = upper.replace(/^[^A-ZА-Я0-9]+|[^A-ZА-Я0-9]+$/g, "");
  
  // 1. Check known brands first
  for (const item of KNOWN_BRANDS) {
    for (const keyword of item.keywords) {
      if (upper.includes(keyword)) {
        return item.clean;
      }
    }
  }
  
  // 2. Otherwise clean category/collection words from the brand string
  let words = upper.split(/\s+/);
  words = words.filter(word => {
    // Strip non-alphanumeric characters for comparison
    const cleanWord = word.replace(/[^A-ZА-Я0-9]/g, "");
    return !CATEGORY_WORDS.includes(cleanWord) && !CATEGORY_WORDS.includes(word);
  });
  
  // Re-join and trim
  const result = words.join(" ").trim();
  
  // Fallback to original upper case if everything was stripped
  return result || upper;
}

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
  const [productsError, setProductsError] = useState<string | null>(null);
  const [catalogNotice, setCatalogNotice] = useState<string | null>(null);
  const [catalogRefreshKey, setCatalogRefreshKey] = useState(0);
  const [activeCategory, setActiveCategory] = useState("ВСЕ");
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [activePdpImageIndex, setActivePdpImageIndex] = useState(0);

  // Favorites and modal state
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("underbuy_favorites");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  });

  // Tab routing: catalog opens first, while the former home page is now Info.
  const [activeTab, setActiveTab] = useState<"info" | "catalog" | "profile">("catalog");
  const [infoSubTab, setInfoSubTab] = useState<"order" | "reviews" | "faq">("order");

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

  // Show the last deployed/saved catalog immediately, then refresh it from Supabase.
  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      const savedProducts = readSavedCatalog();
      let hasFallback = savedProducts.length > 0;

      if (hasFallback) {
        setProducts(savedProducts);
        setIsProductsLoading(false);
        setCatalogNotice("ОБНОВЛЯЕМ АКТУАЛЬНЫЕ ДАННЫЕ…");
      } else {
        setIsProductsLoading(true);
      }

      setProductsError(null);

      const staticCatalogPromise = loadStaticCatalog()
        .then((rows) => {
          if (cancelled || rows.length === 0) return [];

          const staticProducts = sortProducts(rows);
          hasFallback = true;
          setProducts(staticProducts);
          setIsProductsLoading(false);
          setCatalogNotice("ПОКАЗЫВАЕМ СОХРАНЁННЫЙ КАТАЛОГ — ОБНОВЛЯЕМ ДАННЫЕ…");
          saveCatalog(staticProducts);
          return staticProducts;
        })
        .catch(() => []);

      try {
        const fetchPromise = loadAllSupabaseProducts();

        const result: any = await Promise.race([
          fetchPromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Supabase не ответил вовремя")), 12000),
          ),
        ]);

        if (cancelled) return;

        const staticProducts = await staticCatalogPromise;
        const liveProducts = mergeCatalogProducts(sortProducts(result || []), staticProducts);
        setProducts(liveProducts);
        saveCatalog(liveProducts);
        setCatalogNotice(null);
      } catch {
        await staticCatalogPromise;
        if (cancelled) return;

        if (hasFallback) {
          setProductsError(null);
          setCatalogNotice("КАТАЛОГ ДОСТУПЕН ИЗ РЕЗЕРВА — ОБНОВИМ АВТОМАТИЧЕСКИ");
        } else {
          setProductsError("КАТАЛОГ ВРЕМЕННО НЕДОСТУПЕН");
          setCatalogNotice(null);
          setProducts([]);
        }
      } finally {
        if (!cancelled) setIsProductsLoading(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [catalogRefreshKey]);

  // Load reviews from Supabase
  useEffect(() => {
    async function loadReviews() {
      setIsReviewsLoading(true);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase не ответил вовремя")), 15000)
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
      } catch {
        setReviews(REVIEWS_MOCK);
      } finally {
        setIsReviewsLoading(false);
      }
    }
    loadReviews();
  }, []);

  // Save favorites to local storage
  useEffect(() => {
    localStorage.setItem("underbuy_favorites", JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  // Lock body scroll when overlays are open
  useEffect(() => {
    if (selectedProduct || isAdminOpen || isFavoritesOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [selectedProduct, isAdminOpen, isFavoritesOpen]);

  useEffect(() => {
    if (!selectedProduct) {
      setActivePdpImageIndex(0);
    }
  }, [selectedProduct]);

  const toggleFavorite = (productId: string | number) => {
    const id = String(productId);
    setFavoriteIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const favoriteProducts = useMemo(
    () => products.filter((product) => favoriteIdSet.has(String(product.id))),
    [favoriteIdSet, products],
  );
  const brandOptions = useMemo(
    () => ["ВСЕ БРЕНДЫ", ...(Array.from(new Set(products.map((product) => product.brand).filter(Boolean))) as string[])],
    [products],
  );
  const categoryOptions = useMemo(() => {
    const availableCategories = Array.from(
      new Set(products.map((product) => product.category).filter(Boolean)),
    ) as string[];
    return [...CATEGORIES, ...availableCategories.filter((category) => !CATEGORIES.includes(category))];
  }, [products]);

  const getTelegramCheckoutUrl = (product: any) => {
    const message = `Привет, хочу заказать ${product.name}`;
    return `https://t.me/und3rme?text=${encodeURIComponent(message)}`;
  };

  // Filter products based on selected category, brand, and search query
  const filteredProducts = useMemo(() => products.filter((product) => {
    if (!product) return false;

    // Category filter
    if (activeCategory !== "ВСЕ") {
      const prodCat = (product.category || "").toUpperCase().trim();
      const targetCat = activeCategory.toUpperCase().trim();

      if (targetCat === "ОБУВЬ") {
        const isShoe = prodCat === "ОБУВЬ" || 
                       prodCat.includes("ОБУВЬ") || 
                       prodCat.includes("КРОССОВК") || 
                       prodCat.includes("КЕДЫ") || 
                       prodCat.includes("ТАПКИ") || 
                       prodCat.includes("СНИКЕРС") || 
                       prodCat.includes("БОТИНК") || 
                       prodCat.includes("SHOE") || 
                       prodCat.includes("SNEAKER") || 
                       prodCat.includes("BOOT");
        if (!isShoe) return false;
      } else {
        if (prodCat !== targetCat && !prodCat.includes(targetCat)) return false;
      }
    }
    
    // Brand filter
    if (activeBrand && activeBrand !== "ВСЕ") {
      if (!product.brand || product.brand !== activeBrand) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchesName = product.name ? product.name.toLowerCase().includes(query) : false;
      const matchesBrand = product.brand ? product.brand.toLowerCase().includes(query) : false;
      const matchesCategory = product.category ? product.category.toLowerCase().includes(query) : false;
      const matchesDesc = product.description ? product.description.toLowerCase().includes(query) : false;
      if (!matchesName && !matchesBrand && !matchesCategory && !matchesDesc) return false;
    }

    return true;
  }), [activeBrand, activeCategory, products, searchQuery]);

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
            <button
              type="button"
              aria-label="Открыть каталог"
              className="relative w-[78px] h-[52px] md:w-[88px] md:h-[60px] overflow-hidden cursor-pointer shrink-0 focus:outline-none"
              onClick={() => {
                setActiveTab("catalog");
                setActiveCategory("ВСЕ");
                setIsAdminOpen(false);
              }}
            >
              <img
                src={`${import.meta.env.BASE_URL}underbuy-logo.png`}
                alt="Underbuy"
                className="absolute max-w-none w-[127.5%] left-[-11%] top-[-43%] select-none"
              />
            </button>
            <div className="flex items-center gap-2">
              {/* Favorites icon in header */}
              <button 
                onClick={() => setIsFavoritesOpen(true)}
                className="p-2 group cursor-pointer relative"
                aria-label="Открыть избранное"
              >
                <Heart strokeWidth={1} className="w-5 h-5 md:w-6 md:h-6 group-hover:opacity-50 transition-opacity" />
                {favoriteProducts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {favoriteProducts.length}
                  </span>
                )}
              </button>
              {activeTab === "catalog" && (
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 -mr-2 group cursor-pointer"
                  aria-label="Открыть поиск"
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
            options={categoryOptions}
            onChange={(val) => {
              setActiveCategory(val);
              setIsAdminOpen(false);
            }} 
          />
          <CustomSelect 
            label="БРЕНД" 
            value={activeBrand || "ВСЕ БРЕНДЫ"} 
            options={brandOptions}
            onChange={(val) => {
              setActiveBrand(val === "ВСЕ БРЕНДЫ" ? null : val);
              setIsAdminOpen(false);
            }} 
          />
        </div>
      )}

      {/* Main Content */}
      <main className="pb-32 px-4 md:px-8 pt-4 overflow-x-hidden selection:bg-black selection:text-white">
        {/* INFO */}
        {activeTab === "info" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* NAVIGATOR AT THE VERY TOP OF INFO PAGE */}
            <div className="bg-white border border-black p-3.5 md:p-4 flex flex-col gap-3 shadow-sm">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2 text-black">
                  <Compass strokeWidth={1.5} className="w-4 h-4 shrink-0" />
                  <span className="text-[11px] md:text-xs tracking-[0.2em] font-extrabold uppercase">НАВИГАЦИЯ ПО ИНФО</span>
                </div>
                <span className="text-[8px] tracking-[0.15em] text-gray-400 font-extrabold uppercase hidden sm:inline">ВЫБЕРИТЕ РАЗДЕЛ</span>
              </div>
              
              <div className="flex flex-col gap-2">
                {/* 1. КАК СДЕЛАТЬ ЗАКАЗ */}
                <button
                  type="button"
                  onClick={() => setInfoSubTab("order")}
                  className={`w-full py-2.5 px-3.5 border text-[10px] md:text-[11px] tracking-[0.15em] font-extrabold uppercase flex justify-between items-center transition-all cursor-pointer ${
                    infoSubTab === "order"
                      ? "bg-black text-white border-black shadow-sm"
                      : "bg-white text-black border-black hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 shrink-0" />
                    <span>1. КАК СДЕЛАТЬ ЗАКАЗ</span>
                  </div>
                  {infoSubTab === "order" && <span className="text-[8px] tracking-[0.2em] bg-white text-black px-2 py-0.5 font-black">ВЫБРАНО</span>}
                </button>

                {/* 2. ОТЗЫВЫ */}
                <button
                  type="button"
                  onClick={() => setInfoSubTab("reviews")}
                  className={`w-full py-2.5 px-3.5 border text-[10px] md:text-[11px] tracking-[0.15em] font-extrabold uppercase flex justify-between items-center transition-all cursor-pointer ${
                    infoSubTab === "reviews"
                      ? "bg-black text-white border-black shadow-sm"
                      : "bg-white text-black border-black hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>2. ОТЗЫВЫ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] tracking-[0.1em] font-black ${infoSubTab === "reviews" ? "text-white" : "text-gray-500"}`}>★ 5.0</span>
                    {infoSubTab === "reviews" && <span className="text-[8px] tracking-[0.2em] bg-white text-black px-2 py-0.5 font-black">ВЫБРАНО</span>}
                  </div>
                </button>

                {/* 3. ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ */}
                <button
                  type="button"
                  onClick={() => setInfoSubTab("faq")}
                  className={`w-full py-2.5 px-3.5 border text-[10px] md:text-[11px] tracking-[0.15em] font-extrabold uppercase flex justify-between items-center transition-all cursor-pointer ${
                    infoSubTab === "faq"
                      ? "bg-black text-white border-black shadow-sm"
                      : "bg-white text-black border-black hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    <span>3. ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ</span>
                  </div>
                  {infoSubTab === "faq" && <span className="text-[8px] tracking-[0.2em] bg-white text-black px-2 py-0.5 font-black">ВЫБРАНО</span>}
                </button>
              </div>
            </div>

            {/* DYNAMIC CONTENT AREA BASED ON SELECTED SUB-TAB */}
            <div className="mt-2">
              {/* 1. КАК ОФОРМИТЬ ЗАКАЗ */}
              {infoSubTab === "order" && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                  <h2 className="text-xs md:text-sm tracking-[0.2em] font-extrabold uppercase border-b border-black pb-2">КАК СДЕЛАТЬ ЗАКАЗ</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex gap-4 items-start border border-black p-4 bg-white">
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-extrabold text-xs shrink-0 select-none">1</div>
                      <div>
                        <h3 className="text-[11px] tracking-[0.1em] font-extrabold uppercase">Выбор вещи</h3>
                        <p className="text-[10px] tracking-[0.05em] text-gray-500 mt-1 uppercase leading-relaxed font-bold">Выберите понравившуюся вещь в каталоге и откройте карточку товара</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start border border-black p-4 bg-white">
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-extrabold text-xs shrink-0 select-none">2</div>
                      <div>
                        <h3 className="text-[11px] tracking-[0.1em] font-extrabold uppercase">Оформление</h3>
                        <p className="text-[10px] tracking-[0.05em] text-gray-500 mt-1 uppercase leading-relaxed font-bold">Нажмите «Перейти к оформлению» — откроется Telegram с готовым сообщением менеджеру</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start border border-black p-4 bg-white">
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-extrabold text-xs shrink-0 select-none">3</div>
                      <div>
                        <h3 className="text-[11px] tracking-[0.1em] font-extrabold uppercase">Доставка</h3>
                        <p className="text-[10px] tracking-[0.05em] text-gray-500 mt-1 uppercase leading-relaxed font-bold">После того как вы свяжетесь с менеджером, он ответит на все ваши вопросы, предоставит размерную таблицу, а также предложит два вида доставки на выбор: авиа или авто — и рассчитает полную стоимость вашего заказа</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start border border-black p-4 bg-white">
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-extrabold text-xs shrink-0 select-none">4</div>
                      <div>
                        <h3 className="text-[11px] tracking-[0.1em] font-extrabold uppercase">Оплата</h3>
                        <p className="text-[10px] tracking-[0.05em] text-gray-500 mt-1 uppercase leading-relaxed font-bold">После подтверждения заказа мы направим вам реквизиты для оплаты. Принимаем: Карты РФ / Карты РБ / Карты банков стран СНГ / Крипта</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ОТЗЫВЫ */}
              {infoSubTab === "reviews" && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center border-b border-black pb-2">
                    <h2 className="text-xs md:text-sm tracking-[0.2em] font-extrabold uppercase">ОТЗЫВЫ ПОКУПАТЕЛЕЙ</h2>
                    <div className="flex items-center gap-1.5 select-none">
                      <span className="text-xs">★</span>
                      <span className="text-[10px] tracking-[0.1em] font-extrabold">5.0</span>
                    </div>
                  </div>

                  {/* TELEGRAM REVIEWS CHANNEL CARD (@und3rreview) */}
                  <div className="border border-black bg-black text-white p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-extrabold shrink-0 mt-0.5">
                        <ExternalLink className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] tracking-[0.2em] text-gray-400 font-extrabold block">TELEGRAM КАНАЛ С ОТЗЫВАМИ</span>
                        <h3 className="text-xs md:text-sm tracking-[0.15em] font-extrabold uppercase mt-0.5">@UND3RREVIEW</h3>
                        <p className="text-[10px] tracking-[0.05em] text-gray-300 font-medium normal-case mt-1">
                          Смотрите ещё больше живых фотоотчетов и отзывов наших клиентов в официальном канале!
                        </p>
                      </div>
                    </div>
                    <a
                      href="https://t.me/und3rreview"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full md:w-auto bg-white text-black border border-white px-5 py-3 text-[10px] tracking-[0.2em] font-extrabold uppercase hover:bg-gray-200 transition-colors shrink-0 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>ПЕРЕЙТИ В КАНАЛ @UND3RREVIEW</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
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
              )}

              {/* 3. ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ (FAQ) */}
              {infoSubTab === "faq" && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                  <h2 className="text-xs md:text-sm tracking-[0.2em] font-extrabold uppercase border-b border-black pb-2">ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ</h2>
                  <div className="flex flex-col gap-4 max-w-3xl">
                    <FaqItem 
                      question="ЧЕМ НАШ МАГАЗИН ЛУЧШЕ ДРУГИХ?" 
                      answer="Мы ответим на все вопросы и поможем подобрать лучший вариант под ваш бюджет. Если нужный вам товар производится в нескольких вариантах качества, мы предложим вам все доступные фабричные версии. Сопровождаем на всех этапах — от оформления до получения товара. Мы всегда на связи и оперативно отвечаем на любые вопросы. Доставка: Мы предлагаем проверенные способы доставки (Авиа/Авто) и всегда честно информируем о статусе заказа — вы точно знаете, где находится ваш товар. Привозим редкие товары, технику (ноутбуки, телефоны) и электротранспорт по всей территории СНГ (работаем как в розницу, так и оптом). Удобная оплата: Предлагаем разные способы оплаты (карты РФ/РБ/СНГ, криптовалюта) и гибкие условия, включая систему оплаты частями 50/50." 
                    />
                    <FaqItem 
                      question="Можно ли заказать, если товара нет на площадке?" 
                      answer="Да! Вы можете прислать ссылку или фото абсолютно любого товара нашему менеджеру — мы найдем, выкупим и доставим его для вас. Найдем любой товар по лучшей цене (как качественную реплику, так и оригинал). Доставляем электротранспорт, ноутбуки, мобильные телефоны и многое другое. Работаем как с розничными, так и с оптовыми заказами." 
                    />
                    <FaqItem 
                      question="Через сколько я получу заказ?" 
                      answer="Сроки зависят от выбранного способа. Указанное время — это доставка до нас (доставка от нас к вам (СДЭК, Европочта/Белпочта) рассчитывается отдельно): Авиа: 5–10 дней, с момента отправки из Китая. Авто: 18–25 дней, с момента отправки из Китая. Важно: Сроки являются примерными. Логистика — процесс сложный, поэтому возможны небольшие сдвиги из-за работы таможенных или транспортных служб. Мы не всегда можем ускорить этот процесс, но всегда держим вас в курсе и оперативно сообщаем о любых изменениях." 
                    />
                    <FaqItem 
                      question="Как отследить заказ?" 
                      answer="Мы информируем вас о статусе на каждом этапе: На складе в Китае: как только товар прибывает на наш склад, мы присылаем вам фотографию. В пути: дальнейший процесс зависит от выбранного способа: Авиа: после отправки товара мы предоставим трек-номер для отслеживания на сайте belpost.by. Авто: мы предоставим номер контейнера. Вы сможете отслеживать статус в таблице, как только номер контейнера появится в таблице, мы предоставим вам ее. Прибытие к нам: когда товар будет у нас, мы проверим его, сделаем подробные фото и пришлем их вам. После этого отправим ваш заказ выбранным способом (СДЭК, Европочта, Белпочта) либо передадим при личной встрече." 
                    />
                    <FaqItem 
                      question="Что входит в стоимость?" 
                      answer="Итоговая стоимость вашего заказа складывается из: Себестоимости товара. Доставки из Китая до нас (авиа или авто). Нашей комиссии за работу. Обратите внимание: Доставка от нас до вас (СДЭК, Европочта/Белпочта) оплачивается отдельно при получении. Если вам удобнее оплатить всё сразу, сообщите менеджеру — мы включим её в общий счет." 
                    />
                    <FaqItem 
                      question="Какие способы оплаты?" 
                      answer="Мы принимаем: Карты РФ / РБ / стран СНГ, Криптовалюту" 
                    />
                    <FaqItem 
                      question="Что если нет всей суммы сразу, можно 50/50?" 
                      answer="Если вам неудобно оплачивать всю сумму сразу, мы предлагаем систему оплаты частями: Первые 50%: вносятся при оформлении заказа. Оставшиеся 50%: вносятся после того, как товар прибыл к нам, мы прислали вам отчетные фотографии и подготовили заказ к отправке." 
                    />
                    <FaqItem 
                      question="Возможен ли возврат товара?" 
                      answer="Возврат возможен только в двух случаях: Брак: производственный дефект (например, поврежденная фурнитура или швы). Размер: если товар не подошел по размеру и сохранил товарный вид (бирки, отсутствие следов носки). Важно: если при заказе была предоставлена размерная сетка и вы выбрали размер по ней, возврат по причине «не подошел размер» не осуществляется." 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        

        {/* TAB 2: CATALOG */}
        {activeTab === "catalog" && (
          <div className="animate-in fade-in duration-300">
            <section className="flex items-end justify-between gap-6 py-4 md:py-5 border-b border-black mb-6">
              <div className="max-w-2xl">
                <h1 className="text-[clamp(2rem,4.5vw,3.75rem)] leading-[0.88] tracking-[-0.06em] font-black">
                  КАТАЛОГ
                </h1>
                <p className="mt-3 text-[9px] md:text-[10px] tracking-[0.16em] text-gray-500 font-bold leading-relaxed">
                  ВЫБЕРИТЕ ВЕЩЬ — ОФОРМЛЕНИЕ ЗАКАЗА ОТКРОЕТСЯ В TELEGRAM
                </p>
              </div>
              <div className="text-right shrink-0 pb-0.5">
                <span className="block text-xl md:text-3xl font-black tracking-[-0.05em] leading-none">
                  {isProductsLoading ? "—" : filteredProducts.length}
                </span>
                <span className="block mt-1 text-[8px] tracking-[0.18em] text-gray-400 font-extrabold">
                  ПОЗИЦИЙ
                </span>
              </div>
            </section>

            {catalogNotice && !isProductsLoading && filteredProducts.length > 0 && (
              <div className="mb-4 flex items-center justify-between gap-4 border border-black/15 bg-[#f7f7f7] px-4 py-3">
                <span className="text-[8px] md:text-[9px] tracking-[0.14em] text-gray-600 font-extrabold leading-relaxed">
                  {catalogNotice}
                </span>
                <button
                  type="button"
                  onClick={() => setCatalogRefreshKey((value) => value + 1)}
                  className="shrink-0 text-[8px] tracking-[0.16em] font-black underline underline-offset-4 cursor-pointer"
                >
                  ОБНОВИТЬ
                </button>
              </div>
            )}

            {/* Loading Indicator (Skeleton Screen with Shimmer) */}
            {isProductsLoading && (
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-x-3 md:gap-x-6 gap-y-10 md:gap-y-16">
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
                  <div className="text-center py-24 text-[10px] tracking-[0.2em] text-gray-400 font-extrabold flex flex-col items-center gap-5">
                    <span>{productsError || "ПО ВАШЕМУ ЗАПРОСУ НИЧЕГО НЕ НАЙДЕНО"}</span>
                    {productsError && (
                      <button
                        type="button"
                        onClick={() => setCatalogRefreshKey((value) => value + 1)}
                        className="border border-black text-black px-5 py-3 hover:bg-black hover:text-white transition-colors cursor-pointer"
                      >
                        ОБНОВИТЬ
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-x-3 md:gap-x-6 gap-y-10 md:gap-y-16">
                    {filteredProducts.map((product) => {
                      const productImg = (product.images && product.images.length > 0) ? product.images[0] : (product.image_url || product.img);
                      const aspectClass = product.aspect || "aspect-[3/4]";
                      const spanClass = product.span || "col-span-1 md:col-span-1";

                      return (
                        <article
                          key={product.id}
                          className={`${spanClass} catalog-product group flex flex-col gap-3`}
                        >
                          <div className={`relative overflow-hidden w-full ${aspectClass} bg-[#f3f3f3]`}>
                            <ImageWithFallback
                              src={productImg} 
                              alt={product.name} 
                              loading="lazy"
                              className={`w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-90 ${product.name === 'STRUCTURE SHIRT' ? 'grayscale' : ''}`}
                            />
                            <button
                              type="button"
                              aria-label={`Открыть ${product.name}`}
                              onClick={() => setSelectedProduct(product)}
                              className="absolute inset-0 z-10 cursor-pointer focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black"
                            />
                            <button
                              type="button"
                              aria-label={favoriteIdSet.has(String(product.id)) ? "Убрать из избранного" : "Добавить в избранное"}
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleFavorite(product.id);
                              }}
                              className="absolute z-20 top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                            >
                              <Heart
                                strokeWidth={1.5}
                                className={`w-5 h-5 ${favoriteIdSet.has(String(product.id)) ? "fill-black" : "fill-transparent"}`}
                              />
                            </button>
                            {product.is_new && (
                              <div className="absolute top-4 left-4 bg-black text-white px-2 py-1 text-[8px] tracking-[0.2em] font-extrabold">
                                NEW
                              </div>
                            )}
                          </div>
                          <div
                            role="button"
                            tabIndex={0}
                            aria-label={`Открыть ${product.name}`}
                            onClick={() => setSelectedProduct(product)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setSelectedProduct(product);
                              }
                            }}
                            className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 pt-1 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
                          >
                            <div className="flex flex-col gap-1 min-w-0">
                              {product.brand && (
                                <span className="text-[9px] tracking-[0.2em] text-gray-400 font-extrabold">{product.brand}</span>
                              )}
                              <h2 className="text-[11px] md:text-xs tracking-[0.06em] font-extrabold normal-case leading-snug">{product.name}</h2>
                              <p className="text-[10px] tracking-[0.1em] text-gray-500 font-bold">{product.category}</p>
                            </div>
                            <PriceDisplay
                              price={product.price}
                              priceByn={product.price_byn}
                              priceRub={product.price_rub}
                              size="sm"
                              align="start"
                            />
                          </div>
                        </article>
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
            type="button"
            aria-label="Закрыть товар"
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
                  <ImageWithFallback
                    src={activePdpImage} 
                    alt={selectedProduct.name}
                    className={`w-full h-full object-contain absolute inset-0 ${selectedProduct.name === 'STRUCTURE SHIRT' ? 'grayscale' : ''}`}
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

              <PriceDisplay
                price={selectedProduct.price}
                priceByn={selectedProduct.price_byn}
                priceRub={selectedProduct.price_rub}
                size="lg"
                align="start"
              />

              {selectedProduct.description && (
                <p className="text-xs leading-relaxed text-gray-600 normal-case">
                  {selectedProduct.description}
                </p>
              )}

              <div className="grid grid-cols-[52px_1fr] gap-3 mt-4">
                <button
                  type="button"
                  aria-label={favoriteIdSet.has(String(selectedProduct.id)) ? "Убрать из избранного" : "Добавить в избранное"}
                  onClick={() => toggleFavorite(selectedProduct.id)}
                  className="border border-black flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Heart
                    strokeWidth={1.5}
                    className={`w-5 h-5 ${favoriteIdSet.has(String(selectedProduct.id)) ? "fill-black" : "fill-transparent"}`}
                  />
                </button>
                <a
                  href={getTelegramCheckoutUrl(selectedProduct)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-black text-white border border-black py-4 text-xs tracking-[0.15em] transition-colors flex items-center justify-center gap-3 group cursor-pointer hover:bg-gray-800"
                >
                  <span>ПЕРЕЙТИ К ОФОРМЛЕНИЮ</span>
                  <ExternalLink strokeWidth={1} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
              
            </div>
          </div>
        </div>
      )}

      {/* Profile is rendered inline as a tab */}

      {/* Favorites drawer */}
      {isFavoritesOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
          <button
            type="button"
            aria-label="Закрыть избранное"
            className="absolute inset-0 cursor-default"
            onClick={() => setIsFavoritesOpen(false)}
          />
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col z-10">
            <header className="h-[66px] md:h-[74px] px-6 flex justify-between items-center border-b border-gray-200">
              <h2 className="text-sm tracking-[0.2em] font-medium">ИЗБРАННОЕ</h2>
              <button
                type="button"
                onClick={() => setIsFavoritesOpen(false)}
                className="p-1 hover:opacity-50 transition-opacity cursor-pointer"
              >
                <X strokeWidth={1} className="w-6 h-6" />
              </button>
            </header>

            {favoriteProducts.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center p-6 gap-5 text-center">
                <Heart strokeWidth={1} className="w-9 h-9 text-gray-300" />
                <p className="text-[10px] tracking-[0.25em] text-gray-400">В ИЗБРАННОМ ПОКА ПУСТО</p>
                <button
                  type="button"
                  onClick={() => setIsFavoritesOpen(false)}
                  className="border border-black px-6 py-3 text-[10px] tracking-[0.2em] hover:bg-black hover:text-white transition-colors cursor-pointer"
                >
                  ПЕРЕЙТИ К ТОВАРАМ
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {favoriteProducts.map((product) => {
                  const productImg = product.images?.[0] || product.image_url || product.img;
                  return (
                    <div key={`favorite-${product.id}`} className="flex gap-4 border-b border-gray-100 pb-6">
                      <button
                        type="button"
                        onClick={() => {
                          setIsFavoritesOpen(false);
                          setSelectedProduct(product);
                        }}
                        className="w-24 aspect-[3/4] bg-gray-100 shrink-0 overflow-hidden cursor-pointer"
                      >
                        <ImageWithFallback src={productImg} alt={product.name} className="w-full h-full object-contain" />
                      </button>
                      <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                        <div className="flex justify-between gap-3 items-start">
                          <button
                            type="button"
                            onClick={() => {
                              setIsFavoritesOpen(false);
                              setSelectedProduct(product);
                            }}
                            className="text-left cursor-pointer min-w-0"
                          >
                            <span className="text-[9px] tracking-[0.15em] text-gray-400 font-extrabold block mb-1">{product.brand}</span>
                            <h3 className="text-[11px] tracking-[0.08em] font-bold normal-case leading-snug">{product.name}</h3>
                          </button>
                          <button
                            type="button"
                            aria-label="Убрать из избранного"
                            onClick={() => toggleFavorite(product.id)}
                            className="p-1 shrink-0 cursor-pointer"
                          >
                            <Heart strokeWidth={1.5} className="w-5 h-5 fill-black" />
                          </button>
                        </div>
                        <PriceDisplay
                          price={product.price}
                          priceByn={product.price_byn}
                          priceRub={product.price_rub}
                          size="sm"
                          align="start"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Panel overlay */}
      {isAdminOpen && (
        <AdminPanel onClose={() => setIsAdminOpen(false)} />
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 z-40">
        <div className="flex justify-around items-center px-4 md:px-24 py-4 md:py-6 max-w-4xl mx-auto">
          {/* Catalog and Info are intentionally swapped: the shop is first. */}
          <button 
            onClick={() => {
              setActiveTab("catalog");
              setIsAdminOpen(false);
              setIsFavoritesOpen(false);
            }} 
            className={`flex flex-col items-center gap-2 group w-20 cursor-pointer transition-colors ${
              activeTab === "catalog" ? "text-black" : "text-gray-400 hover:text-black"
            }`}
          >
            <LayoutGrid strokeWidth={1.5} className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="text-[8px] md:text-[9px] tracking-[0.2em] font-bold">КАТАЛОГ</span>
          </button>

          <button 
            onClick={() => {
              setActiveTab("info");
              setIsAdminOpen(false);
              setIsFavoritesOpen(false);
            }} 
            className={`flex flex-col items-center gap-2 group w-20 cursor-pointer transition-colors ${
              activeTab === "info" ? "text-black" : "text-gray-400 hover:text-black"
            }`}
          >
            <Info strokeWidth={1.5} className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="text-[8px] md:text-[9px] tracking-[0.2em] font-bold">ИНФО</span>
          </button>
          
          <button 
            onClick={() => setIsFavoritesOpen(true)}
            className={`flex flex-col items-center gap-2 group w-20 cursor-pointer relative transition-colors ${isFavoritesOpen ? "text-black" : "text-gray-400 hover:text-black"}`}
          >
            <Heart strokeWidth={1.5} className="w-5 h-5 transition-transform group-hover:scale-110" />
            {favoriteProducts.length > 0 && (
              <span className="absolute top-0 right-4 bg-black text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                {favoriteProducts.length}
              </span>
            )}
            <span className="text-[8px] md:text-[9px] tracking-[0.12em] font-bold">ИЗБРАННОЕ</span>
          </button>

          {isTelegramAdmin && (
            <button 
              onClick={() => {
                setIsAdminOpen(true);
              }}
              className="flex flex-col items-center gap-2 group w-20 cursor-pointer text-gray-400 hover:text-black transition-colors"
            >
              <User strokeWidth={1.5} className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-[8px] md:text-[9px] tracking-[0.12em] font-bold">АДМИН</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
