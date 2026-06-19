import React, { useState } from "react";
import { X, Plus, Minus, Trash2, ArrowRight, Check, Loader2 } from "lucide-react";
import { supabase } from "../../utils/supabase";
import confetti from "canvas-confetti";
import { toast } from "sonner";

export interface CartItem {
  id: string | number;
  name: string;
  price: string;
  img: string;
  size: string;
  color: string;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string | number, size: string, color: string, delta: number) => void;
  onRemoveItem: (id: string | number, size: string, color: string) => void;
  onClearCart: () => void;
}

// Helpers for price parsing and formatting
export const parsePrice = (priceStr: string) => {
  const digits = priceStr.replace(/[^0-9]/g, "");
  return parseInt(digits) || 0;
};

export const formatPrice = (amount: number) => {
  return "€ " + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  // Calculate total price
  const totalPriceVal = cartItems.reduce(
    (sum, item) => sum + parsePrice(item.price) * item.quantity,
    0
  );
  const totalPriceStr = formatPrice(totalPriceVal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Введите ваше имя");
    if (!phone.trim()) return toast.error("Введите номер телефона");
    if (!address.trim()) return toast.error("Укажите адрес доставки");

    setIsSubmitting(true);

    try {
      const orderData = {
        customer_name: name,
        customer_phone: phone,
        customer_telegram: telegram.replace("@", ""),
        delivery_address: address,
        comment: comment,
        items: cartItems,
        total_price: totalPriceStr,
        status: "new",
      };

      const { data, error } = await supabase
        .from("orders")
        .insert([orderData])
        .select();

      if (error) {
        throw new Error(error.message);
      }

      // Order created successfully!
      const createdOrder = data && data[0];
      setOrderSuccess(createdOrder || { id: "SUCCESS" });
      
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#000000", "#555555", "#aaaaaa", "#ffffff"],
      });

      // Clear Cart
      onClearCart();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Ошибка при оформлении заказа. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setOrderSuccess(null);
    setIsCheckoutMode(false);
    // Reset form
    setName("");
    setPhone("");
    setTelegram("");
    setAddress("");
    setComment("");
    onClose();
  };

  const handleTelegramCheckout = () => {
    let messageText = "Здравствуйте! Хочу оформить заказ:\n\n";
    cartItems.forEach((item, index) => {
      messageText += `${index + 1}. ${item.name} (Размер: ${item.size}, Цвет: ${item.color}) - ${item.quantity} шт. | ${item.price}\n`;
    });
    messageText += `\nИтоговая сумма: ${totalPriceStr}`;
    
    const encodedText = encodeURIComponent(messageText);
    const tgUsername = "underbuy_manager"; // Никнейм менеджера в Telegram
    const tgLink = `https://t.me/${tgUsername}?text=${encodedText}`;
    
    window.open(tgLink, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end font-sans uppercase">
      {/* Backdrop click to close (only if not success screen) */}
      <div
        className="absolute inset-0"
        onClick={() => !orderSuccess && onClose()}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10">
        
        {/* Success Screen Overlay */}
        {orderSuccess && (
          <div className="absolute inset-0 bg-white z-20 p-6 md:p-10 flex flex-col justify-center text-center">
            <div className="max-w-xs mx-auto flex flex-col gap-8">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto">
                <Check strokeWidth={1} className="w-8 h-8" />
              </div>
              
              <div>
                <h2 className="text-xl tracking-[0.3em] font-light mb-2">ЗАКАЗ ПРИНЯТ</h2>
                <p className="text-[9px] tracking-[0.2em] text-gray-400">
                  НОМЕР ЗАКАЗА: {orderSuccess.id ? orderSuccess.id.slice(0, 8).toUpperCase() : "UB-ORDER"}
                </p>
              </div>

              <p className="text-xs leading-relaxed text-gray-600 normal-case">
                Спасибо за заказ. Менеджер свяжется с вами по указанному телефону или в Telegram для подтверждения доставки и оплаты.
              </p>

              <button
                onClick={handleSuccessClose}
                className="w-full bg-black text-white py-4 text-xs tracking-[0.2em] hover:bg-gray-800 transition-colors cursor-pointer"
              >
                ВЕРНУТЬСЯ НА САЙТ
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-sm tracking-[0.2em] font-medium">
            {isCheckoutMode ? "ОФОРМЛЕНИЕ ЗАКАЗА" : "КОРЗИНА"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:opacity-50 transition-opacity cursor-pointer"
          >
            <X strokeWidth={1} className="w-6 h-6" />
          </button>
        </header>

        {/* Content Body */}
        {cartItems.length === 0 && !isCheckoutMode ? (
          <div className="flex-1 flex flex-col justify-center items-center p-6 gap-4">
            <p className="text-xs tracking-[0.3em] text-gray-400">КОРЗИНА ПУСТА</p>
            <button
              onClick={onClose}
              className="border border-black px-6 py-3 text-[10px] tracking-[0.2em] hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
              ПРОДОЛЖИТЬ ПОКУПКИ
            </button>
          </div>
        ) : !isCheckoutMode ? (
          /* Cart items list */
          <>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 border-b border-gray-100 pb-6">
                  {/* Image */}
                  <div className="w-20 aspect-[3/4] bg-gray-100 shrink-0 overflow-hidden">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-[11px] tracking-[0.1em] font-medium">{item.name}</h3>
                        <button
                          onClick={() => onRemoveItem(item.id, item.size, item.color)}
                          className="text-gray-400 hover:text-black transition-colors cursor-pointer"
                        >
                          <Trash2 strokeWidth={1} className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[9px] tracking-[0.1em] text-gray-400 mt-1">
                        РАЗМЕР: {item.size} | ЦВЕТ: {item.color}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-gray-200">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.size, item.color, -1)}
                          className="px-2 py-1 text-gray-500 hover:text-black transition-colors"
                        >
                          <Minus strokeWidth={1} className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-[10px] tracking-[0.1em] font-medium">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.size, item.color, 1)}
                          className="px-2 py-1 text-gray-500 hover:text-black transition-colors"
                        >
                          <Plus strokeWidth={1} className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="price-text text-[14px] text-black">
                        {formatPrice(parsePrice(item.price) * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Summary */}
            <div className="p-6 border-t border-gray-200 flex flex-col gap-4">
              <div className="flex justify-between items-center text-xs tracking-[0.2em]">
                <span>ИТОГО</span>
                <span className="price-text text-base text-black">{totalPriceStr}</span>
              </div>
              
              <button
                onClick={() => setIsCheckoutMode(true)}
                className="w-full bg-black text-white py-4 text-xs tracking-[0.2em] hover:bg-gray-800 transition-colors flex items-center justify-center gap-4 group cursor-pointer"
              >
                <span>ПЕРЕЙТИ К ОФОРМЛЕНИЮ</span>
                <ArrowRight strokeWidth={1} className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] text-gray-400 tracking-[0.2em]">ВАШЕ ИМЯ (ФИО) *</label>
                <input
                  type="text"
                  required
                  placeholder="ИВАН ИВАНОВ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-b border-gray-200 py-2 text-xs tracking-[0.1em] focus:outline-none focus:border-black placeholder:text-gray-200"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] text-gray-400 tracking-[0.2em]">ТЕЛЕФОН *</label>
                <input
                  type="tel"
                  required
                  placeholder="+7 (999) 999-99-99"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-b border-gray-200 py-2 text-xs tracking-[0.1em] focus:outline-none focus:border-black placeholder:text-gray-200"
                />
              </div>

              {/* Telegram */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] text-gray-400 tracking-[0.2em]">TELEGRAM (@USERNAME)</label>
                <input
                  type="text"
                  placeholder="@USERNAME"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  className="border-b border-gray-200 py-2 text-xs tracking-[0.1em] focus:outline-none focus:border-black placeholder:text-gray-200"
                />
              </div>

              {/* Address */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] text-gray-400 tracking-[0.2em]">АДРЕС ДОСТАВКИ (СДЭК / ПОЧТА / КВАРТИРА) *</label>
                <input
                  type="text"
                  required
                  placeholder="Г. МОСКВА, УЛ. ЛЕНИНА 1, ОФИС СДЭК MSK10"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="border-b border-gray-200 py-2 text-xs tracking-[0.1em] focus:outline-none focus:border-black placeholder:text-gray-200"
                />
              </div>

              {/* Comment */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] text-gray-400 tracking-[0.2em]">КОММЕНТАРИЙ К ЗАКАЗУ</label>
                <textarea
                  placeholder="НАПРИМЕР: ДОСТАВКА В СБ, ПОЗВОНИТЬ ЗА ЧАС"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  className="border-b border-gray-200 py-2 text-xs tracking-[0.1em] focus:outline-none focus:border-black resize-none placeholder:text-gray-200 normal-case"
                />
              </div>
            </div>

            {/* Footer Form Submit */}
            <div className="p-6 border-t border-gray-200 flex flex-col gap-4 bg-white">
              <div className="flex justify-between items-center text-xs tracking-[0.2em] mb-2">
                <span>ИТОГО К ОПЛАТЕ</span>
                <span className="price-text text-base text-black">{totalPriceStr}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setIsCheckoutMode(false)}
                  className="border border-black py-4 text-xs tracking-[0.2em] hover:bg-gray-50 transition-colors text-center cursor-pointer"
                >
                  НАЗАД
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-black text-white py-4 text-xs tracking-[0.2em] hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>ОТПРАВКА...</span>
                    </>
                  ) : (
                    <span>ЗАКАЗАТЬ</span>
                  )}
                </button>
              </div>

              {/* Write to manager button */}
              <button
                type="button"
                onClick={handleTelegramCheckout}
                className="w-full border border-black text-black py-4 text-xs tracking-[0.2em] hover:bg-black hover:text-white transition-all text-center cursor-pointer flex items-center justify-center gap-2"
              >
                <span>БЫСТРЫЙ ЗАКАЗ В TELEGRAM (НАПИСАТЬ МЕНЕДЖЕРУ)</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
