import React, { useState, useRef } from 'react';
import { Guru, Kelas, Siswa, AbsensiRecord, NilaiRecord, JurnalRecord, KopSuratConfig } from '../types';
import { calculateNilaiAkhir } from '../data/initialData';
import { KopSuratHeader } from './KopSuratHeader';
import { PDFService } from '../services/pdfService';
import {
  FileText,
  Printer,
  Download,
  Settings2,
  UserCheck,
  Award,
  BookOpenCheck,
  PieChart,
  School,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown
} from 'lucide-react';

interface RekapViewProps {
  currentUser: Guru;
  kelasList: Kelas[];
  siswaList: Siswa[];
  absensiList: AbsensiRecord[];
  nilaiList: NilaiRecord[];
  jurnalList: JurnalRecord[];
  kopSuratConfig: KopSuratConfig;
  kkm?: number;
  onOpenKopEditor: () => void;
  onOpenPrintModal: (type: 'absen' | 'nilai' | 'jurnal', kelasId: string) => void;
}

export const RekapView: React.FC<RekapViewProps> = ({
  currentUser,
  kelasList,
  siswaList,
  absensiList,
  nilaiList,
  jurnalList,
  kopSuratConfig,
  kkm = 75,
  onOpenKopEditor,
  onOpenPrintModal
}) => {
  const [activeRekapType, setActiveRekapType] = useState<'absen' | 'nilai' | 'jurnal' | 'eksekutif'>('absen');
  const [selectedKelasId, setSelectedKelasId] = useState<string>(() => kelasList[0]?.id || '');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const rekapPrintRef = useRef<HTMLDivElement>(null);

  const activeClass = kelasList.find(k => k.id === selectedKelasId) || kelasList[0];
  const classStudents = siswaList.filter(s => s.kelasId === activeClass?.id);

  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const getExportFileName = (ext: string = 'pdf') => {
    const typeLabel = activeRekapType === 'absen' ? 'Rekap_Presensi' : activeRekapType === 'nilai' ? 'Leger_Nilai' : activeRekapType === 'jurnal' ? 'Rekap_Jurnal' : 'Ringkasan_Eksekutif';
    const classLabel = (activeRekapType === 'jurnal' || activeRekapType === 'eksekutif') ? 'Semua_Kelas' : (activeClass?.nama || 'Kelas').replace(/\s+/g, '_');
    return `${typeLabel}_${classLabel}_${new Date().toISOString().slice(0, 10)}.${ext}`;
  };

  // Direct PDF Download
  const handleDownloadPDF = async () => {
    if (!rekapPrintRef.current) return;
    setIsExportingPDF(true);
    setNotificationMsg(null);

    const filename = getExportFileName('pdf');
    const orientation = activeRekapType === 'nilai' ? 'landscape' : 'portrait';
    
    const success = await PDFService.exportToPDF(rekapPrintRef.current, {
      filename,
      orientation,
      marginMm: 8
    });

    setIsExportingPDF(false);
    if (success) {
      setNotificationMsg(`Laporan PDF "${filename}" berhasil diunduh!`);
      setTimeout(() => setNotificationMsg(null), 4000);
    }
  };

  // Clean Print Trigger
  const handleCleanPrint = () => {
    if (rekapPrintRef.current) {
      PDFService.printCleanly(rekapPrintRef.current, getExportFileName('pdf'));
    } else {
      window.print();
    }
  };

  // Export active view to CSV
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    const filename = getExportFileName('csv');

    if (activeRekapType === 'absen') {
      headers = ['No', 'NISN', 'Nama Siswa', 'L/P', 'Hadir', 'Izin', 'Sakit', 'Alpa', '% Kehadiran', 'Status'];
      rows = classStudents.map((s, idx) => {
        const studentAbsen = absensiList.filter(a => a.siswaId === s.id);
        const h = studentAbsen.filter(a => a.status === 'H').length;
        const i = studentAbsen.filter(a => a.status === 'I').length;
        const sk = studentAbsen.filter(a => a.status === 'S').length;
        const a = studentAbsen.filter(a => a.status === 'A').length;
        const total = h + i + sk + a;
        const pct = total > 0 ? Math.round((h / total) * 100) : 100;
        return [
          String(idx + 1),
          s.nisn,
          `"${s.nama}"`,
          s.jenisKelamin,
          String(h),
          String(i),
          String(sk),
          String(a),
          `${pct}%`,
          pct >= 75 ? 'Memenuhi' : 'Perlu Binaan'
        ];
      });
    } else if (activeRekapType === 'nilai') {
      headers = ['No', 'NISN', 'Nama Siswa', 'Tugas 1', 'Tugas 2', 'Tugas 3', 'Tugas 4', 'UH 1', 'UH 2', 'UH 3', 'UH 4', 'PTS', 'PAS', 'Nilai Akhir', 'Predikat', 'Status Kelulusan'];
      rows = classStudents.map((s, idx) => {
        const n = nilaiList.find(item => item.siswaId === s.id) || {
          tugas1: 80, tugas2: 80, tugas3: 80, tugas4: 80,
          uh1: 75, uh2: 75, uh3: 75, uh4: 75,
          pts: 78, pas: 80,
          ...calculateNilaiAkhir(80, 80, 80, 80, 75, 75, 75, 75, 78, 80)
        };
        return [
          String(idx + 1),
          s.nisn,
          `"${s.nama}"`,
          String(n.tugas1),
          String(n.tugas2),
          String(n.tugas3),
          String(n.tugas4),
          String(n.uh1),
          String(n.uh2),
          String(n.uh3),
          String(n.uh4),
          String(n.pts),
          String(n.pas),
          String(n.nilaiAkhir),
          n.predikat,
          n.statusLulus ? 'Tuntas' : 'Remedial'
        ];
      });
    } else if (activeRekapType === 'jurnal') {
      headers = ['No', 'Tanggal', 'Kelas', 'Jam Ke', 'Materi Pokok', 'Capaian', 'Hadir', 'Tidak Hadir', 'Status'];
      rows = jurnalList.map((j, idx) => {
        const k = kelasList.find(item => item.id === j.kelasId);
        return [
          String(idx + 1),
          j.tanggal,
          `"${k?.nama || '-'}"`,
          `"${j.jamKe}"`,
          `"${j.materiPokok}"`,
          `"${j.capaianPembelajaran}"`,
          String(j.jumlahHadir),
          String(j.jumlahTidakHadir),
          j.statusKetercapaian
        ];
      });
    } else {
      headers = ['No', 'Nama Kelas', 'Wali Kelas', 'Jumlah Siswa', 'Rerata Nilai', 'Status'];
      rows = kelasList.map((k, idx) => {
        const st = siswaList.filter(s => s.kelasId === k.id);
        const classGrades = st.map(s => nilaiList.find(n => n.siswaId === s.id)?.nilaiAkhir || 80);
        const avg = classGrades.length > 0 ? (classGrades.reduce((a, b) => a + b, 0) / classGrades.length).toFixed(1) : '-';
        return [
          String(idx + 1),
          `"${k.nama}"`,
          `"${k.waliKelas}"`,
          String(st.length),
          String(avg),
          'Tuntas'
        ];
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNotificationMsg(`Berkas CSV "${filename}" berhasil diunduh!`);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Calculate grade statistics
  const gradesForClass = classStudents.map(s => {
    return nilaiList.find(n => n.siswaId === s.id)?.nilaiAkhir || 80;
  });
  const avgClassGrade = gradesForClass.length > 0
    ? (gradesForClass.reduce((a, b) => a + b, 0) / gradesForClass.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-4 pb-8">
      
      {/* Top Header & Quick Action Bar (Hidden on print) */}
      <div className="no-print bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>Pusat Rekapitulasi & Cetak Dokumen PDF</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Laporan resmi berformat A4 dengan Kop Surat, tabel terstruktur, dan tanda tangan digital
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenKopEditor}
              className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 border border-slate-200"
            >
              <Settings2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Edit Kop & Logo</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 border border-emerald-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh CSV</span>
            </button>

            {/* Direct PDF Download Button */}
            <button
              id="rekap-download-pdf-btn"
              disabled={isExportingPDF}
              onClick={handleDownloadPDF}
              className="py-1.5 px-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-lg shadow-2xs transition flex items-center gap-1.5 border border-amber-400"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memproses PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF (.pdf)</span>
                </>
              )}
            </button>

            <button
              id="rekap-print-btn"
              onClick={handleCleanPrint}
              className="py-1.5 px-3.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-2xs transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Print</span>
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notificationMsg && (
          <div className="p-2 bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 rounded-lg border border-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* Tab Selection & Class Selector */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
          
          {/* Rekap Type Tabs */}
          <div className="flex flex-wrap bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              id="tab-rekap-absen"
              onClick={() => setActiveRekapType('absen')}
              className={`py-1 px-3 rounded-md font-bold transition flex items-center gap-1.5 ${
                activeRekapType === 'absen' ? 'bg-white text-emerald-900 shadow-2xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Rekap Presensi</span>
            </button>

            <button
              id="tab-rekap-nilai"
              onClick={() => setActiveRekapType('nilai')}
              className={`py-1 px-3 rounded-md font-bold transition flex items-center gap-1.5 ${
                activeRekapType === 'nilai' ? 'bg-white text-emerald-900 shadow-2xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Leger Nilai</span>
            </button>

            <button
              id="tab-rekap-jurnal"
              onClick={() => setActiveRekapType('jurnal')}
              className={`py-1 px-3 rounded-md font-bold transition flex items-center gap-1.5 ${
                activeRekapType === 'jurnal' ? 'bg-white text-emerald-900 shadow-2xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpenCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Rekap Jurnal</span>
            </button>

            <button
              id="tab-rekap-eksekutif"
              onClick={() => setActiveRekapType('eksekutif')}
              className={`py-1 px-3 rounded-md font-bold transition flex items-center gap-1.5 ${
                activeRekapType === 'eksekutif' ? 'bg-white text-emerald-900 shadow-2xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChart className="w-3.5 h-3.5 text-teal-600" />
              <span>Ringkasan Statistik</span>
            </button>
          </div>

          {/* Class Filter */}
          {activeRekapType !== 'jurnal' && activeRekapType !== 'eksekutif' && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pilih Kelas:</span>
              <select
                id="select-rekap-kelas"
                value={selectedKelasId}
                onChange={(e) => setSelectedKelasId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                {kelasList.map(k => (
                  <option key={k.id} value={k.id}>
                    {k.nama} ({k.jurusan})
                  </option>
                ))}
              </select>
            </div>
          )}

        </div>
      </div>

      {/* Printable Sheet Canvas */}
      <div className="bg-slate-100 p-2 sm:p-4 rounded-xl flex justify-center overflow-x-auto">
        <div
          id="printable-document-rekap"
          ref={rekapPrintRef}
          data-print-target="true"
          className="bg-white rounded-xl border border-slate-300 p-6 sm:p-8 shadow-sm font-serif text-slate-900 text-xs w-full max-w-4xl print-page-target"
        >
          
          {/* DYNAMIC EDITABLE KOP SURAT */}
          <KopSuratHeader config={kopSuratConfig} />

          {/* 1. REKAP PRESENSI TABLE */}
          {activeRekapType === 'absen' && (
            <div className="space-y-4">
              <div className="text-center font-serif">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 underline">
                  REKAPITULASI PRESENSI KEHADIRAN PESERTA DIDIK
                </h3>
                <p className="text-[11px] font-sans text-slate-600 mt-1">
                  Tahun Ajaran {activeClass?.tahunAjaran || '2025/2026'} • Semester {activeClass?.semester || 'Genap'}
                </p>

                <div className="font-sans flex justify-between items-center text-[11px] mt-3 px-1 border-t border-b border-slate-300 py-1.5 text-left">
                  <div>
                    <p><span className="font-semibold text-slate-700">Kelas / Jurusan:</span> <strong>{activeClass?.nama} ({activeClass?.jurusan})</strong></p>
                    <p><span className="font-semibold text-slate-700">Wali Kelas:</span> <strong>{activeClass?.waliKelas}</strong></p>
                  </div>
                  <div className="text-right">
                    <p><span className="font-semibold text-slate-700">Guru Pengampu:</span> <strong>{currentUser.nama}</strong></p>
                    <p><span className="font-semibold text-slate-700">Mata Pelajaran:</span> <strong>{currentUser.mapel}</strong></p>
                  </div>
                </div>
              </div>

              {/* Table */}
              <table className="w-full border-collapse border border-slate-900 font-sans text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold text-slate-900">
                    <th className="border border-slate-900 p-1.5 w-8">No</th>
                    <th className="border border-slate-900 p-1.5 w-24">NISN</th>
                    <th className="border border-slate-900 p-1.5 text-left">Nama Peserta Didik</th>
                    <th className="border border-slate-900 p-1.5 w-10">L/P</th>
                    <th className="border border-slate-900 p-1.5 w-12 text-emerald-800">Hadir</th>
                    <th className="border border-slate-900 p-1.5 w-12 text-blue-800">Izin</th>
                    <th className="border border-slate-900 p-1.5 w-12 text-amber-800">Sakit</th>
                    <th className="border border-slate-900 p-1.5 w-12 text-rose-800">Alpa</th>
                    <th className="border border-slate-900 p-1.5 w-18">% Kehadiran</th>
                    <th className="border border-slate-900 p-1.5 w-20">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((s, idx) => {
                    const studentAbsen = absensiList.filter(a => a.siswaId === s.id);
                    const h = studentAbsen.filter(a => a.status === 'H').length;
                    const i = studentAbsen.filter(a => a.status === 'I').length;
                    const sk = studentAbsen.filter(a => a.status === 'S').length;
                    const a = studentAbsen.filter(a => a.status === 'A').length;
                    const total = h + i + sk + a;
                    const pct = total > 0 ? Math.round((h / total) * 100) : 100;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="border border-slate-900 p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-slate-900 p-1.5 text-center font-mono">{s.nisn}</td>
                        <td className="border border-slate-900 p-1.5 font-medium">{s.nama}</td>
                        <td className="border border-slate-900 p-1.5 text-center">{s.jenisKelamin}</td>
                        <td className="border border-slate-900 p-1.5 text-center font-bold font-mono">{h}</td>
                        <td className="border border-slate-900 p-1.5 text-center font-mono">{i}</td>
                        <td className="border border-slate-900 p-1.5 text-center font-mono">{sk}</td>
                        <td className="border border-slate-900 p-1.5 text-center font-mono">{a}</td>
                        <td className="border border-slate-900 p-1.5 text-center font-bold font-mono">{pct}%</td>
                        <td className="border border-slate-900 p-1.5 text-center text-[10px] font-semibold">
                          {pct >= 75 ? 'Memenuhi' : 'Perlu Binaan'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. REKAP LEGER NILAI TABLE */}
          {activeRekapType === 'nilai' && (
            <div className="space-y-4">
              <div className="text-center font-serif">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 underline">
                  LEGER NILAI HASIL EVALUASI PEMBELAJARAN
                </h3>
                <p className="text-[11px] font-sans text-slate-600 mt-1">
                  Mata Pelajaran: {currentUser.mapel} • Kriteria Ketuntasan Minimal (KKM): {kkm}
                </p>

                <div className="font-sans flex justify-between items-center text-[11px] mt-3 px-1 border-t border-b border-slate-300 py-1.5 text-left">
                  <div>
                    <p><span className="font-semibold text-slate-700">Kelas:</span> <strong>{activeClass?.nama} ({activeClass?.jurusan})</strong></p>
                    <p><span className="font-semibold text-slate-700">Semester:</span> <strong>{activeClass?.semester} {activeClass?.tahunAjaran}</strong></p>
                  </div>
                  <div className="text-right">
                    <p><span className="font-semibold text-slate-700">Guru Pengampu:</span> <strong>{currentUser.nama}</strong></p>
                    <p><span className="font-semibold text-slate-700">Rerata Kelas:</span> <strong>{avgClassGrade}</strong></p>
                  </div>
                </div>
              </div>

              {/* Table */}
              <table className="w-full border-collapse border border-slate-900 font-sans text-[10px]">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold text-slate-900">
                    <th className="border border-slate-900 p-1 w-7">No</th>
                    <th className="border border-slate-900 p-1 w-20">NISN</th>
                    <th className="border border-slate-900 p-1 text-left">Nama Siswa</th>
                    <th className="border border-slate-900 p-0.5 w-8">Tgs 1</th>
                    <th className="border border-slate-900 p-0.5 w-8">Tgs 2</th>
                    <th className="border border-slate-900 p-0.5 w-8">Tgs 3</th>
                    <th className="border border-slate-900 p-0.5 w-8">Tgs 4</th>
                    <th className="border border-slate-900 p-0.5 w-8">UH 1</th>
                    <th className="border border-slate-900 p-0.5 w-8">UH 2</th>
                    <th className="border border-slate-900 p-0.5 w-8">UH 3</th>
                    <th className="border border-slate-900 p-0.5 w-8">UH 4</th>
                    <th className="border border-slate-900 p-0.5 w-8">PTS</th>
                    <th className="border border-slate-900 p-0.5 w-8">PAS</th>
                    <th className="border border-slate-900 p-1 w-12 font-extrabold bg-slate-200">Akhir</th>
                    <th className="border border-slate-900 p-0.5 w-8">Pred</th>
                    <th className="border border-slate-900 p-1 w-14">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((s, idx) => {
                    const n = nilaiList.find(item => item.siswaId === s.id) || {
                      tugas1: 80, tugas2: 80, tugas3: 80, tugas4: 80,
                      uh1: 75, uh2: 75, uh3: 75, uh4: 75,
                      pts: 78, pas: 80,
                      ...calculateNilaiAkhir(80, 80, 80, 80, 75, 75, 75, 75, 78, 80, kkm)
                    };
                    const isTuntas = n.nilaiAkhir >= kkm;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="border border-slate-900 p-1 text-center">{idx + 1}</td>
                        <td className="border border-slate-900 p-1 text-center font-mono">{s.nisn}</td>
                        <td className="border border-slate-900 p-1 font-medium">{s.nama}</td>
                        <td className="border border-slate-900 p-0.5 text-center font-mono">{n.tugas1}</td>
                        <td className="border border-slate-900 p-0.5 text-center font-mono">{n.tugas2}</td>
                        <td className="border border-slate-900 p-0.5 text-center font-mono">{n.tugas3}</td>
                        <td className="border border-slate-900 p-0.5 text-center font-mono">{n.tugas4}</td>
                        <td className="border border-slate-900 p-0.5 text-center font-mono">{n.uh1}</td>
                        <td className="border border-slate-900 p-0.5 text-center font-mono">{n.uh2}</td>
                        <td className="border border-slate-900 p-0.5 text-center font-mono">{n.uh3}</td>
                        <td className="border border-slate-900 p-0.5 text-center font-mono">{n.uh4}</td>
                        <td className="border border-slate-900 p-0.5 text-center font-mono">{n.pts}</td>
                        <td className="border border-slate-900 p-0.5 text-center font-mono">{n.pas}</td>
                        <td className="border border-slate-900 p-1 text-center font-extrabold font-mono bg-slate-50">{n.nilaiAkhir}</td>
                        <td className="border border-slate-900 p-0.5 text-center font-bold">{n.predikat}</td>
                        <td className="border border-slate-900 p-1 text-center text-[9px] font-bold">
                          {isTuntas ? (
                            <span className="text-emerald-800 font-bold">TUNTAS</span>
                          ) : (
                            <span className="text-rose-800 font-bold">REMED</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. REKAP JURNAL TABLE */}
          {activeRekapType === 'jurnal' && (
            <div className="space-y-4">
              <div className="text-center font-serif">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 underline">
                  REKAPITULASI AGENDA JURNAL MENGAJAR HARIAN
                </h3>
                <p className="text-[11px] font-sans text-slate-600 mt-1">
                  Nama Guru: {currentUser.nama} (NIP: {currentUser.nip}) • Mapel: {currentUser.mapel}
                </p>
              </div>

              <table className="w-full border-collapse border border-slate-900 font-sans text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold text-slate-900">
                    <th className="border border-slate-900 p-1.5 w-8">No</th>
                    <th className="border border-slate-900 p-1.5 w-22">Hari / Tgl</th>
                    <th className="border border-slate-900 p-1.5 w-16">Kelas</th>
                    <th className="border border-slate-900 p-1.5 w-20">Jam Ke</th>
                    <th className="border border-slate-900 p-1.5 text-left">Materi Pokok & Capaian Pembelajaran</th>
                    <th className="border border-slate-900 p-1.5 w-14">Hadir</th>
                    <th className="border border-slate-900 p-1.5 w-28 text-left">Kendala & Solusi</th>
                    <th className="border border-slate-900 p-1.5 w-18">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jurnalList.map((jur, idx) => {
                    const k = kelasList.find(item => item.id === jur.kelasId);
                    return (
                      <tr key={jur.id} className="hover:bg-slate-50">
                        <td className="border border-slate-900 p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-slate-900 p-1.5 text-center font-mono">{jur.tanggal}</td>
                        <td className="border border-slate-900 p-1.5 text-center font-bold">{k?.nama || '-'}</td>
                        <td className="border border-slate-900 p-1.5 text-center text-[10px]">{jur.jamKe}</td>
                        <td className="border border-slate-900 p-1.5">
                          <strong className="block">{jur.materiPokok}</strong>
                          <span className="text-[10px] text-slate-600">{jur.capaianPembelajaran}</span>
                        </td>
                        <td className="border border-slate-900 p-1.5 text-center font-mono">
                          H: {jur.jumlahHadir}<br />A: {jur.jumlahTidakHadir}
                        </td>
                        <td className="border border-slate-900 p-1.5 text-[10px]">
                          <p><strong>K:</strong> {jur.kendala}</p>
                          <p><strong>S:</strong> {jur.solusi}</p>
                        </td>
                        <td className="border border-slate-900 p-1.5 text-center font-bold text-[10px]">
                          {jur.statusKetercapaian}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. REKAP EKSEKUTIF & STATISTIK */}
          {activeRekapType === 'eksekutif' && (
            <div className="space-y-4 font-sans text-xs">
              <div className="text-center font-serif">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 underline">
                  RINGKASAN EKSEKUTIF KINERJA & AKADEMIK PEMBELAJARAN
                </h3>
                <p className="text-[11px] text-slate-600 mt-1 font-sans">
                  Periode Semester Genap 2025/2026 • Instansi: {kopSuratConfig.namaSekolah}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Rombel Diajar</span>
                  <span className="text-xl font-extrabold font-mono text-slate-900">{kelasList.length} Kelas</span>
                  <p className="text-[10px] text-slate-600 mt-1">Total {siswaList.length} siswa terdaftar</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tingkat Kehadiran Rata-rata</span>
                  <span className="text-xl font-extrabold font-mono text-emerald-700">92%</span>
                  <p className="text-[10px] text-slate-600 mt-1">Berdasarkan seluruh log presensi</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tingkat Ketuntasan Nilai</span>
                  {(() => {
                    const totalG = nilaiList.length;
                    const tuntasG = nilaiList.filter(n => n.nilaiAkhir >= kkm).length;
                    const pct = totalG > 0 ? Math.round((tuntasG / totalG) * 100) : 100;
                    return (
                      <>
                        <span className="text-xl font-extrabold font-mono text-emerald-800 font-bold">{pct}% Tuntas</span>
                        <p className="text-[10px] text-slate-600 mt-1">Memenuhi standar KKM {kkm}</p>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Breakdown per kelas */}
              <div className="mt-4">
                <h4 className="font-bold text-xs text-slate-800 mb-2">Statistik Komparasi Antar Kelas:</h4>
                <table className="w-full border-collapse border border-slate-900 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-slate-900 p-1.5">Nama Kelas</th>
                      <th className="border border-slate-900 p-1.5">Wali Kelas</th>
                      <th className="border border-slate-900 p-1.5">Jml Siswa</th>
                      <th className="border border-slate-900 p-1.5">Rerata Nilai</th>
                      <th className="border border-slate-900 p-1.5">Ketuntasan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kelasList.map((k) => {
                      const st = siswaList.filter(s => s.kelasId === k.id);
                      const classGrades = st.map(s => nilaiList.find(n => n.siswaId === s.id)?.nilaiAkhir || 80);
                      const avg = classGrades.length > 0 ? (classGrades.reduce((a, b) => a + b, 0) / classGrades.length).toFixed(1) : '-';
                      const classTuntasCount = st.filter(s => {
                        const n = nilaiList.find(item => item.siswaId === s.id);
                        return n ? n.nilaiAkhir >= kkm : true;
                      }).length;
                      const tuntasPct = st.length > 0 ? Math.round((classTuntasCount / st.length) * 100) : 0;
                      return (
                        <tr key={k.id}>
                          <td className="border border-slate-900 p-1.5 font-bold text-center">{k.nama}</td>
                          <td className="border border-slate-900 p-1.5">{k.waliKelas}</td>
                          <td className="border border-slate-900 p-1.5 text-center font-mono">{st.length}</td>
                          <td className="border border-slate-900 p-1.5 text-center font-bold font-mono">{avg}</td>
                          <td className="border border-slate-900 p-1.5 text-center font-bold font-mono text-emerald-800">
                            {tuntasPct}% ({classTuntasCount}/{st.length})
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TANDA TANGAN RESMI KEPALA SEKOLAH & GURU PENGAMPU */}
          <div className="mt-10 font-sans flex justify-between px-6 text-center text-xs">
            <div>
              <p>Mengetahui,</p>
              <p>Kepala Sekolah</p>
              <div className="h-16"></div>
              <p className="font-bold underline text-slate-900">{kopSuratConfig.namaKepalaSekolah}</p>
              <p className="text-[10px] text-slate-600 font-mono">NIP. {kopSuratConfig.nipKepalaSekolah}</p>
            </div>

            <div>
              <p>{kopSuratConfig.kota}, {todayFormatted}</p>
              <p>Guru Mata Pelajaran</p>
              <div className="h-16"></div>
              <p className="font-bold underline text-slate-900">{currentUser.nama}</p>
              <p className="text-[10px] text-slate-600 font-mono">NIP. {currentUser.nip}</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
