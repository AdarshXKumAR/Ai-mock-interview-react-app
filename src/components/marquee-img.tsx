import { useEffect, useState } from "react";

export const MarqueImg = ({ img }: { img: string }) => {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <img
      src={img}
      alt=""
      className="w-44 h-44 xl:w-52 xl:h-52 object-contain mx-12 xl:mx-16 transition-all duration-300"
      style={{
        filter: isDark
          ? "grayscale(1) invert(1) brightness(0.85)"
          : "grayscale(1)",
      }}
    />
  );
};