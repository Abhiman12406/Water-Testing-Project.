'use client';

import React, { useRef, useEffect } from 'react';
import {
  Sliders,
  Layers,
  UploadCloud,
  BarChart2,
  Database,
  RefreshCw,
  Sun,
  Moon,
  Droplets
} from 'lucide-react';
import gsap from 'gsap';

interface NavbarProps {
  activeTab: 'predict' | 'compare' | 'batch' | 'benchmark' | 'stations';
  setActiveTab: (tab: 'predict' | 'compare' | 'batch' | 'benchmark' | 'stations') => void;
  backendOnline: boolean | null;
  onRefreshHealth: () => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  backendOnline,
  onRefreshHealth,
  theme,
  setTheme,
}) => {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const navItems = [
    { id: 'predict', label: 'PREDICT', icon: Sliders },
    { id: 'compare', label: 'CONSENSUS', icon: Layers },
    { id: 'batch', label: 'BATCH CSV', icon: UploadCloud },
    { id: 'benchmark', label: 'BENCHMARKS', icon: BarChart2 },
    { id: 'stations', label: '37 SITES', icon: Database },
  ] as const;

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 bg-[var(--neo-surface)] border-b-[3px] border-[var(--neo-border)] transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Neo-Brutalist Brand Block */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-[var(--neo-yellow)] text-black border-2 border-[var(--neo-border)] px-3 py-1.5 shadow-[3px_3px_0px_0px_var(--neo-shadow)] font-black text-sm tracking-tight rounded-sm">
              <Droplets className="w-5 h-5 fill-current stroke-[2.5]" />
              <span className="font-extrabold uppercase tracking-wide">AQUAGUARD</span>
              <span className="font-mono text-xs bg-black text-white px-1.5 py-0.5 rounded-xs">AI</span>
            </div>
            <div className="hidden sm:flex items-center">
              <span className="neo-badge bg-[var(--neo-cyan-light)] text-[var(--neo-text)] border-[1.5px] border-[var(--neo-border)]">
                USGS TELEMETRY
              </span>
            </div>
          </div>

          {/* Neo-Brutalist Segmented Tabs (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1.5 p-1 bg-[var(--neo-surface-alt)] border-2 border-[var(--neo-border)] rounded-md shadow-[3px_3px_0px_0px_var(--neo-shadow)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-sm cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[var(--neo-yellow)] text-black border-2 border-[var(--neo-border)] shadow-[2px_2px_0px_0px_var(--neo-shadow)] translate-x-[-1px] translate-y-[-1px]'
                      : 'text-[var(--neo-text-muted)] hover:text-[var(--neo-text)] hover:bg-[var(--neo-surface)] border-2 border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Widgets (Status + Theme) */}
          <div className="flex items-center space-x-2.5">
            {/* Backend Health Pill */}
            <button
              onClick={onRefreshHealth}
              title="Click to ping FastAPI telemetry server"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-sm text-xs font-bold font-mono border-2 border-[var(--neo-border)] shadow-[2px_2px_0px_0px_var(--neo-shadow)] cursor-pointer transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] ${
                backendOnline === true
                  ? 'bg-[var(--neo-green)] text-black'
                  : backendOnline === false
                  ? 'bg-[var(--neo-red)] text-white'
                  : 'bg-[var(--neo-yellow)] text-black'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full border border-black ${
                  backendOnline === true
                    ? 'bg-black animate-pulse'
                    : backendOnline === false
                    ? 'bg-white'
                    : 'bg-black animate-ping'
                }`}
              />
              <span>
                {backendOnline === true ? 'API: ONLINE' : backendOnline === false ? 'API: OFFLINE' : 'CONNECTING...'}
              </span>
              <RefreshCw className="w-3 h-3 stroke-[2.5]" />
            </button>

            {/* Neo-Brutalism Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Neo-Brutalist Theme"
              className="w-9 h-9 flex items-center justify-center bg-[var(--neo-surface)] border-2 border-[var(--neo-border)] shadow-[2px_2px_0px_0px_var(--neo-shadow)] rounded-sm cursor-pointer hover:bg-[var(--neo-surface-alt)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] text-[var(--neo-text)]"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[var(--neo-yellow)] stroke-[2.5]" />
              ) : (
                <Moon className="w-4 h-4 text-black stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto py-2.5 space-x-2 border-t-2 border-[var(--neo-border)] no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-bold rounded-sm whitespace-nowrap cursor-pointer border-2 border-[var(--neo-border)] ${
                  isActive
                    ? 'bg-[var(--neo-yellow)] text-black shadow-[2px_2px_0px_0px_var(--neo-shadow)]'
                    : 'bg-[var(--neo-surface)] text-[var(--neo-text)]'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
