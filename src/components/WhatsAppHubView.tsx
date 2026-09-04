import React, { useState, useMemo } from 'react';
import { Guru, Kelas, Siswa, AbsensiRecord, NilaiRecord, KopSuratConfig, StatusAbsen } from '../types';
import { getTodayString } from '../data/initialData';
import {
  formatPhoneForWA,
  getWhatsAppUrl,
  generatePresensiOrtuMessage,
  generateRekapPresensiOrtuMessage,
  generateNilaiOrtuMessage,
  generateAlertPresensiOrtuMessage,
  generateAlertNilaiOrtuMessage,
  generatePresensiWaliKelasMessage,
  generateNilaiWaliKelasMessage,
  formatDateIndo
} from '../services/whatsappService';
import {
  MessageSquare,
  Send,
  User,
  Users,
  School,
  Calendar,
  AlertTriangle,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  Copy,
  Check,
  Search,
  ExternalLink,
  Phone,
  ArrowRight,
  Filter,
  Info,
  ShieldCheck,
  Bookmark
} from 'lucide-react';

interface WhatsAppHubViewProps {
  currentUser: Guru;
  kelasList: Kelas[];
  siswaList: Siswa[];
  absensiList: AbsensiRecord[];
  nilaiList: NilaiRecord[];
  kopSuratConfig?: KopSuratConfig;
  onOpenModal: (config: any) => void;
  onUpdateSiswaPhone: (siswaId: string, noHpOrtu: string) => void;
  onUpdateWaliKelasPhone: (kelasId: string, noHpWali: string) => void;
}

export const WhatsAppHubView: React.FC<WhatsAppHubViewProps> = ({
  currentUser,
  kelasList,
  siswaList,
  absensiList,
  nilaiList,
  kopSuratConfig,
  onOpenModal,
  onUpdateSiswaPhone,
  onUpdateWaliKelasPhone
}) => {
  const [selectedKelasId, setSelectedKelasId] = useState<string>(kelasList[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'absent' | 'remedial'>('all');
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);

  const safeKopSurat = useMemo(() => {
    return kopSuratConfig || {
      namaSekolah: 'SMA NEGERI 1 CONTOH',
      npsn: '12345678',
      alamat: 'Jl. Pendidikan No. 1',
      kabupatenKota: 'Kota',
      provinsi: 'Provinsi',
      kodePos: '12345',
      noTelepon: '-',
      email: '-',
      website: '-'
    };
  }, [kopSuratConfig]);

  const selectedKelas = useMemo(() => {
    return kelasList.find(k => k.id === selectedKelasId) || kelasList[0];
  }, [kelasList, selectedKelasId]);

  const classStudents = useMemo(() => {
    return siswaList.filter(s => s.kelasId === selectedKelasId);
  }, [siswaList, selectedKelasId]);

  // Statistics for selected class today
  const todayRecords = useMemo(() => {
    return absensiList.filter(a => a.kelasId === selectedKelasId && a.tanggal === selectedDate);
  }, [absensiList, selectedKelasId, selectedDate]);

  const absentStudents = useMemo(() => {
    return classStudents.filter(s => {
      const rec = todayRecords.find(a => a.siswaId === s.id);
      return rec && rec.status !== 'H';
    });
  }, [classStudents, todayRecords]);

  const remedialStudents = useMemo(() => {
    return classStudents.filter(s => {
      const nil = nilaiList.find(n => n.siswaId === s.id);
      return nil && !nil.statusLulus;
    });
  }, [classStudents, nilaiList]);

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return classStudents.filter(s => {
      const matchSearch = !searchQuery || s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery);
      if (!matchSearch) return false;

      if (filterType === 'absent') {
        const rec = todayRecords.find(a => a.siswaId === s.id);
        return rec && rec.status !== 'H';
      }

      if (filterType === 'remedial') {
        const nil = nilaiList.find(n => n.siswaId === s.id);
        return nil && !nil.statusLulus;
      }

      return true;
    });
  }, [classStudents, searchQuery, filterType, todayRecords, nilaiList]);

  const handleQuickCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTemplateId(id);
      setTimeout(() => setCopiedTemplateId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSendToWaliKelasPresensi = () => {
    if (!selectedKelas) return;
    onOpenModal({
      target: 'wali_kelas',
      reportType: 'presensi_wali',
      kelasId: selectedKelas.id,
      tanggal: selectedDate
    });
  };

  const handleSendToWaliKelasNilai = () => {
    if (!selectedKelas) return;
    onOpenModal({
      target: 'wali_kelas',
      reportType: 'nilai_wali',
      kelasId: selectedKelas.id
    });
  };

  return (
    <div className="space-y-5 pb-10">
      
      {/* Top Banner - Emerald WhatsApp Theme */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-emerald-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/60 text-emerald-200 text-[10px] font-bold mb-2 border border-emerald-500/40">
              <MessageSquare className="w-3 h-3 text-emerald-300" />
              <span>Pusat Komunikasi & Laporan WhatsApp Resmi</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Laporan WhatsApp untuk Orang Tua & Wali Kelas</span>
            </h1>
            <p className="text-emerald-100/80 text-xs mt-1 max-w-2xl leading-relaxed">
              Kirim laporan presensi harian, nilai evaluasi, notifikasi siswa tidak hadir/alpa, dan rekap semester langsung ke nomor WhatsApp dengan format resmi sekolah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenModal({ target: 'ortu', reportType: 'presensi', kelasId: selectedKelasId, tanggal: selectedDate })}
              className="bg-white hover:bg-emerald-50 text-emerald-950 font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 border border-emerald-200 active:scale-98"
            >
              <Send className="w-3.5 h-3.5 text-emerald-700" />
              <span>Buka Generator Pesan WA</span>
            </button>

            <button
              onClick={handleSendToWaliKelasPresensi}
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 border border-emerald-500 active:scale-98"
            >
              <School className="w-3.5 h-3.5" />
              <span>Lapor Wali Kelas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Card 1: Presensi Hari Ini */}
        <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Presensi Kelas Ini</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900 font-mono">
              {classStudents.length - absentStudents.length} / {classStudents.length}
            </div>
            <p className="text-[10px] text-emerald-700 font-semibold">Siswa Hadir Hari Ini ({selectedDate})</p>
          </div>
          <button
            onClick={() => onOpenModal({ target: 'ortu', reportType: 'presensi', kelasId: selectedKelasId, tanggal: selectedDate })}
            className="w-full py-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition flex items-center justify-center gap-1"
          >
            <span>Kirim Presensi ke Ortu</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 2: Siswa Alpa / Tidak Hadir */}
        <div className="bg-white p-3.5 rounded-xl border border-rose-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Tidak Hadir Hari Ini</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-rose-950 font-mono">
              {absentStudents.length} Siswa
            </div>
            <p className="text-[10px] text-rose-700 font-semibold">Perlu Konfirmasi Orang Tua</p>
          </div>
          <button
            onClick={() => {
              setFilterType('absent');
              if (absentStudents.length > 0) {
                onOpenModal({
                  target: 'ortu',
                  reportType: 'alert_presensi',
                  kelasId: selectedKelasId,
                  siswaId: absentStudents[0].id,
                  tanggal: selectedDate
                });
              } else {
                alert('Semua siswa tercatat hadir.');
              }
            }}
            className="w-full py-1 text-[11px] font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition flex items-center justify-center gap-1"
          >
            <span>Kirim Alert Tidak Hadir</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 3: Rekap Nilai ke Wali Kelas */}
        <div className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Laporan Wali Kelas</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <School className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 truncate">
              {selectedKelas?.waliKelas || '-'}
            </div>
            <p className="text-[10px] text-teal-700 font-mono font-semibold">
              {selectedKelas?.noHpWaliKelas ? `📱 ${selectedKelas.noHpWaliKelas}` : 'Nomor belum disetel'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={handleSendToWaliKelasPresensi}
              className="py-1 text-[10px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded transition text-center"
            >
              Presensi
            </button>
            <button
              onClick={handleSendToWaliKelasNilai}
              className="py-1 text-[10px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded transition text-center"
            >
              Leger Nilai
            </button>
          </div>
        </div>

        {/* Card 4: Remedial Belajar */}
        <div className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Perlu Remedial</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900 font-mono">
              {remedialStudents.length} Siswa
            </div>
            <p className="text-[10px] text-amber-700 font-semibold">Nilai Akhir &lt; KKM 75</p>
          </div>
          <button
            onClick={() => {
              setFilterType('remedial');
              if (remedialStudents.length > 0) {
                onOpenModal({
                  target: 'ortu',
                  reportType: 'alert_nilai',
                  kelasId: selectedKelasId,
                  siswaId: remedialStudents[0].id
                });
              } else {
                alert('Semua siswa sudah tuntas mencapai KKM.');
              }
            }}
            className="w-full py-1 text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg transition flex items-center justify-center gap-1"
          >
            <span>Info Remedial ke Ortu</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* Main Student Directory & WhatsApp Action Center */}
      <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-2xs space-y-4">
        
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>Daftar Siswa & Kontak WhatsApp Orang Tua</span>
            </h3>
            <p className="text-[11px] text-slate-500">Klik tombol WA di setiap baris untuk mengirim laporan secara spesifik</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Kelas Picker */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 px-1">Kelas:</span>
              <select
                value={selectedKelasId}
                onChange={(e) => setSelectedKelasId(e.target.value)}
                className="bg-white px-2 py-1 rounded text-xs font-bold text-emerald-950 border border-slate-200 focus:outline-none"
              >
                {kelasList.map(k => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white px-2 py-0.5 rounded text-xs font-mono font-semibold border border-slate-200 focus:outline-none"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                  filterType === 'all' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({classStudents.length})
              </button>
              <button
                onClick={() => setFilterType('absent')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                  filterType === 'absent' ? 'bg-rose-500 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tidak Hadir ({absentStudents.length})
              </button>
              <button
                onClick={() => setFilterType('remedial')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                  filterType === 'remedial' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Remedial ({remedialStudents.length})
              </button>
            </div>
          </div>
        </div>

        {/* Search & Wali Kelas Contact Info Box */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa atau NISN..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-200/80 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-800" />
              <div>
                <span className="font-bold text-slate-800">Wali Kelas {selectedKelas?.nama}: </span>
                <span className="text-emerald-950 font-medium">{selectedKelas?.waliKelas}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSendToWaliKelasPresensi}
                className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] rounded transition flex items-center gap-1 shadow-2xs"
              >
                <Send className="w-3 h-3" />
                <span>Kirim WA Wali</span>
              </button>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3">Nama Siswa & NISN</th>
                  <th className="py-2.5 px-3">Nama Wali & No. WA</th>
                  <th className="py-2.5 px-3 text-center">Presensi ({selectedDate})</th>
                  <th className="py-2.5 px-3 text-center">Nilai Akhir</th>
                  <th className="py-2.5 px-3 text-center w-52">Aksi WhatsApp Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      Tidak ada data siswa ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, idx) => {
                    const ab = todayRecords.find(a => a.siswaId === s.id);
                    const nil = nilaiList.find(n => n.siswaId === s.id);
                    const phone = s.noHpOrtu || s.noHp;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                        
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{s.nama}</div>
                          <div className="text-[10px] text-slate-500 font-mono">NISN: {s.nisn} • {s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="text-slate-800 font-medium">{s.namaWali || 'Orang Tua'}</div>
                          <div className="text-[10px] font-mono text-emerald-800 font-semibold flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 text-emerald-600" />
                            <span>{phone || 'Belum ada nomor'}</span>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          {ab ? (
                            <span className={`inline-flex px-2 py-0.5 rounded font-bold text-[10px] ${
                              ab.status === 'H' ? 'bg-emerald-100 text-emerald-800' :
                              ab.status === 'I' ? 'bg-blue-100 text-blue-800' :
                              ab.status === 'S' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {ab.status === 'H' ? 'Hadir' : ab.status === 'I' ? 'Izin' : ab.status === 'S' ? 'Sakit' : 'Alpa'}
                            </span>
                          ) : (
                            <span className="text-emerald-700 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded">
                              Hadir
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          {nil ? (
                            <span className={`inline-flex px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                              nil.statusLulus ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {nil.nilaiAkhir} ({nil.predikat})
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">-</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* 1. Presensi Button */}
                            <button
                              type="button"
                              onClick={() => onOpenModal({
                                target: 'ortu',
                                reportType: ab?.status !== 'H' && ab ? 'alert_presensi' : 'presensi',
                                kelasId: selectedKelasId,
                                siswaId: s.id,
                                tanggal: selectedDate
                              })}
                              className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200 transition flex items-center gap-1 shadow-2xs"
                              title="Kirim Laporan Presensi"
                            >
                              <Send className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Presensi</span>
                            </button>

                            {/* 2. Nilai Button */}
                            <button
                              type="button"
                              onClick={() => onOpenModal({
                                target: 'ortu',
                                reportType: nil && !nil.statusLulus ? 'alert_nilai' : 'nilai',
                                kelasId: selectedKelasId,
                                siswaId: s.id
                              })}
                              className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-200 transition flex items-center gap-1 shadow-2xs"
                              title="Kirim Laporan Nilai"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                              <span>Nilai</span>
                            </button>

                            {/* 3. Direct Link wa.me */}
                            {phone && (
                              <button
                                type="button"
                                onClick={() => {
                                  const url = getWhatsAppUrl(phone, `Halo Bapak/Ibu Wali dari ${s.nama}, saya ${currentUser.nama} dari ${safeKopSurat.namaSekolah}.`);
                                  window.open(url, '_blank');
                                }}
                                className="p-1 rounded bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 transition"
                                title="Chat Langsung via WhatsApp"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
