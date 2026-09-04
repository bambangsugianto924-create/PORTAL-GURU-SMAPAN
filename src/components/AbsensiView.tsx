import React, { useState } from 'react';
import { Kelas, Siswa, AbsensiRecord, StatusAbsen } from '../types';
import { getTodayString } from '../data/initialData';
import {
  UserCheck,
  Calendar,
  Save,
  CheckCheck,
  Printer,
  Download,
  AlertCircle,
  FileSpreadsheet,
  Users,
  MessageSquare,
  Send,
  School
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AbsensiViewProps {
  kelasList: Kelas[];
  siswaList: Siswa[];
  absensiList: AbsensiRecord[];
  selectedKelasId: string;
  setSelectedKelasId: (id: string) => void;
  onSaveAbsensiBatch: (records: AbsensiRecord[]) => void;
  onOpenPrint: (type: 'absen' | 'nilai' | 'jurnal', kelasId: string) => void;
  onOpenWhatsApp?: (config: any) => void;
}

export const AbsensiView: React.FC<AbsensiViewProps> = ({
  kelasList,
  siswaList,
  absensiList,
  selectedKelasId,
  setSelectedKelasId,
  onSaveAbsensiBatch,
  onOpenPrint,
  onOpenWhatsApp
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'input' | 'rekap'>('input');
  const [selectedTanggal, setSelectedTanggal] = useState<string>(getTodayString());
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Filter students for selected class
  const classStudents = siswaList.filter(s => s.kelasId === selectedKelasId);
  const activeClass = kelasList.find(k => k.id === selectedKelasId) || kelasList[0];

  // Local state for daily attendance inputs
  const [currentRecords, setCurrentRecords] = useState<Record<string, { status: StatusAbsen; keterangan: string }>>({});

  // Sync state with existing records when class or date changes
  React.useEffect(() => {
    const existing = absensiList.filter(
      a => a.kelasId === selectedKelasId && a.tanggal === selectedTanggal
    );
    const initialMap: Record<string, { status: StatusAbsen; keterangan: string }> = {};

    classStudents.forEach(s => {
      const found = existing.find(a => a.siswaId === s.id);
      if (found) {
        initialMap[s.id] = { status: found.status, keterangan: found.keterangan || '' };
      } else {
        // Default to Hadir if not yet recorded
        initialMap[s.id] = { status: 'H', keterangan: '' };
      }
    });

    setCurrentRecords(initialMap);
  }, [selectedKelasId, selectedTanggal, absensiList, siswaList]);

  const handleStatusChange = (siswaId: string, status: StatusAbsen) => {
    setCurrentRecords(prev => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        status
      }
    }));
  };

  const handleKeteranganChange = (siswaId: string, keterangan: string) => {
    setCurrentRecords(prev => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        keterangan
      }
    }));
  };

  const handleSetAllHadir = () => {
    const newMap: Record<string, { status: StatusAbsen; keterangan: string }> = {};
    classStudents.forEach(s => {
      newMap[s.id] = { status: 'H', keterangan: '' };
    });
    setCurrentRecords(newMap);
  };

  const handleSave = () => {
    const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const recordsToSave: AbsensiRecord[] = classStudents.map(s => {
      const record = currentRecords[s.id] || { status: 'H', keterangan: '' };
      return {
        id: `ab-${selectedKelasId}-${s.id}-${selectedTanggal}`,
        kelasId: selectedKelasId,
        siswaId: s.id,
        tanggal: selectedTanggal,
        status: record.status,
        keterangan: record.keterangan,
        waktuCatat: currentTime
      };
    });

    onSaveAbsensiBatch(recordsToSave);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  // Stats calculation
  const totalStudents = classStudents.length;
  const recordsArray = Object.values(currentRecords) as { status: StatusAbsen; keterangan: string }[];
  const hadirCount = recordsArray.filter(r => r.status === 'H').length;
  const izinCount = recordsArray.filter(r => r.status === 'I').length;
  const sakitCount = recordsArray.filter(r => r.status === 'S').length;
  const alpaCount = recordsArray.filter(r => r.status === 'A').length;
  const percentHadir = totalStudents > 0 ? Math.round((hadirCount / totalStudents) * 100) : 0;

  // Export Rekap to CSV
  const exportRekapCSV = () => {
    const headers = ['No', 'NISN', 'Nama Siswa', 'Hadir (H)', 'Izin (I)', 'Sakit (S)', 'Alpa (A)', 'Persentase'];
    const rows = classStudents.map((s, idx) => {
      const studentAbsen = absensiList.filter(a => a.siswaId === s.id);
      const h = studentAbsen.filter(a => a.status === 'H').length;
      const i = studentAbsen.filter(a => a.status === 'I').length;
      const sk = studentAbsen.filter(a => a.status === 'S').length;
      const a = studentAbsen.filter(a => a.status === 'A').length;
      const total = h + i + sk + a;
      const pct = total > 0 ? Math.round((h / total) * 100) + '%' : '0%';
      return [idx + 1, s.nisn, `"${s.nama}"`, h, i, sk, a, pct].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Presensi_${activeClass?.nama || 'Kelas'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-8">
      
      {/* Header Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-500" />
              <span>Presensi / Absensi Harian Siswa</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Pencatatan kehadiran peserta didik kelas {activeClass?.nama} • {activeClass?.jurusan}
            </p>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setActiveSubTab('input')}
              className={`py-1 px-2.5 rounded-md font-semibold text-xs transition ${
                activeSubTab === 'input' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Input Presensi
            </button>
            <button
              onClick={() => setActiveSubTab('rekap')}
              className={`py-1 px-2.5 rounded-md font-semibold text-xs transition ${
                activeSubTab === 'rekap' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekapitulasi
            </button>
          </div>
        </div>

        {/* Filter Controls: Kelas & Tanggal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2.5 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Pilih Kelas</label>
            <select
              value={selectedKelasId}
              onChange={(e) => setSelectedKelasId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              {kelasList.map(k => (
                <option key={k.id} value={k.id}>
                  {k.nama} ({siswaList.filter(s => s.kelasId === k.id).length} Siswa)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Tanggal Presensi</label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={selectedTanggal}
                onChange={(e) => setSelectedTanggal(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-end gap-1.5">
            {onOpenWhatsApp && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenWhatsApp({
                    target: 'wali_kelas',
                    reportType: 'presensi_wali',
                    kelasId: selectedKelasId,
                    tanggal: selectedTanggal
                  })}
                  className="flex-1 py-1.5 px-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 shadow-2xs"
                  title="Kirim Laporan Presensi ke WhatsApp Wali Kelas"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WA Wali Kelas</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenWhatsApp({
                    target: 'ortu',
                    reportType: 'presensi',
                    kelasId: selectedKelasId,
                    tanggal: selectedTanggal
                  })}
                  className="flex-1 py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 shadow-2xs"
                  title="Kirim Presensi ke WhatsApp Orang Tua"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WA ke Ortu</span>
                </button>
              </>
            )}
            <button
              onClick={() => onOpenPrint('absen', selectedKelasId)}
              className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Cetak</span>
            </button>
            <button
              onClick={exportRekapCSV}
              className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: INPUT PRESENSI HARIAN */}
      {activeSubTab === 'input' && (
        <div className="space-y-3">
          
          {/* Quick Counter Summary & Action Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="font-bold text-slate-700">Ringkasan:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono">
                H: {hadirCount}
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold font-mono">
                I: {izinCount}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold font-mono">
                S: {sakitCount}
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold font-mono">
                A: {alpaCount}
              </span>
              <span className="font-bold text-slate-600 ml-1 font-mono">
                ({percentHadir}%)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSetAllHadir}
                className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Semua Hadir</span>
              </button>

              <button
                id="save-absensi-btn"
                type="button"
                onClick={handleSave}
                className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Presensi</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {saveSuccessMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Data presensi kelas {activeClass?.nama} tanggal {selectedTanggal} berhasil disimpan!</span>
            </div>
          )}

          {/* Attendance Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2 px-3 w-10 text-center">No</th>
                    <th className="py-2 px-3">NISN</th>
                    <th className="py-2 px-3">Nama Siswa</th>
                    <th className="py-2 px-3 text-center">L/P</th>
                    <th className="py-2 px-3 text-center w-64">Status Presensi</th>
                    <th className="py-2 px-3">Catatan / Keterangan</th>
                    <th className="py-2 px-3 text-center w-24">Lapor WA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map((siswa, idx) => {
                    const current = currentRecords[siswa.id] || { status: 'H', keterangan: '' };
                    return (
                      <tr key={siswa.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-2 px-3 text-center font-medium text-slate-400 text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-mono font-medium text-slate-600 text-[11px]">
                          {siswa.nisn}
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-semibold text-slate-900">{siswa.nama}</span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`inline-block px-1.5 py-0.2 rounded font-bold text-[10px] ${siswa.jenisKelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                            {siswa.jenisKelamin}
                          </span>
                        </td>

                        {/* Status Pills */}
                        <td className="py-2 px-3 text-center">
                          <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(siswa.id, 'H')}
                              className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition ${
                                current.status === 'H'
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              H
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(siswa.id, 'I')}
                              className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition ${
                                current.status === 'I'
                                  ? 'bg-blue-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              I
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(siswa.id, 'S')}
                              className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition ${
                                current.status === 'S'
                                  ? 'bg-amber-500 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              S
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(siswa.id, 'A')}
                              className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition ${
                                current.status === 'A'
                                  ? 'bg-rose-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              A
                            </button>
                          </div>
                        </td>

                        {/* Keterangan input */}
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder={current.status === 'H' ? 'Hadir' : 'Keterangan izin/sakit'}
                            value={current.keterangan}
                            onChange={(e) => handleKeteranganChange(siswa.id, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none"
                          />
                        </td>

                        {/* WhatsApp button */}
                        <td className="py-2 px-3 text-center">
                          {onOpenWhatsApp && (
                            <button
                              type="button"
                              onClick={() => onOpenWhatsApp({
                                target: 'ortu',
                                reportType: current.status !== 'H' ? 'alert_presensi' : 'presensi',
                                kelasId: selectedKelasId,
                                siswaId: siswa.id,
                                tanggal: selectedTanggal
                              })}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition flex items-center justify-center gap-1 mx-auto shadow-2xs ${
                                current.status !== 'H'
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                              title={`Kirim laporan WhatsApp ke Wali ${siswa.nama}`}
                            >
                              <Send className="w-2.5 h-2.5" />
                              <span>{current.status !== 'H' ? 'Alert WA' : 'Kirim WA'}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {classStudents.length === 0 && (
              <div className="text-center py-8 p-4">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-700">Belum ada siswa di kelas ini</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Tambahkan siswa terlebih dahulu di menu Data Siswa.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: REKAPITULASI PRESENSI BULANAN */}
      {activeSubTab === 'rekap' && (
        <div className="space-y-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="font-bold text-sm text-slate-900 mb-0.5">
              Rekapitulasi Total Kehadiran: {activeClass?.nama}
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Akumulasi presensi semua pertemuan semester berjalan
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2 px-3 w-10 text-center">No</th>
                    <th className="py-2 px-3">NISN</th>
                    <th className="py-2 px-3">Nama Siswa</th>
                    <th className="py-2 px-3 text-center text-emerald-700">Hadir</th>
                    <th className="py-2 px-3 text-center text-blue-700">Izin</th>
                    <th className="py-2 px-3 text-center text-amber-700">Sakit</th>
                    <th className="py-2 px-3 text-center text-rose-700">Alpa</th>
                    <th className="py-2 px-3 text-center">Persentase</th>
                    <th className="py-2 px-3 text-center">Status</th>
                    <th className="py-2 px-3 text-center w-24">WA Rekap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map((siswa, idx) => {
                    const studentAbsen = absensiList.filter(a => a.siswaId === siswa.id);
                    const h = studentAbsen.filter(a => a.status === 'H').length;
                    const i = studentAbsen.filter(a => a.status === 'I').length;
                    const s = studentAbsen.filter(a => a.status === 'S').length;
                    const a = studentAbsen.filter(a => a.status === 'A').length;
                    const total = h + i + s + a;
                    const pct = total > 0 ? Math.round((h / total) * 100) : 100;

                    return (
                      <tr key={siswa.id} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 text-center font-medium text-slate-400 text-[11px]">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-medium text-slate-600 text-[11px]">{siswa.nisn}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{siswa.nama}</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-600 font-mono">{h}</td>
                        <td className="py-2 px-3 text-center font-bold text-blue-600 font-mono">{i}</td>
                        <td className="py-2 px-3 text-center font-bold text-amber-600 font-mono">{s}</td>
                        <td className="py-2 px-3 text-center font-bold text-rose-600 font-mono">{a}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded font-extrabold text-[10px] font-mono ${
                            pct >= 85 ? 'bg-emerald-100 text-emerald-800' : pct >= 75 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {pct}%
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          {pct >= 75 ? (
                            <span className="text-emerald-600 font-bold text-[10px]">Memenuhi</span>
                          ) : (
                            <span className="text-rose-600 font-bold text-[10px]">Perlu Binaan</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {onOpenWhatsApp && (
                            <button
                              type="button"
                              onClick={() => onOpenWhatsApp({
                                target: 'ortu',
                                reportType: 'rekap_presensi',
                                kelasId: selectedKelasId,
                                siswaId: siswa.id
                              })}
                              className="px-2 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-[10px] transition flex items-center justify-center gap-1 mx-auto shadow-2xs"
                              title={`Kirim Rekapitulasi Presensi Semester ke Wali ${siswa.nama}`}
                            >
                              <Send className="w-2.5 h-2.5" />
                              <span>Kirim Rekap</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
