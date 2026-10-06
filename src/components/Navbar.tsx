import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  FileSpreadsheet,
  Tablet,
  BarChart3,
  PlusCircle,
  Globe,
  Clock,
  Building2
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface NavbarProps {
  currentTab: 'dashboard' | 'timeline' | 'reservations' | 'kiosk' | 'analytics';
  onSelectTab: (tab: 'dashboard' | 'timeline' | 'reservations' | 'kiosk' | 'analytics') => void;
  language: Language;
  onToggleLanguage: () => void;
  onOpenNewBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  language,
  onToggleLanguage,
  onOpenNewBooking
}) => {
  const t = translations[language];
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString(language === 'lo' ? 'lo-LA' : 'en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const formattedDate = time.toLocaleDateString(language === 'lo' ? 'lo-LA' : 'en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'timeline', label: t.timeline, icon: CalendarDays },
    { id: 'reservations', label: t.reservations, icon: FileSpreadsheet },
    { id: 'kiosk', label: t.kiosk, icon: Tablet },
    { id: 'analytics', label: t.analytics, icon: BarChart3 },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 font-mono">
                  MRB-SYSTEM
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>FIREBASE</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block line-clamp-1">
                {language === 'lo'
                  ? 'ລະບົບການບໍລິຫານຈັດການ ການຈອງຫ້ອງປະຊຸມ'
                  : 'Meeting Room Booking & Management'}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/70">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Live Clock */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono text-slate-600 border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <span>{formattedDate}</span>
              <span className="font-bold text-slate-900">{formattedTime}</span>
            </div>

            {/* Language Switcher */}
            <button
              onClick={onToggleLanguage}
              title={language === 'lo' ? 'ປ່ຽນເປັນພາສາອັງກິດ' : 'Switch to Lao'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'lo' ? '🇱🇦 ລາວ' : '🇬🇧 EN'}</span>
            </button>

            {/* Book Button */}
            <button
              onClick={onOpenNewBooking}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-600/30 hover:shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t.newBooking}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive ? 'text-indigo-600 font-bold' : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
