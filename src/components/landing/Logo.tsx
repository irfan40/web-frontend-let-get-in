import React from 'react';
import Link from './NavLink';

export interface LogoProps {
  dark?: boolean;
  className?: string;
}

export function Logo({ dark = false, className = '' }: LogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 font-extrabold text-lg group ${className}`}>
      <span className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white text-sm font-black shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
        LGI
      </span>
      <span className={`tracking-tight ${dark ? 'text-white' : 'text-slate-100'}`}>
        LetGet<span className="text-indigo-400">In</span>
      </span>
    </Link>
  );
}

export default Logo;
