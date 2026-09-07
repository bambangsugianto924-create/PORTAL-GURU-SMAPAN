import React, { useState, useRef } from 'react';
import { Guru, Kelas, Siswa, AbsensiRecord, NilaiRecord, JurnalRecord, KopSuratConfig } from '../types';
import { calculateNilaiAkhir } from '../data/initialData';
import { KopSuratHeader } from './KopSuratHeader';
import { PDFService } from '../services/pdfService';
import {
  Printer,
  Download,
  X,
  Settings2,
  CheckCircle2,
  Loader2,
  FileSpreadsheet,
  Layers,
  Sparkles
} from 'lucide-react';

interface PrintModalProps {
  type: 'absen' | 'nilai' | 'jurnal';
  kelasId: string;
  currentUser: Guru;
  kelasList: Kelas[];
  siswaList: Siswa[];
  absensiList: AbsensiRecord[];
  nilaiList: NilaiRecord[];
  jurnalList: JurnalRecord[];
  kopSuratConfig: KopSuratConfig;
  kkm?: number;
  onOpenKopEditor?: () => void;
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  type,
  kelasId,
  currentUser,
  kelasList,
  siswaList,
  absensiList,
  nilaiList,
  jurnalList,
  kopSuratConfig,
  kkm = 75,
  onOpenKopEditor,
  onClose
}) => {
  const [selectedKId, setSelectedKId] = useState<string>(kelasId || kelasList[0]?.id || '');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(type === 'nilai' ? 'landscape' : 'portrait');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const printAreaRef = useRef<HTMLDivElement>(null);

  const activeClass = kelasList.find(k => k.id === selectedKId) || kelasList[0];
  const classStudents = siswaList.filter(s => s.kelasId === activeClass?.id);

  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const getDocTitle = () => {
    if (type === 'absen') return `Rekap_Presensi_${activeClass?.nama || 'Kelas'}`;
    if (type === 'nilai') return `Leger_Nilai_${activeClass?.nama || 'Kelas'}`;
    return `Jurnal_Mengajar_${currentUser.nama.replace(/[^a-zA-Z0-9]/g, '_')}`;
  };

  // Direct PDF generation & download
  const handleDownloadPDF = async () => {
    if (!printAreaRef.current) return;
    setIsExportingPDF(true);
    setSuccessMsg(null);

    const filename = `${getDocTitle()}_${new Date().toISOString().slice(0, 10)}.pdf`;
    const success = await PDFService.exportToPDF(printAreaRef.current, {
      filename,
      orientation,
      marginMm: 8
    });

    setIsExportingPDF(false);
    if (success) {
      setSuccessMsg(`Berkas PDF "${filename}" berhasil diunduh!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // Clean print
  const handlePrint = () => {
    if (printAreaRef.current) {
      PDFService.printCleanly(printAreaRef.current, getDocTitle());
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print-modal-wrapper">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[96vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden print-modal-content">
        
        {/* Modal Action Bar (Hidden when printing) */}
        <div className="no-print p-3 sm:p-4 bg-emerald-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs">
              <Printer className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                <span>Pratinjau Cetak & Ekspor Dokumen</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-800 text-emerald-200 font-normal">
                  {orientation === 'landscape' ? 'Landscape (Mendatar)' : 'Portrait (Tegak)'}
                </span>
              </h3>
              <p className="text-[10px] text-emerald-300">
                Format A4 resmi dengan Kop Surat sekolah, tabel data, & tanda tangan
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            
            {/* Switch Class if multiple */}
            {kelasList.length > 1 && type !== 'jurnal' && (
              <div className="flex items-center gap-1 bg-emerald-900/80 px-2 py-1 rounded-lg border border-emerald-700 text-xs">
                <span className="text-[10px] text-emerald-300">Kelas:</span>
                <select
                  value={selectedKId}
                  onChange={(e) => setSelectedKId(e.target.value)}
                  className="bg-emerald-950 text-white text-xs font-bold rounded px-1.5 py-0.5 border border-emerald-600 focus:outline-none"
                >
                  {kelasList.map(k => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Orientation toggle */}
            <div className="flex items-center bg-emerald-900/80 p-0.5 rounded-lg border border-emerald-700 text-[11px]">
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`px-2 py-1 rounded font-medium transition ${orientation === 'portrait' ? 'bg-emerald-700 text-white font-bold' : 'text-emerald-300 hover:text-white'}`}
              >
                Tegak
              </button>
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`px-2 py-1 rounded font-medium transition ${orientation === 'landscape' ? 'bg-emerald-700 text-white font-bold' : 'text-emerald-300 hover:text-white'}`}
              >
                Mendatar
              </button>
            </div>

            {onOpenKopEditor && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenKopEditor();
                }}
                className="py-1.5 px-2.5 bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold rounded-lg transition flex items-center gap-1 border border-emerald-700"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Setel Kop</span>
              </button>
            )}

            {/* Direct PDF Download Button */}
            <button
              id="modal-download-pdf-btn"
              type="button"
              disabled={isExportingPDF}
              onClick={handleDownloadPDF}
              className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 border border-amber-400"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </>
              )}
            </button>

            {/* Print button */}
            <button
              id="modal-print-btn"
              type="button"
              onClick={handlePrint}
              className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1.5 border border-emerald-500"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-emerald-300 hover:text-white rounded-lg transition hover:bg-emerald-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success toast if PDF is generated */}
        {successMsg && (
          <div className="no-print p-2 bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 border-b border-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Printable Document Paper Area */}
        <div className="flex-1 overflow-y-auto bg-slate-200/60 p-3 sm:p-6 flex justify-center">
          <div
            id="printable-document-modal"
            ref={printAreaRef}
            data-print-target="true"
            className={`bg-white shadow-md border border-slate-300 p-6 sm:p-8 font-serif text-slate-900 text-xs transition-all ${
              orientation === 'landscape' ? 'w-full max-w-[297mm] min-h-[210mm]' : 'w-full max-w-[210mm] min-h-[297mm]'
            }`}
          >
            
            {/* DYNAMIC KOP SURAT SEKOLAH */}
            <KopSuratHeader config={kopSuratConfig} />

            {/* DOKUMEN 1: REKAP ABSENSI */}
            {type === 'absen' && (
              <div className="space-y-4">
                <div className="text-center font-serif">
                  <h3 className="font-bold uppercase tracking-wider text-sm underline text-slate-900">
                    REKAPITULASI PRESENSI KEHADIRAN PESERTA DIDIK
                  </h3>
                  <div className="font-sans flex justify-between items-center text-[11px] mt-3 px-2 border-t border-b border-slate-300 py-1.5 text-left">
                    <div>
                      <p>Kelas / Jurusan: <strong>{activeClass?.nama} ({activeClass?.jurusan})</strong></p>
                      <p>Wali Kelas: <strong>{activeClass?.waliKelas}</strong></p>
                    </div>
                    <div className="text-right">
                      <p>Tahun Pelajaran: <strong>{activeClass?.tahunAjaran || '2025/2026'}</strong></p>
                      <p>Semester: <strong>{activeClass?.semester || 'Genap'}</strong></p>
                    </div>
                  </div>
                </div>

                <table className="w-full border-collapse border border-slate-900 font-sans text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-center font-bold text-slate-900">
                      <th className="border border-slate-900 p-1.5 w-8">No</th>
                      <th className="border border-slate-900 p-1.5 w-24">NISN</th>
                      <th className="border border-slate-900 p-1.5 text-left">Nama Lengkap Siswa</th>
                      <th className="border border-slate-900 p-1.5 w-10">L/P</th>
                      <th className="border border-slate-900 p-1.5 w-12">Hadir</th>
                      <th className="border border-slate-900 p-1.5 w-12">Izin</th>
                      <th className="border border-slate-900 p-1.5 w-12">Sakit</th>
                      <th className="border border-slate-900 p-1.5 w-12">Alpa</th>
                      <th className="border border-slate-900 p-1.5 w-18">% Hadir</th>
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
                          <td className="border border-slate-900 p-1.5 text-center text-[10px]">
                            {pct >= 75 ? 'Memenuhi' : 'Binaan'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* DOKUMEN 2: LEGER NILAI */}
            {type === 'nilai' && (
              <div className="space-y-4">
                <div className="text-center font-serif">
                  <h3 className="font-bold uppercase tracking-wider text-sm underline text-slate-900">
                    LEGER NILAI HASIL EVALUASI PEMBELAJARAN
                  </h3>
                  <div className="font-sans flex justify-between items-center text-[11px] mt-3 px-2 border-t border-b border-slate-300 py-1.5 text-left">
                    <div>
                      <p>Kelas / Jurusan: <strong>{activeClass?.nama} ({activeClass?.jurusan})</strong></p>
                      <p>Mata Pelajaran: <strong>{currentUser.mapel}</strong></p>
                    </div>
                    <div className="text-right">
                      <p>Guru Pengampu: <strong>{currentUser.nama}</strong></p>
                      <p>KKM: <strong>{kkm}</strong></p>
                    </div>
                  </div>
                </div>

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
                          <td className="border border-slate-900 p-1 text-center font-bold text-[9px]">
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

            {/* DOKUMEN 3: JURNAL MENGAJAR */}
            {type === 'jurnal' && (
              <div className="space-y-4">
                <div className="text-center font-serif">
                  <h3 className="font-bold uppercase tracking-wider text-sm underline text-slate-900">
                    JURNAL AGENDA MENGAJAR HARIAN GURU
                  </h3>
                  <div className="font-sans flex justify-between items-center text-[11px] mt-3 px-2 border-t border-b border-slate-300 py-1.5 text-left">
                    <div>
                      <p>Nama Guru: <strong>{currentUser.nama}</strong></p>
                      <p>NIP: <strong>{currentUser.nip}</strong></p>
                    </div>
                    <div className="text-right">
                      <p>Mata Pelajaran: <strong>{currentUser.mapel}</strong></p>
                      <p>Tahun Pelajaran: <strong>2025/2026</strong></p>
                    </div>
                  </div>
                </div>

                <table className="w-full border-collapse border border-slate-900 font-sans text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-center font-bold text-slate-900">
                      <th className="border border-slate-900 p-1.5 w-8">No</th>
                      <th className="border border-slate-900 p-1.5 w-22">Hari / Tanggal</th>
                      <th className="border border-slate-900 p-1.5 w-16">Kelas</th>
                      <th className="border border-slate-900 p-1.5 w-20">Jam Ke</th>
                      <th className="border border-slate-900 p-1.5 text-left">Materi Pokok & Capaian</th>
                      <th className="border border-slate-900 p-1.5 w-14">Kehadiran</th>
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

            {/* TANDA TANGAN KEPALA SEKOLAH & GURU PENGAMPU */}
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
    </div>
  );
};
