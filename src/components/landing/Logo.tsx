import React from 'react';

export interface LogoProps {
  dark?: boolean;
}

export function Logo({ dark = false }: LogoProps) {
  return (
    <a href="#top" className="flex items-center gap-2.5 group shrink-0">
      <div
        className={
          dark
            ? "w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold text-sm"
            : "w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-primary-foreground font-bold text-sm shadow-glow"
        }
      >
        L
      </div>
      <span
        className={`text-xl font-bold tracking-tight ${dark ? "text-white" : "text-ink"}`}
      >
        Let<span className={dark ? "text-primary-glow" : "text-primary-glow"}>Get</span>In
      </span>
    </a>
  );
}

export default Logo;
