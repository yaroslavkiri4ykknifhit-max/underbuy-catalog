import React, { useEffect, useState } from "react";

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false);
  const { src, alt, style, className, ...rest } = props;
  const hasSource = typeof src === "string" && src.trim().length > 0;

  useEffect(() => {
    setDidError(false);
  }, [src]);

  if (didError || !hasSource) {
    return (
      <div
        className={`inline-flex bg-white text-center align-middle items-center justify-center ${className ?? ""}`}
        style={style}
        role="img"
        aria-label={alt || "Изображение товара недоступно"}
      >
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-black/35 select-none">
          <span className="text-xl md:text-2xl font-black tracking-[-0.08em] lowercase">underbuy</span>
          <span className="text-[8px] font-extrabold tracking-[0.18em] uppercase">фото обновляется</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={() => setDidError(true)}
    />
  );
}
