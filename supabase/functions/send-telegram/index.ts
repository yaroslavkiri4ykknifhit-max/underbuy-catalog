// Supabase Edge Function: send-telegram
// Этот файл предназначен для развертывания в Supabase Edge Functions.
// Запуск локально/деплой: supabase functions deploy send-telegram
// Для работы требуются переменные окружения в Supabase: TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apiKey, content-type",
};

serve(async (req) => {
  // Обработка CORS preflight запросов
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!BOT_TOKEN || !CHAT_ID) {
      throw new Error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID environment variables are not set.");
    }

    const payload = await req.json();
    console.log("Received payload:", payload);

    // Поддерживаем как прямой вызов API, так и вызов через Database Webhook от Supabase
    // В Database Webhook данные новой строки находятся в payload.record
    const order = payload.record || payload;

    if (!order || !order.customer_name) {
      return new Response(
        JSON.stringify({ error: "Invalid order data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Форматируем список товаров
    let itemsText = "";
    if (Array.isArray(order.items)) {
      order.items.forEach((item: any, index: number) => {
        itemsText += `\n${index + 1}. <b>${item.name}</b>\n   Размер: <code>${item.size || "OS"}</code> | Цвет: <code>${item.color || "Не указан"}</code>\n   Кол-во: ${item.quantity} шт. | Цена: ${item.price}\n`;
      });
    } else {
      itemsText = "\n<i>Список товаров пуст или поврежден</i>";
    }

    // Форматируем никнейм Telegram
    let telegramUser = order.customer_telegram || "не указан";
    if (telegramUser !== "не указан" && !telegramUser.startsWith("@")) {
      telegramUser = "@" + telegramUser;
    }

    // Собираем сообщение для Telegram
    const message = `
📦 <b>НОВЫЙ ЗАКАЗ (UNDERBUY)</b>
───────────────────
👤 <b>Клиент:</b> ${order.customer_name}
📞 <b>Телефон:</b> ${order.customer_phone}
✈️ <b>Telegram:</b> ${telegramUser}
📍 <b>Адрес доставки:</b> ${order.delivery_address}
💬 <b>Комментарий:</b> ${order.comment || "нет"}
───────────────────
🛒 <b>Товары:</b>${itemsText}
───────────────────
💰 <b>Итоговая сумма:</b> <b>${order.total_price}</b>
`;

    // Отправляем запрос к Telegram API
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
      console.error("Telegram API Error:", result);
      throw new Error(`Telegram API responded with error: ${result.description || "Unknown error"}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error processing request:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
