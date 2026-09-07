import React from 'react';
import { Guru, Kelas, Siswa, AbsensiRecord, NilaiRecord, JurnalRecord, ActiveTab, KopSuratConfig } from '../types';
import { getTodayString } from '../data/initialData';
import {
  Users,
  School,
  UserCheck,
  Award,
  BookOpenCheck,
  Code2,
  Calendar,
  ArrowRight,
  Printer,
  Settings2,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageSquare,
  Send
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: Guru;
  kelasList: Kelas[];
  siswaList: Siswa[];
  absensiList: AbsensiRecord[];
  nilaiList: NilaiRecord[];
  jurnalList: JurnalRecord[];
  kopSuratConfig: KopSuratConfig;
  kkm?: number;
  setActiveTab: (tab: ActiveTab) => void;
  onQuickAbsen: (kelasId: string) => void;
  onOpenKopEditor: () => void;
  onOpenPrintModal: (type: 'absen' | 'nilai' | 'jurnal', kelasId: string) => void;
  onOpenWhatsApp?: (config: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  kelasList,
  siswaList,
  absensiList,
  nilaiList,
  jurnalList,
  kopSuratConfig,
  kkm = 75,
  setActiveTab,
  onQuickAbsen,
  onOpenKopEditor,
  onOpenPrintModal,
  onOpenWhatsApp
}) => {
  const today = getTodayString();
  
  // Calculate attendance today
  const todayAbsensi = absensiList.filter(a => a.tanggal === today);
  const hadirCount = todayAbsensi.filter(a => a.status === 'H').length;
  const izinCount = todayAbsensi.filter(a => a.status === 'I').length;
  const sakitCount = todayAbsensi.filter(a => a.status === 'S').length;
  const alpaCount = todayAbsensi.filter(a => a.status === 'A').length;
  const totalRecordedToday = todayAbsensi.length;
  
  const attendanceRate = totalRecordedToday > 0 
    ? Math.round((hadirCount / totalRecordedToday) * 100) 
    : 0;

  // Calculate average grades
  const averageGrade = nilaiList.length > 0
    ? (nilaiList.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) / nilaiList.length).toFixed(1)
    : '0';

  const tuntasCount = nilaiList.filter(n => n.nilaiAkhir >= kkm).length;
  const tuntasRate = nilaiList.length > 0
    ? Math.round((tuntasCount / nilaiList.length) * 100)
    : 0;

  // Recent journals
  const recentJurnals = [...jurnalList].reverse().slice(0, 3);

  return (
    <div className="space-y-4 pb-8">
      
      {/* Welcome Banner - Green Emerald High Density */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-emerald-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/60 text-emerald-200 text-[10px] font-bold mb-2 border border-emerald-500/40">
              <School className="w-3 h-3 text-emerald-300" />
              <span>{kopSuratConfig.namaSekolah}</span>
              <span className="text-emerald-400">•</span>
              <span>Semester Genap 2025/2026</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Selamat Datang, {currentUser.nama}!</span>
            </h1>
            <p className="text-emerald-100/80 text-xs mt-0.5 max-w-xl">
              Portal guru lengkap: kelola kelas, presensi harian, nilai leger, jurnal mengajar, serta cetak dokumen PDF resmi dengan Kop Surat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('laporan-wa')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition flex items-center gap-1.5 border border-emerald-400"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-950" />
              <span>Laporan WhatsApp</span>
            </button>

            <button
              onClick={() => setActiveTab('rekap')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition flex items-center gap-1.5 border border-amber-400"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Rekap PDF</span>
            </button>

            <button
              onClick={() => setActiveTab('absen')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition flex items-center gap-1.5 border border-emerald-500"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Presensi</span>
            </button>

            <button
              onClick={onOpenKopEditor}
              className="bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-600/70 text-emerald-200 font-semibold px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Setel Kop</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid - Emerald Green Accents */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Card 1: Total Kelas */}
        <div 
          onClick={() => setActiveTab('kelas')}
          className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs hover:border-emerald-500 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Kelas</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <School className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald-950 font-mono">{kelasList.length}</span>
            <span className="text-[11px] text-emerald-700 font-medium">Rombel</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-emerald-700 font-bold pt-1 border-t border-slate-100">
            <span>Lihat Data Kelas</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
          </div>
        </div>

        {/* Card 2: Total Siswa */}
        <div 
          onClick={() => setActiveTab('siswa')}
          className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs hover:border-emerald-500 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Siswa</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-teal-950 font-mono">{siswaList.length}</span>
            <span className="text-[11px] text-teal-700 font-medium">Peserta Didik</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-teal-700 font-bold pt-1 border-t border-slate-100">
            <span>Direktori Murid</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
          </div>
        </div>

        {/* Card 3: Kehadiran Hari Ini */}
        <div 
          onClick={() => setActiveTab('absen')}
          className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs hover:border-emerald-500 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Presensi Hari Ini</span>
            <div className="w-7 h-7 rounded-lg bg-lime-50 text-lime-700 flex items-center justify-center border border-lime-200">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{attendanceRate}%</span>
            <span className="text-[10px] font-bold text-emerald-700">{hadirCount} Hadir</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[9px] text-slate-500 font-medium pt-1 border-t border-slate-100">
            <span className="text-blue-700 font-bold">{izinCount} I</span>
            <span>•</span>
            <span className="text-amber-700 font-bold">{sakitCount} S</span>
            <span>•</span>
            <span className="text-rose-700 font-bold">{alpaCount} A</span>
          </div>
        </div>

        {/* Card 4: Rata-Rata Nilai */}
        <div 
          onClick={() => setActiveTab('nilai')}
          className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs hover:border-emerald-500 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rerata Nilai</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{averageGrade}</span>
            <span className="text-[9px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200">
              {tuntasRate}% Tuntas
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-amber-700 font-bold pt-1 border-t border-slate-100">
            <span>Leger Nilai Lengkap</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
          </div>
        </div>

      </div>

      {/* Middle Section: Daftar Kelas & Shortcut Presensi & Jurnal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left 2 Cols: Daftar Kelas & Shortcut Cepat */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-emerald-100 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                <School className="w-4 h-4 text-emerald-700" />
                <span>Kelas Binaan & Jadwal Mengajar</span>
              </h3>
              <p className="text-[11px] text-slate-500">Pilih kelas untuk mencatat presensi harian, nilai, atau rekap cetak PDF</p>
            </div>
            <button
              onClick={() => setActiveTab('kelas')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Semua Kelas</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {kelasList.map((k) => {
              const countSiswa = siswaList.filter(s => s.kelasId === k.id).length;
              return (
                <div
                  key={k.id}
                  className="p-3 rounded-lg border border-slate-200/90 bg-emerald-50/30 hover:bg-emerald-50/60 hover:border-emerald-300 transition group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-800 text-white font-mono shadow-2xs">
                          {k.nama}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-800">{k.tingkat}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 mt-1">{k.jurusan}</h4>
                      <p className="text-[10px] text-slate-500">Wali Kelas: {k.waliKelas}</p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200 font-mono shadow-2xs">
                      {countSiswa} Siswa
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-emerald-100 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => onQuickAbsen(k.id)}
                      className="flex-1 py-1 px-2 text-center text-xs font-bold rounded bg-emerald-700 hover:bg-emerald-600 text-white transition flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>Presensi</span>
                    </button>
                    {onOpenWhatsApp && (
                      <button
                        onClick={() => onOpenWhatsApp({
                          target: 'wali_kelas',
                          reportType: 'rekap_wali',
                          kelasId: k.id
                        })}
                        className="py-1 px-2 text-xs font-bold rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition flex items-center gap-1"
                        title="Kirim Rekap WA ke Wali Kelas"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-600" />
                        <span>WA</span>
                      </button>
                    )}
                    <button
                      onClick={() => onOpenPrintModal('absen', k.id)}
                      className="py-1 px-2 text-xs font-semibold rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition flex items-center gap-1"
                      title="Cetak PDF Rekap Kelas"
                    >
                      <Printer className="w-3 h-3" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Kop Surat Quick Preview & Jurnal Terbaru */}
        <div className="space-y-4">
          
          {/* Kop Surat Active Box */}
          <div className="bg-emerald-950 text-white rounded-xl p-3.5 border border-emerald-900 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                <School className="w-3.5 h-3.5" />
                <span>Kop Surat Aktif</span>
              </span>
              <button
                onClick={onOpenKopEditor}
                className="text-[10px] text-amber-300 hover:text-amber-200 font-bold underline"
              >
                Edit Kop
              </button>
            </div>

            <div className="p-2 bg-emerald-900/60 rounded-lg border border-emerald-800/80 text-[11px]">
              <p className="font-bold text-white truncate">{kopSuratConfig.namaSekolah}</p>
              <p className="text-[10px] text-emerald-200/80 truncate">{kopSuratConfig.alamat}</p>
              <p className="text-[9.5px] text-emerald-300 font-mono mt-0.5">Kepsek: {kopSuratConfig.namaKepalaSekolah}</p>
            </div>

            <button
              onClick={() => setActiveTab('rekap')}
              className="w-full py-1.5 px-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Lihat Rekap & Cetak PDF</span>
            </button>
          </div>

          {/* Jurnal Mengajar Terakhir */}
          <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <BookOpenCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Jurnal Mengajar Terbaru</span>
              </h3>
              <button
                onClick={() => setActiveTab('jurnal')}
                className="text-[11px] font-bold text-emerald-700 hover:underline"
              >
                Semua
              </button>
            </div>

            <div className="space-y-2">
              {recentJurnals.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-xs">
                  Belum ada catatan jurnal mengajar.
                </div>
              ) : (
                recentJurnals.map((jur) => {
                  const kelas = kelasList.find(k => k.id === jur.kelasId);
                  return (
                    <div key={jur.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-slate-800 text-[11px]">{kelas ? kelas.nama : 'Kelas'}</span>
                        <span className="text-[9px] text-slate-500 font-mono">{jur.tanggal}</span>
                      </div>
                      <p className="text-slate-600 font-medium line-clamp-1 text-[11px]">{jur.materiPokok}</p>
                      <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-500">
                        <span className="text-emerald-700 font-bold">✓ {jur.statusKetercapaian}</span>
                        <span>•</span>
                        <span>Hadir: {jur.jumlahHadir}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
