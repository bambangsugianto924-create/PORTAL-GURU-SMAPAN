import React, { useState } from 'react';
import { Guru, ActiveTab, KopSuratConfig } from '../types';
import { 
  GraduationCap, 
  LogOut, 
  User, 
  Calendar, 
  Code2, 
  ChevronDown, 
  School,
  FileText,
  Settings2,
  RefreshCw,
  Printer
} from 'lucide-react';

interface NavbarProps {
  currentUser: Guru;
  kopSuratConfig: KopSuratConfig;
  onLogout: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenKopEditor: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  kopSuratConfig,
  onLogout,
  setActiveTab,
  onOpenKopEditor,
  onResetData
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="bg-emerald-950 border-b border-emerald-900/80 text-white sticky top-0 z-30 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-13">
          
          {/* Logo and Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs ring-1 ring-emerald-400/40">
              <GraduationCap className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white">Portal Guru</span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-emerald-800 text-emerald-200 border border-emerald-700">
                  Pro
                </span>
              </div>
              <p className="text-[10px] text-emerald-300 hidden sm:block truncate max-w-[180px] md:max-w-xs -mt-0.5">
                {kopSuratConfig.namaSekolah || currentUser.sekolah}
              </p>
            </div>
          </div>

          {/* Center Date & Status Indicator */}
          <div className="hidden lg:flex items-center gap-3 text-[11px] text-emerald-100 bg-emerald-900/80 px-3 py-1 rounded-full border border-emerald-800/80">
            <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
              <Calendar className="w-3 h-3" />
              <span>{todayFormatted}</span>
            </div>
            <span className="text-emerald-700">•</span>
            <span className="text-emerald-200 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Semester Genap 2025/2026
            </span>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            
            {/* Rekap & PDF Quick Button */}
            <button
              onClick={() => setActiveTab('rekap')}
              className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition duration-150 border border-amber-400"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Rekap & Cetak PDF</span>
              <span className="sm:hidden">Cetak</span>
            </button>

            {/* GAS Code Generator Quick Button */}
            <button
              id="nav-gas-generator-btn"
              onClick={() => setActiveTab('gas-generator')}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs transition duration-150 border border-emerald-700"
            >
              <Code2 className="w-3.5 h-3.5 text-cyan-300" />
              <span>Generator GAS</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                id="profile-dropdown-btn"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-900/90 hover:bg-emerald-850 border border-emerald-800/90 transition text-xs"
              >
                <div className="w-6 h-6 rounded-md bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center border border-emerald-500/50">
                  {currentUser.nama.charAt(0)}
                </div>
                <div className="text-left hidden md:block leading-tight">
                  <p className="text-[11px] font-semibold text-emerald-100 truncate max-w-[110px]">{currentUser.nama}</p>
                  <p className="text-[9px] text-emerald-300 truncate max-w-[110px]">{currentUser.mapel}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-emerald-300 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-1.5 w-64 bg-emerald-950 rounded-xl shadow-xl border border-emerald-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-white"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-emerald-800/80">
                    <p className="text-xs font-bold text-white truncate">{currentUser.nama}</p>
                    <p className="text-[10px] text-emerald-300 truncate">{currentUser.email}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-200 text-[9px] font-medium border border-emerald-700">
                      <School className="w-2.5 h-2.5 text-emerald-400" />
                      <span>{kopSuratConfig.namaSekolah}</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { onOpenKopEditor(); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-emerald-100 hover:bg-emerald-900 flex items-center gap-2 transition"
                    >
                      <Settings2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Edit Kop & Logo Sekolah</span>
                    </button>

                    <button
                      onClick={() => { setActiveTab('rekap'); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-emerald-100 hover:bg-emerald-900 flex items-center gap-2 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pusat Rekapitulasi & Cetak PDF</span>
                    </button>

                    <button
                      onClick={() => { setActiveTab('profil'); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-emerald-100 hover:bg-emerald-900 flex items-center gap-2 transition"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Profil & Pengaturan Guru</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('Reset semua data ke data contoh bawaan?')) {
                          onResetData();
                          setProfileDropdownOpen(false);
                        }
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-amber-300 hover:bg-emerald-900 flex items-center gap-2 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Muat Ulang Data Contoh</span>
                    </button>
                  </div>

                  <div className="border-t border-emerald-800/80 pt-1">
                    <button
                      id="logout-btn"
                      onClick={() => { onLogout(); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 transition font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
