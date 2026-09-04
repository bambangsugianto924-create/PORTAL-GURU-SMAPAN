import React from 'react';
import { ActiveTab, Guru, Kelas, Siswa } from '../types';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Award,
  BookOpenCheck,
  School,
  Code2,
  UserCircle,
  FileText,
  Settings2,
  ChevronRight,
  Sparkles,
  MessageSquare
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: Guru;
  kelasList: Kelas[];
  siswaList: Siswa[];
  onOpenKopEditor?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  kelasList,
  siswaList,
  onOpenKopEditor
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      color: 'text-emerald-400'
    },
    {
      id: 'laporan-wa' as ActiveTab,
      label: 'Laporan WhatsApp',
      icon: MessageSquare,
      badge: 'WA Ortu',
      color: 'text-emerald-300',
      highlight: true
    },
    {
      id: 'kelas' as ActiveTab,
      label: 'Data Kelas',
      icon: School,
      badge: kelasList.length,
      color: 'text-teal-400'
    },
    {
      id: 'siswa' as ActiveTab,
      label: 'Data Siswa',
      icon: Users,
      badge: siswaList.length,
      color: 'text-emerald-400'
    },
    {
      id: 'absen' as ActiveTab,
      label: 'Presensi / Absen',
      icon: UserCheck,
      badge: 'Harian',
      color: 'text-lime-400'
    },
    {
      id: 'nilai' as ActiveTab,
      label: 'Penilaian / Nilai',
      icon: Award,
      badge: 'Leger',
      color: 'text-amber-400'
    },
    {
      id: 'jurnal' as ActiveTab,
      label: 'Jurnal Mengajar',
      icon: BookOpenCheck,
      badge: 'Harian',
      color: 'text-emerald-300'
    },
    {
      id: 'rekap' as ActiveTab,
      label: 'Rekap & Cetak PDF',
      icon: FileText,
      badge: 'PDF',
      color: 'text-yellow-400'
    },
    {
      id: 'gas-generator' as ActiveTab,
      label: 'Generator Script GAS',
      icon: Code2,
      badge: 'Pemula',
      color: 'text-cyan-400'
    },
    {
      id: 'profil' as ActiveTab,
      label: 'Profil Guru & Kop',
      icon: UserCircle,
      badge: null,
      color: 'text-slate-400'
    }
  ];

  return (
    <aside className="w-full lg:w-60 bg-emerald-950 text-slate-100 border-r border-emerald-900/80 flex flex-col justify-between p-3 shadow-md shrink-0">
      <div className="space-y-4">
        
        {/* Guru Info Card (Emerald Green Theme) */}
        <div className="p-2.5 bg-emerald-900/70 border border-emerald-800/80 rounded-xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
            {currentUser.nama.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate leading-tight">{currentUser.nama}</h4>
            <p className="text-[10px] text-emerald-200 truncate">{currentUser.mapel}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[9px] font-semibold text-emerald-300">Guru Aktif</span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          <p className="text-[9px] font-bold text-emerald-400/70 uppercase tracking-wider px-2.5 mb-1.5">
            Navigasi Utama
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs font-bold ring-1 ring-emerald-500'
                    : item.highlight
                    ? 'text-emerald-100 bg-emerald-900/90 hover:bg-emerald-800 border border-emerald-700/80'
                    : 'text-emerald-100/80 hover:bg-emerald-900/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      isActive
                        ? 'bg-emerald-900 text-emerald-200'
                        : item.highlight
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-emerald-900/80 text-emerald-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Kop & GAS Toolbox */}
      <div className="pt-3 mt-4 border-t border-emerald-900/90 space-y-2">
        {onOpenKopEditor && (
          <button
            onClick={onOpenKopEditor}
            className="w-full text-left text-[11px] font-semibold text-emerald-200 hover:text-white bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-800/80 p-2 rounded-lg transition flex items-center justify-between"
          >
            <div className="flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kop & Logo Sekolah</span>
            </div>
            <span className="text-[9px] bg-emerald-800 px-1 rounded text-emerald-300">Edit</span>
          </button>
        )}

        <div className="p-2.5 bg-emerald-900/50 border border-emerald-800/60 rounded-lg text-xs">
          <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px] mb-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Google Apps Script</span>
          </div>
          <p className="text-[10px] text-emerald-200/70 leading-snug mb-2">
            Simpan data ke Google Sheets otomatis dan gratis.
          </p>
          <button
            onClick={() => setActiveTab('gas-generator')}
            className="w-full text-center text-[10px] font-bold text-white bg-emerald-800 hover:bg-emerald-700 border border-emerald-700 py-1 rounded-md shadow-2xs transition flex items-center justify-center gap-1"
          >
            <span>Buka Generator GAS</span>
            <ChevronRight className="w-3 h-3 text-emerald-300" />
          </button>
        </div>
      </div>
    </aside>
  );
};
