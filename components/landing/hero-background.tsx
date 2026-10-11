"use client";

import { useEffect, useState } from "react";

const ROTATION_MS = 6000;
const FALLBACK_BACKGROUND = "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #134e4a 100%)";

export function HeroBackground({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [loadRest, setLoadRest] = useState(false);

  useEffect(() => {
    if (images.length < 2) return;
    setLoadRest(true);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setCurrent((index) => (index + 1) % images.length), ROTATION_MS);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) {
    return <div className="absolute inset-0" style={{ backgroundImage: FALLBACK_BACKGROUND }} />;
  }

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {images.map((url, index) => (
        <div
          key={`${url}-${index}`}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out motion-reduce:transition-none ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
          style={index === 0 || loadRest ? { backgroundImage: `url('${url}')` } : undefined}
        />
      ))}
    </div>
  );
}
