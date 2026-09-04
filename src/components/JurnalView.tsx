import React, { useState } from 'react';
import { Guru, Kelas, JurnalRecord, StatusKetercapaian } from '../types';
import { getTodayString } from '../data/initialData';
import {
  BookOpenCheck,
  Plus,
  Calendar,
  Clock,
  Printer,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Edit2,
  Trash2,
  FileText,
  School
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface JurnalViewProps {
  currentUser: Guru;
  kelasList: Kelas[];
  jurnalList: JurnalRecord[];
  onSaveJurnal: (jurnal: JurnalRecord) => void;
  onDeleteJurnal: (id: string) => void;
  onOpenPrint: (type: 'absen' | 'nilai' | 'jurnal', kelasId: string) => void;
}

export const JurnalView: React.FC<JurnalViewProps> = ({
  currentUser,
  kelasList,
  jurnalList,
  onSaveJurnal,
  onDeleteJurnal,
  onOpenPrint
}) => {
  const [selectedKelasFilter, setSelectedKelasFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJurnal, setEditingJurnal] = useState<JurnalRecord | null>(null);

  // Form State
  const [kelasId, setKelasId] = useState(kelasList[0]?.id || '');
  const [tanggal, setTanggal] = useState(getTodayString());
  const [jamKe, setJamKe] = useState('1 - 3 (07:15 - 09:30)');
  const [mapel, setMapel] = useState(currentUser.mapel || 'Informatika');
  const [materiPokok, setMateriPokok] = useState('');
  const [capaianPembelajaran, setCapaianPembelajaran] = useState('');
  const [jumlahHadir, setJumlahHadir] = useState<number>(30);
  const [jumlahTidakHadir, setJumlahTidakHadir] = useState<number>(0);
  const [kendala, setKendala] = useState('');
  const [solusi, setSolusi] = useState('');
  const [statusKetercapaian, setStatusKetercapaian] = useState<StatusKetercapaian>('Tercapai');

  const openAddModal = () => {
    setEditingJurnal(null);
    setKelasId(selectedKelasFilter !== 'ALL' ? selectedKelasFilter : kelasList[0]?.id || '');
    setTanggal(getTodayString());
    setJamKe('1 - 3 (07:15 - 09:30)');
    setMapel(currentUser.mapel || 'Informatika');
    setMateriPokok('');
    setCapaianPembelajaran('');
    setJumlahHadir(30);
    setJumlahTidakHadir(0);
    setKendala('');
    setSolusi('');
    setStatusKetercapaian('Tercapai');
    setIsModalOpen(true);
  };

  const openEditModal = (jurnal: JurnalRecord) => {
    setEditingJurnal(jurnal);
    setKelasId(jurnal.kelasId);
    setTanggal(jurnal.tanggal);
    setJamKe(jurnal.jamKe);
    setMapel(jurnal.mapel);
    setMateriPokok(jurnal.materiPokok);
    setCapaianPembelajaran(jurnal.capaianPembelajaran);
    setJumlahHadir(jurnal.jumlahHadir);
    setJumlahTidakHadir(jurnal.jumlahTidakHadir);
    setKendala(jurnal.kendala);
    setSolusi(jurnal.solusi);
    setStatusKetercapaian(jurnal.statusKetercapaian);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materiPokok.trim()) return;

    const data: JurnalRecord = {
      id: editingJurnal ? editingJurnal.id : `jur-${Date.now()}`,
      guruId: currentUser.id,
      kelasId,
      tanggal,
      jamKe,
      mapel: mapel.trim(),
      materiPokok: materiPokok.trim(),
      capaianPembelajaran: capaianPembelajaran.trim(),
      jumlahHadir: Number(jumlahHadir) || 0,
      jumlahTidakHadir: Number(jumlahTidakHadir) || 0,
      kendala: kendala.trim() || 'Tidak ada kendala berarti.',
      solusi: solusi.trim() || 'Pembelajaran berlangsung tertib.',
      statusKetercapaian
    };

    onSaveJurnal(data);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setIsModalOpen(false);
  };

  // Filter list
  const filteredJurnal = jurnalList.filter(j => {
    return selectedKelasFilter === 'ALL' || j.kelasId === selectedKelasFilter;
  });

  return (
    <div className="space-y-4 pb-8">
      
      {/* Header Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpenCheck className="w-4 h-4 text-rose-500" />
              <span>Jurnal Mengajar Harian Guru</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Dokumentasi pelaksanaan pembelajaran tatap muka, materi pokok, kendala dan tindak lanjut
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenPrint('jurnal', selectedKelasFilter === 'ALL' ? kelasList[0]?.id || '' : selectedKelasFilter)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>

            <button
              id="add-jurnal-btn"
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tulis Jurnal</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Filter Kelas:</label>
          <select
            value={selectedKelasFilter}
            onChange={(e) => setSelectedKelasFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Kelas ({jurnalList.length} Catatan Jurnal)</option>
            {kelasList.map(k => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Jurnal Cards List */}
      <div className="space-y-3">
        {filteredJurnal.map((jur) => {
          const kelas = kelasList.find(k => k.id === jur.kelasId);
          return (
            <div
              key={jur.id}
              className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:border-blue-300 transition space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[11px] px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {kelas ? kelas.nama : 'Kelas'}
                  </span>
                  <span className="font-semibold text-xs text-slate-800 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {jur.tanggal}
                  </span>
                  <span className="text-slate-300 text-xs">•</span>
                  <span className="text-xs text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Jam Ke: {jur.jamKe}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                    jur.statusKetercapaian === 'Tercapai' ? 'bg-emerald-100 text-emerald-800' :
                    jur.statusKetercapaian === 'Sebagian' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    ● {jur.statusKetercapaian}
                  </span>

                  <button
                    onClick={() => openEditModal(jur)}
                    title="Edit Jurnal"
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Hapus catatan jurnal ini?')) {
                        onDeleteJurnal(jur.id);
                      }
                    }}
                    title="Hapus Jurnal"
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Materi & Capaian */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <h4 className="font-bold text-slate-700 mb-0.5 text-[10px] uppercase tracking-wider text-blue-700">
                    Materi Pokok / Pembahasan:
                  </h4>
                  <p className="text-slate-900 font-semibold">{jur.materiPokok}</p>
                  
                  {jur.capaianPembelajaran && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-200">
                      <span className="text-[9px] font-bold text-slate-500 block">Capaian Pembelajaran:</span>
                      <p className="text-slate-700 mt-0.5 text-[11px]">{jur.capaianPembelajaran}</p>
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                  <div>
                    <span className="text-[9px] font-bold text-rose-600 block uppercase tracking-wider">Kendala / Masalah:</span>
                    <p className="text-slate-700 text-[11px]">{jur.kendala || '-'}</p>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200">
                    <span className="text-[9px] font-bold text-emerald-600 block uppercase tracking-wider">Solusi / Pemecahan Masalah:</span>
                    <p className="text-slate-700 text-[11px]">{jur.solusi || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Footer info: Hadir / Mapel */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
                <span>Mata Pelajaran: <strong>{jur.mapel}</strong></span>
                <span>Kehadiran: <strong className="text-emerald-700">{jur.jumlahHadir} Hadir</strong>, <strong className="text-rose-700">{jur.jumlahTidakHadir} Absen</strong></span>
              </div>
            </div>
          );
        })}

        {filteredJurnal.length === 0 && (
          <div className="text-center py-8 bg-white rounded-xl border border-slate-200 p-6">
            <BookOpenCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-700">Belum ada catatan jurnal mengajar</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Klik tombol "Tulis Jurnal" untuk mencatat kegiatan mengajar hari ini.</p>
          </div>
        )}
      </div>

      {/* MODAL INPUT / EDIT JURNAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-xl max-w-md w-full p-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <BookOpenCheck className="w-4 h-4 text-rose-600" />
                <span>{editingJurnal ? 'Edit Jurnal Mengajar' : 'Tulis Jurnal Mengajar'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Pilih Kelas *</label>
                  <select
                    value={kelasId}
                    onChange={(e) => setKelasId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  >
                    {kelasList.map(k => (
                      <option key={k.id} value={k.id}>{k.nama}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Tanggal *</label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Jam Ke- / Waktu</label>
                  <input
                    type="text"
                    placeholder="1 - 3 (07:15 - 09:30)"
                    value={jamKe}
                    onChange={(e) => setJamKe(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Mata Pelajaran</label>
                  <input
                    type="text"
                    required
                    value={mapel}
                    onChange={(e) => setMapel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Materi Pokok / Bahasan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Algoritma dan Pemrograman Dasar"
                  value={materiPokok}
                  onChange={(e) => setMateriPokok(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Capaian Pembelajaran (TP)</label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi target kompetensi siswa..."
                  value={capaianPembelajaran}
                  onChange={(e) => setCapaianPembelajaran(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Siswa Hadir</label>
                  <input
                    type="number"
                    min="0"
                    value={jumlahHadir}
                    onChange={(e) => setJumlahHadir(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Tidak Hadir</label>
                  <input
                    type="number"
                    min="0"
                    value={jumlahTidakHadir}
                    onChange={(e) => setJumlahTidakHadir(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Kendala Pembelajaran</label>
                <input
                  type="text"
                  placeholder="Kendala sarana, koneksi, atau pemahaman..."
                  value={kendala}
                  onChange={(e) => setKendala(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Solusi / Tindak Lanjut</label>
                <input
                  type="text"
                  placeholder="Solusi atau strategi perbaikan..."
                  value={solusi}
                  onChange={(e) => setSolusi(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Status Ketercapaian</label>
                <select
                  value={statusKetercapaian}
                  onChange={(e) => setStatusKetercapaian(e.target.value as StatusKetercapaian)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                >
                  <option value="Tercapai">Tercapai (100% Sesuai RPP)</option>
                  <option value="Sebagian">Sebagian (Perlu Tambahan Jam)</option>
                  <option value="Belum">Belum (Tertunda Kegiatan Sekolah)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-200 mt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1 shadow-2xs text-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simpan Jurnal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
