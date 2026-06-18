// Supabase Edge Function: telegram-bot
// Этот файл обрабатывает вебхуки от Telegram-бота.
// Запуск локально/деплой: supabase functions deploy telegram-bot
// Требуемые переменные окружения в Supabase: TELEGRAM_BOT_TOKEN

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apiKey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN environment variable is not set.");
    }

    const update = await req.json();
    console.log("Received Telegram Update:", update);

    // Обрабатываем только текстовые сообщения (обычно /start)
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const firstName = update.message.from.first_name || "друг";

      // Если пользователь написал /start или поздоровался
      if (text.startsWith("/start")) {
        const welcomeMessage = `
Привет, ${firstName}! 👋
Добро пожаловать в <b>UNDERBUY</b>.

Мы создали высокотехнологичный каталог одежды с удобной корзиной и быстрым оформлением.

Нажми на кнопку <b>«ОТКРЫТЬ КАТАЛОГ»</b> ниже, чтобы запустить наше мини-приложение (Mini App) прямо внутри Telegram и выбрать вещи.
`;

        const webAppUrl = "https://yaroslavkiri4ykknifhit-max.github.io/underbuy-catalog/";

        // Отправляем приветственное сообщение с кнопкой Web App
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        await fetch(telegramUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeMessage,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🛍️ ОТКРЫТЬ КАТАЛОГ",
                    web_app: { url: webAppUrl },
                  },
                ],
              ],
            },
          }),
        });
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error processing webhook:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
