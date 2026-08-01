"use client";

import React, { useState } from 'react';
import Logo from './Logo';
import Link from './NavLink';
import { Menu, X, ArrowRight } from 'lucide-react';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Dimensions', href: '#dimensions' },
    { label: 'Compare', href: '#compare' },
    { label: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/auth"
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2"
          >
            Sign In
          </Link>
          <Link
            to="/auth"
            className="bg-gradient-brand text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden py-4 border-t border-white/5 bg-slate-950/95 backdrop-blur-xl">
          <div className="flex flex-col space-y-3 px-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 text-slate-200 font-semibold rounded-lg hover:bg-white/5"
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 bg-gradient-brand text-white font-bold rounded-xl shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
