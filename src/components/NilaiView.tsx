import React, { useState, useEffect } from 'react';
import { Kelas, Siswa, NilaiRecord, Guru } from '../types';
import { calculateNilaiAkhir } from '../data/initialData';
import {
  Award,
  Save,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sliders,
  HelpCircle,
  BookOpen,
  MessageSquare,
  Send,
  School
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NilaiViewProps {
  currentUser: Guru;
  kelasList: Kelas[];
  siswaList: Siswa[];
  nilaiList: NilaiRecord[];
  selectedKelasId: string;
  setSelectedKelasId: (id: string) => void;
  onSaveNilaiBatch: (records: NilaiRecord[]) => void;
  onOpenPrint: (type: 'absen' | 'nilai' | 'jurnal', kelasId: string) => void;
  onOpenWhatsApp?: (config: any) => void;
}

export const NilaiView: React.FC<NilaiViewProps> = ({
  currentUser,
  kelasList,
  siswaList,
  nilaiList,
  selectedKelasId,
  setSelectedKelasId,
  onSaveNilaiBatch,
  onOpenPrint,
  onOpenWhatsApp
}) => {
  const [selectedMapel, setSelectedMapel] = useState(currentUser.mapel || 'Informatika');
  const [kkmThreshold, setKkmThreshold] = useState(75);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const classStudents = siswaList.filter(s => s.kelasId === selectedKelasId);
  const activeClass = kelasList.find(k => k.id === selectedKelasId) || kelasList[0];

  // Local state for editable grades table: keyed by siswaId
  const [editableRows, setEditableRows] = useState<Record<string, {
    tugas1: number;
    tugas2: number;
    tugas3: number;
    tugas4: number;
    uh1: number;
    uh2: number;
    uh3: number;
    uh4: number;
    pts: number;
    pas: number;
    catatan: string;
  }>>({});

  // Initialize editable rows from existing data or default
  useEffect(() => {
    const existing = nilaiList.filter(n => n.kelasId === selectedKelasId);
    const rowMap: Record<string, any> = {};

    classStudents.forEach(s => {
      const found = existing.find(n => n.siswaId === s.id);
      if (found) {
        rowMap[s.id] = {
          tugas1: found.tugas1 ?? 80,
          tugas2: found.tugas2 ?? 80,
          tugas3: found.tugas3 ?? 80,
          tugas4: found.tugas4 ?? 80,
          uh1: found.uh1 ?? 75,
          uh2: found.uh2 ?? 75,
          uh3: found.uh3 ?? 75,
          uh4: found.uh4 ?? 75,
          pts: found.pts ?? 78,
          pas: found.pas ?? 80,
          catatan: found.catatan || ''
        };
      } else {
        rowMap[s.id] = {
          tugas1: 80,
          tugas2: 80,
          tugas3: 80,
          tugas4: 80,
          uh1: 75,
          uh2: 75,
          uh3: 75,
          uh4: 75,
          pts: 78,
          pas: 80,
          catatan: 'Cukup aktif dalam pembelajaran.'
        };
      }
    });

    setEditableRows(rowMap);
  }, [selectedKelasId, nilaiList, siswaList]);

  const handleValueChange = (siswaId: string, field: string, value: any) => {
    setEditableRows(prev => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        [field]: value
      }
    }));
  };

  const handleSaveAll = () => {
    const updatedRecords: NilaiRecord[] = classStudents.map(s => {
      const row = editableRows[s.id] || {
        tugas1: 0,
        tugas2: 0,
        tugas3: 0,
        tugas4: 0,
        uh1: 0,
        uh2: 0,
        uh3: 0,
        uh4: 0,
        pts: 0,
        pas: 0,
        catatan: ''
      };

      const calc = calculateNilaiAkhir(
        Number(row.tugas1) || 0,
        Number(row.tugas2) || 0,
        Number(row.tugas3) || 0,
        Number(row.tugas4) || 0,
        Number(row.uh1) || 0,
        Number(row.uh2) || 0,
        Number(row.uh3) || 0,
        Number(row.uh4) || 0,
        Number(row.pts) || 0,
        Number(row.pas) || 0
      );

      return {
        id: `nil-${selectedKelasId}-${s.id}`,
        kelasId: selectedKelasId,
        siswaId: s.id,
        mapel: selectedMapel,
        tugas1: Number(row.tugas1) || 0,
        tugas2: Number(row.tugas2) || 0,
        tugas3: Number(row.tugas3) || 0,
        tugas4: Number(row.tugas4) || 0,
        uh1: Number(row.uh1) || 0,
        uh2: Number(row.uh2) || 0,
        uh3: Number(row.uh3) || 0,
        uh4: Number(row.uh4) || 0,
        pts: Number(row.pts) || 0,
        pas: Number(row.pas) || 0,
        nilaiAkhir: calc.nilaiAkhir,
        predikat: calc.predikat,
        statusLulus: calc.nilaiAkhir >= kkmThreshold,
        catatan: row.catatan
      };
    });

    onSaveNilaiBatch(updatedRecords);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  // KPI Calculations
  const calculatedItems = classStudents.map(s => {
    const row = editableRows[s.id] || { tugas1: 0, tugas2: 0, tugas3: 0, tugas4: 0, uh1: 0, uh2: 0, uh3: 0, uh4: 0, pts: 0, pas: 0, catatan: '' };
    return calculateNilaiAkhir(
      Number(row.tugas1) || 0,
      Number(row.tugas2) || 0,
      Number(row.tugas3) || 0,
      Number(row.tugas4) || 0,
      Number(row.uh1) || 0,
      Number(row.uh2) || 0,
      Number(row.uh3) || 0,
      Number(row.uh4) || 0,
      Number(row.pts) || 0,
      Number(row.pas) || 0
    );
  });

  const finalScores = calculatedItems.map(c => c.nilaiAkhir);
  const highestScore = finalScores.length > 0 ? Math.max(...finalScores) : 0;
  const lowestScore = finalScores.length > 0 ? Math.min(...finalScores) : 0;
  const avgScore = finalScores.length > 0
    ? (finalScores.reduce((a, b) => a + b, 0) / finalScores.length).toFixed(1)
    : '0';
  const tuntasCount = finalScores.filter(score => score >= kkmThreshold).length;
  const tuntasPct = finalScores.length > 0 ? Math.round((tuntasCount / finalScores.length) * 100) : 0;

  // Export Leger to CSV
  const exportCSV = () => {
    const headers = ['No', 'NISN', 'Nama Siswa', 'Tugas 1', 'Tugas 2', 'Tugas 3', 'Tugas 4', 'UH 1', 'UH 2', 'UH 3', 'UH 4', 'PTS', 'PAS', 'Nilai Akhir', 'Predikat', 'Status Kelulusan', 'Catatan Guru'];
    const rows = classStudents.map((s, idx) => {
      const row = editableRows[s.id] || { tugas1: 0, tugas2: 0, tugas3: 0, tugas4: 0, uh1: 0, uh2: 0, uh3: 0, uh4: 0, pts: 0, pas: 0, catatan: '' };
      const calc = calculateNilaiAkhir(
        Number(row.tugas1) || 0,
        Number(row.tugas2) || 0,
        Number(row.tugas3) || 0,
        Number(row.tugas4) || 0,
        Number(row.uh1) || 0,
        Number(row.uh2) || 0,
        Number(row.uh3) || 0,
        Number(row.uh4) || 0,
        Number(row.pts) || 0,
        Number(row.pas) || 0
      );
      return [
        idx + 1,
        s.nisn,
        `"${s.nama}"`,
        row.tugas1,
        row.tugas2,
        row.tugas3,
        row.tugas4,
        row.uh1,
        row.uh2,
        row.uh3,
        row.uh4,
        row.pts,
        row.pas,
        calc.nilaiAkhir,
        calc.predikat,
        calc.nilaiAkhir >= kkmThreshold ? 'TUNTAS' : 'BELUM TUNTAS',
        `"${row.catatan}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Leger_Nilai_${activeClass?.nama || 'Kelas'}_${selectedMapel}.csv`);
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
              <Award className="w-4 h-4 text-purple-600" />
              <span>Penilaian & Leger Nilai Siswa</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Input nilai tugas, ulangan harian, PTS, dan PAS dengan kalkulasi predikat otomatis
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenWhatsApp && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenWhatsApp({
                    target: 'wali_kelas',
                    reportType: 'nilai_wali',
                    kelasId: selectedKelasId
                  })}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 shadow-2xs"
                  title="Kirim Rekap Leger Nilai ke WhatsApp Wali Kelas"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WA Wali Kelas</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenWhatsApp({
                    target: 'ortu',
                    reportType: 'nilai',
                    kelasId: selectedKelasId
                  })}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 shadow-2xs"
                  title="Kirim Hasil Nilai ke WhatsApp Orang Tua"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WA ke Ortu</span>
                </button>
              </>
            )}
            <button
              onClick={() => onOpenPrint('nilai', selectedKelasId)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
            <button
              onClick={exportCSV}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 transition flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              id="save-nilai-btn"
              onClick={handleSaveAll}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan</span>
            </button>
          </div>
        </div>

        {/* Filter Selection: Kelas, Mapel, KKM */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2.5 border-t border-slate-100">
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
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Mata Pelajaran</label>
            <input
              type="text"
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
              placeholder="Informatika / Matematika / dll"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Batas KKM Kelulusan</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={kkmThreshold}
                onChange={(e) => setKkmThreshold(Number(e.target.value))}
                className="w-18 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-blue-700 text-center focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
              />
              <span className="text-[11px] text-slate-500 font-medium">Standar KKM: 75</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Rata-Rata</span>
          <span className="text-xl font-bold text-blue-600 mt-0.5 block font-mono">{avgScore}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Tertinggi</span>
          <span className="text-xl font-bold text-emerald-600 mt-0.5 block font-mono">{highestScore}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Terendah</span>
          <span className="text-xl font-bold text-rose-600 mt-0.5 block font-mono">{lowestScore}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Ketuntasan</span>
          <span className="text-xl font-bold text-purple-600 mt-0.5 block font-mono">{tuntasPct}% <span className="text-xs text-slate-500 font-normal">({tuntasCount} siswa)</span></span>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMsg && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Nilai mata pelajaran {selectedMapel} untuk kelas {activeClass?.nama} berhasil disimpan ke database!</span>
        </div>
      )}

      {/* Editable Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1 text-[11px]">
            <Sliders className="w-3.5 h-3.5 text-purple-600" />
            <span className="font-bold">Bobot:</span>
            <span>Tugas 1-4 (20%) + UH 1-4 (20%) + PTS (30%) + PAS (30%)</span>
          </div>
          <span className="text-[10px] text-slate-400 italic">Edit angka langsung pada kolom</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-2 px-2 text-center w-8">No</th>
                <th className="py-2 px-2">NISN</th>
                <th className="py-2 px-2 min-w-[120px]">Nama Siswa</th>
                <th className="py-2 px-1 text-center w-12 bg-blue-50/70">Tgs 1</th>
                <th className="py-2 px-1 text-center w-12 bg-blue-50/70">Tgs 2</th>
                <th className="py-2 px-1 text-center w-12 bg-blue-50/70">Tgs 3</th>
                <th className="py-2 px-1 text-center w-12 bg-blue-50/70">Tgs 4</th>
                <th className="py-2 px-1 text-center w-12 bg-indigo-50/70">UH 1</th>
                <th className="py-2 px-1 text-center w-12 bg-indigo-50/70">UH 2</th>
                <th className="py-2 px-1 text-center w-12 bg-indigo-50/70">UH 3</th>
                <th className="py-2 px-1 text-center w-12 bg-indigo-50/70">UH 4</th>
                <th className="py-2 px-1 text-center w-12 bg-amber-50/70">PTS</th>
                <th className="py-2 px-1 text-center w-12 bg-amber-50/70">PAS</th>
                <th className="py-2 px-1.5 text-center w-14 bg-purple-100 text-purple-900 font-extrabold">Akhir</th>
                <th className="py-2 px-1 text-center w-9">Pred</th>
                <th className="py-2 px-1 text-center w-14">Status</th>
                <th className="py-2 px-2 min-w-[130px]">Catatan Capaian</th>
                <th className="py-2 px-1.5 text-center w-20">Lapor WA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((siswa, idx) => {
                const row = editableRows[siswa.id] || {
                  tugas1: 0,
                  tugas2: 0,
                  tugas3: 0,
                  tugas4: 0,
                  uh1: 0,
                  uh2: 0,
                  uh3: 0,
                  uh4: 0,
                  pts: 0,
                  pas: 0,
                  catatan: ''
                };

                const calc = calculateNilaiAkhir(
                  Number(row.tugas1) || 0,
                  Number(row.tugas2) || 0,
                  Number(row.tugas3) || 0,
                  Number(row.tugas4) || 0,
                  Number(row.uh1) || 0,
                  Number(row.uh2) || 0,
                  Number(row.uh3) || 0,
                  Number(row.uh4) || 0,
                  Number(row.pts) || 0,
                  Number(row.pas) || 0
                );

                const isLulus = calc.nilaiAkhir >= kkmThreshold;

                return (
                  <tr key={siswa.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-1 px-2 text-center font-medium text-slate-400 text-[10px]">{idx + 1}</td>
                    <td className="py-1 px-2 font-mono font-medium text-slate-500 text-[10px]">{siswa.nisn}</td>
                    <td className="py-1 px-2 font-semibold text-slate-900 text-xs">{siswa.nama}</td>

                    {/* Tugas 1 */}
                    <td className="py-1 px-0.5 text-center bg-blue-50/30">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.tugas1}
                        onChange={(e) => handleValueChange(siswa.id, 'tugas1', e.target.value)}
                        className="w-11 text-center py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                    </td>

                    {/* Tugas 2 */}
                    <td className="py-1 px-0.5 text-center bg-blue-50/30">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.tugas2}
                        onChange={(e) => handleValueChange(siswa.id, 'tugas2', e.target.value)}
                        className="w-11 text-center py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                    </td>

                    {/* Tugas 3 */}
                    <td className="py-1 px-0.5 text-center bg-blue-50/30">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.tugas3}
                        onChange={(e) => handleValueChange(siswa.id, 'tugas3', e.target.value)}
                        className="w-11 text-center py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                    </td>

                    {/* Tugas 4 */}
                    <td className="py-1 px-0.5 text-center bg-blue-50/30">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.tugas4}
                        onChange={(e) => handleValueChange(siswa.id, 'tugas4', e.target.value)}
                        className="w-11 text-center py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                    </td>

                    {/* UH 1 */}
                    <td className="py-1 px-0.5 text-center bg-indigo-50/30">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.uh1}
                        onChange={(e) => handleValueChange(siswa.id, 'uh1', e.target.value)}
                        className="w-11 text-center py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                    </td>

                    {/* UH 2 */}
                    <td className="py-1 px-0.5 text-center bg-indigo-50/30">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.uh2}
                        onChange={(e) => handleValueChange(siswa.id, 'uh2', e.target.value)}
                        className="w-11 text-center py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                    </td>

                    {/* UH 3 */}
                    <td className="py-1 px-0.5 text-center bg-indigo-50/30">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.uh3}
                        onChange={(e) => handleValueChange(siswa.id, 'uh3', e.target.value)}
                        className="w-11 text-center py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                    </td>

                    {/* UH 4 */}
                    <td className="py-1 px-0.5 text-center bg-indigo-50/30">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.uh4}
                        onChange={(e) => handleValueChange(siswa.id, 'uh4', e.target.value)}
                        className="w-11 text-center py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                    </td>

                    {/* PTS */}
                    <td className="py-1 px-0.5 text-center bg-amber-50/30">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.pts}
                        onChange={(e) => handleValueChange(siswa.id, 'pts', e.target.value)}
                        className="w-11 text-center py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                    </td>

                    {/* PAS */}
                    <td className="py-1 px-0.5 text-center bg-amber-50/30">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.pas}
                        onChange={(e) => handleValueChange(siswa.id, 'pas', e.target.value)}
                        className="w-11 text-center py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                    </td>

                    {/* Nilai Akhir (Auto) */}
                    <td className="py-1 px-1.5 text-center bg-purple-50">
                      <span className="font-extrabold text-xs text-purple-700 font-mono">{calc.nilaiAkhir}</span>
                    </td>

                    {/* Predikat */}
                    <td className="py-1 px-1 text-center">
                      <span className={`inline-block w-5 py-0.2 rounded font-extrabold text-[10px] font-mono ${
                        calc.predikat === 'A' ? 'bg-emerald-100 text-emerald-800' :
                        calc.predikat === 'B' ? 'bg-blue-100 text-blue-800' :
                        calc.predikat === 'C' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {calc.predikat}
                      </span>
                    </td>

                    {/* Status Lulus */}
                    <td className="py-1 px-1 text-center">
                      <span className={`inline-block px-1 py-0.2 rounded text-[8.5px] font-bold ${
                        isLulus ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isLulus ? 'Tuntas' : 'Remedial'}
                      </span>
                    </td>

                    {/* Catatan */}
                    <td className="py-1 px-2">
                      <input
                        type="text"
                        placeholder="Catatan..."
                        value={row.catatan}
                        onChange={(e) => handleValueChange(siswa.id, 'catatan', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none"
                      />
                    </td>

                    {/* WhatsApp button */}
                    <td className="py-1 px-1.5 text-center">
                      {onOpenWhatsApp && (
                        <button
                          type="button"
                          onClick={() => onOpenWhatsApp({
                            target: 'ortu',
                            reportType: !isLulus ? 'alert_nilai' : 'nilai',
                            kelasId: selectedKelasId,
                            siswaId: siswa.id
                          })}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition flex items-center justify-center gap-1 mx-auto shadow-2xs ${
                            !isLulus
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                          title={`Kirim laporan nilai ke WhatsApp Wali ${siswa.nama}`}
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>{!isLulus ? 'Remedial' : 'WA Nilai'}</span>
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
            <Award className="w-10 h-10 text-slate-300 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-700">Belum ada siswa terdaftar di kelas ini</p>
          </div>
        )}
      </div>

    </div>
  );
};
