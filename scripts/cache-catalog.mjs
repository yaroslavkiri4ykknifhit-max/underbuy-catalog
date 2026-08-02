import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(scriptDirectory, "../public/products-cache.json");
const supabaseUrl = (
  process.env.VITE_SUPABASE_URL || "https://vwwwbndppuevwumnyvlj.supabase.co"
).replace(/\/$/, "");
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_ARbHJCJKF99slgCONTD_ag_hzEWXOXf";
const supabasePageSize = 500;
const telegramChannel = "underrbuy_catalog";
const knownTelegramLastId = 4195;
const catalogWindowSize = 320;
const concurrency = 12;

function decodeHtml(value) {
  const namedEntities = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code) => {
      if (code.startsWith("#x")) return String.fromCodePoint(parseInt(code.slice(2), 16));
      if (code.startsWith("#")) return String.fromCodePoint(parseInt(code.slice(1), 10));
      return namedEntities[code.toLowerCase()] ?? entity;
    })
    .replace(/\u200b/g, "");
}

function htmlToText(value) {
  return decodeHtml(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\r/g, ""),
  )
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

function inferCategory(text) {
  const value = text.toUpperCase();
  const categories = [
    ["ОБУВЬ", ["SHOE", "SNEAKER", "RUNNER", "BOOT", "LOAFER", "DERBY", "SLIDE", "SANDAL", "TYSON", "КРОССОВ", "БОТИН", "ЛОФЕР", "ОБУВ"]],
    ["ДЖИНСЫ", ["JEANS", "DENIM", "ДЖИНС"]],
    ["ФУТБОЛКИ", ["T-SHIRT", "TSHIRT", " TEE", "ФУТБОЛ"]],
    ["ЛОНГИ/СВИТШОТЫ", ["LONGSLEEVE", "LONG SLEEVE", "SWEATSHIRT", "SWEATER", "CARDIGAN", "СВИТШОТ", "ЛОНГСЛИВ", "СВИТЕР", "КАРДИГАН"]],
    ["ХУДИ/ЗИПКИ", ["HOODIE", "ZIP HOODIE", "ZIP-UP", "ХУДИ", "ЗИПК"]],
    ["ПУХОВИКИ", ["PUFFER", "DOWN JACKET", "ПУХОВ"]],
    ["БОМБЕРЫ", ["BOMBER", "БОМБЕР"]],
    ["ЖАКЕТЫ", ["JACKET", "COAT", "BLAZER", "КУРТК", "ЖАКЕТ", "ПАЛЬТО"]],
    ["ШТАНЫ", ["PANTS", "TROUSERS", "JOGGER", "ШТАН", "БРЮК"]],
    ["СУМКИ", ["BAG", "BACKPACK", "СУМК", "РЮКЗАК"]],
    ["РЕМНИ", ["BELT", "РЕМЕН"]],
    ["ГОЛОВНЫЕ УБОРЫ", ["CAP", "BEANIE", "HAT", "КЕПК", "ШАПК", "ПАНАМ"]],
    ["АКСЕССУАРЫ", ["RING", "NECKLACE", "BRACELET", "GLASSES", "WALLET", "КОЛЬЦ", "ЦЕПОЧ", "БРАСЛЕТ", "ОЧКИ", "КОШЕЛ"]],
  ];

  return categories.find(([, keywords]) => keywords.some((keyword) => value.includes(keyword)))?.[0] ?? "АКСЕССУАРЫ";
}

function inferBrand(title) {
  const value = title.toUpperCase();
  const brands = [
    ["ENFANTS RICHES DEPRIMES", "ENFANTS RICHES DEPRIMES"],
    ["HYSTERIC GLAMOUR", "HYSTERIC GLAMOUR"],
    ["IF SIX WAS NINE", "IF SIX WAS NINE"],
    ["SAINT LAURENT", "SAINT LAURENT"],
    ["NUMBER NINE", "NUMBER (N)INE"],
    ["NUMBER (N)INE", "NUMBER (N)INE"],
    ["HOOD BY AIR", "HOOD BY AIR"],
    ["NO FAITH STUDIOS", "NO FAITH STUDIOS"],
    ["ISABEL MARANT", "ISABEL MARANT"],
    ["RICK OWENS", "RICK OWENS"],
    ["CHROME HEARTS", "CHROME HEARTS"],
    ["Y-PROJECT", "Y-PROJECT"],
    ["ALEXANDER DIGENOVA", "ALEXANDER DIGENOVA"],
    ["PROTOCOL INDEX", "PROTOCOL INDEX"],
    ["GIVENCHY", "GIVENCHY"],
    ["UNDERCOVER", "UNDERCOVER"],
    ["DIOR", "DIOR"],
    ["LGB", "LGB"],
    ["HBA", "HOOD BY AIR"],
    ["9MICE", "9MICE"],
  ];

  return brands.find(([needle]) => value.includes(needle))?.[1]
    ?? title.replace(/^['"]|['"]$/g, "").split(/\s+/).slice(0, 2).join(" ");
}

function parseAmount(value) {
  if (!value) return null;
  const amount = Number(value.replace(/[\s.,]/g, ""));
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function parseTelegramProduct(html, messageId) {
  if (!html.includes(`data-post="${telegramChannel}/${messageId}"`)) return null;

  const textMatch = html.match(/<div class="tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/i);
  if (!textMatch) return null;

  const rawText = htmlToText(textMatch[1]);
  const lines = rawText.split("\n").filter(Boolean);
  const title = lines[0]?.replace(/^[•—–-]+\s*/, "").trim();
  const priceByn = parseAmount(
    rawText.match(/(?:ЦЕНА|PRICE)\s*:?\s*([\d\s.,]+)(?:\s*[-–—]\s*[\d\s.,]+)?\s*BYN/i)?.[1],
  );
  const priceRub = parseAmount(rawText.match(/([\d\s.,]+)\s*₽/i)?.[1]);

  const images = Array.from(
    html.matchAll(/tgme_widget_message_photo_wrap[^>]*style="[^"]*background-image:url\('([^']+)'\)/gi),
    (match) => decodeHtml(match[1]),
  );

  if (!title || images.length === 0 || (!priceByn && !priceRub)) return null;

  const createdAt = html.match(/<time[^>]*datetime="([^"]+)"/i)?.[1] ?? null;

  return {
    telegram_message_id: messageId,
    category: inferCategory(`${title}\n${rawText}`),
    title,
    brand: inferBrand(title),
    sizes: [],
    price_byn: priceByn,
    price_rub: priceRub,
    contact: "@und3rme",
    images: [...new Set(images)],
    raw_text: rawText,
    created_at: createdAt,
  };
}

async function fetchTelegramPost(messageId) {
  const response = await fetch(
    `https://t.me/${telegramChannel}/${messageId}?embed=1&mode=tme`,
    { headers: { "User-Agent": "UNDERBUY catalog backup/1.0" } },
  );

  if (!response.ok) return { exists: false, product: null };
  const html = await response.text();
  return {
    exists: html.includes(`data-post="${telegramChannel}/${messageId}"`),
    product: parseTelegramProduct(html, messageId),
  };
}

async function findLatestTelegramId() {
  let latestId = knownTelegramLastId;
  let candidate = knownTelegramLastId + 1;
  let consecutiveMissing = 0;

  while (consecutiveMissing < 30 && candidate < knownTelegramLastId + 600) {
    const { exists } = await fetchTelegramPost(candidate);
    if (exists) {
      latestId = candidate;
      consecutiveMissing = 0;
    } else {
      consecutiveMissing += 1;
    }
    candidate += 1;
  }

  return latestId;
}

async function mapWithConcurrency(values, worker) {
  const results = new Array(values.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < values.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(values[currentIndex]);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, runWorker));
  return results;
}

async function fetchTelegramCatalog() {
  const latestId = await findLatestTelegramId();
  const firstId = Math.max(1, latestId - catalogWindowSize + 1);
  const ids = Array.from({ length: latestId - firstId + 1 }, (_, index) => firstId + index);
  const responses = await mapWithConcurrency(ids, fetchTelegramPost);

  const parsedProducts = responses
    .map(({ product }) => product)
    .filter(Boolean)
    .sort((a, b) => b.telegram_message_id - a.telegram_message_id);

  const groupedProducts = new Map();
  for (const product of parsedProducts) {
    const groupKey = `${product.title}\n${product.raw_text}`.toLowerCase();
    const existing = groupedProducts.get(groupKey);

    if (existing) {
      existing.images = [...new Set([...existing.images, ...product.images])];
    } else {
      groupedProducts.set(groupKey, { ...product });
    }
  }

  return [...groupedProducts.values()];
}

async function fetchSupabaseCatalog() {
  if (!supabaseUrl || !supabaseKey) return [];

  const products = [];
  let beforeTelegramMessageId = null;

  while (true) {
    const query = new URLSearchParams({
      select: "*",
      order: "telegram_message_id.desc",
      limit: String(supabasePageSize),
    });

    if (beforeTelegramMessageId !== null) {
      query.set("telegram_message_id", `lt.${beforeTelegramMessageId}`);
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/products?${query}`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase catalog request failed (${response.status})`);
    }

    const page = await response.json();
    if (!Array.isArray(page)) break;
    products.push(...page);

    if (page.length < supabasePageSize) break;

    const nextCursor = Number(page[page.length - 1]?.telegram_message_id);
    if (!Number.isFinite(nextCursor) || nextCursor === beforeTelegramMessageId) break;
    beforeTelegramMessageId = nextCursor;
  }

  return products;
}

async function readPreviousCatalog() {
  try {
    const payload = JSON.parse(await readFile(outputPath, "utf8"));
    return Array.isArray(payload?.products) ? payload.products : [];
  } catch {
    return [];
  }
}

let source = "supabase";
let products = [];

try {
  products = await fetchSupabaseCatalog();
} catch (error) {
  console.warn(`Supabase unavailable: ${error.message}`);
}

if (products.length === 0) {
  source = "telegram";
  try {
    products = await fetchTelegramCatalog();
  } catch (error) {
    console.warn(`Telegram fallback unavailable: ${error.message}`);
  }
}

if (products.length === 0) {
  source = "previous-cache";
  products = await readPreviousCatalog();
}

if (products.length === 0) {
  throw new Error("Catalog snapshot is empty; refusing to publish an empty storefront");
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), source, products }, null, 2)}\n`,
  "utf8",
);

console.log(`Cached ${products.length} products from ${source}`);
