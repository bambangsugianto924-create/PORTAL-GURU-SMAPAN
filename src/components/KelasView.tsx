import React, { useState } from 'react';
import { Kelas, Siswa } from '../types';
import {
  School,
  Plus,
  Edit2,
  Trash2,
  Users,
  Search,
  BookOpen,
  MapPin,
  Calendar,
  CheckCircle2,
  X,
  MessageSquare,
  Phone
} from 'lucide-react';

interface KelasViewProps {
  kelasList: Kelas[];
  siswaList: Siswa[];
  onSaveKelas: (kelas: Kelas) => void;
  onDeleteKelas: (kelasId: string) => void;
  onSelectKelas: (kelasId: string, target: 'siswa' | 'absen' | 'nilai') => void;
  onOpenWhatsApp?: (config: any) => void;
}

export const KelasView: React.FC<KelasViewProps> = ({
  kelasList,
  siswaList,
  onSaveKelas,
  onDeleteKelas,
  onSelectKelas,
  onOpenWhatsApp
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);

  // Form State
  const [nama, setNama] = useState('');
  const [tingkat, setTingkat] = useState('10');
  const [jurusan, setJurusan] = useState('MIPA');
  const [waliKelas, setWaliKelas] = useState('');
  const [noHpWaliKelas, setNoHpWaliKelas] = useState('');
  const [tahunAjaran, setTahunAjaran] = useState('2025/2026');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>('Genap');
  const [ruangan, setRuangan] = useState('Ruang Kelas 101');

  const openAddModal = () => {
    setEditingKelas(null);
    setNama('');
    setTingkat('10');
    setJurusan('MIPA');
    setWaliKelas('');
    setNoHpWaliKelas('');
    setTahunAjaran('2025/2026');
    setSemester('Genap');
    setRuangan('Ruang Kelas 101');
    setIsModalOpen(true);
  };

  const openEditModal = (kelas: Kelas) => {
    setEditingKelas(kelas);
    setNama(kelas.nama);
    setTingkat(kelas.tingkat);
    setJurusan(kelas.jurusan);
    setWaliKelas(kelas.waliKelas);
    setNoHpWaliKelas(kelas.noHpWaliKelas || '');
    setTahunAjaran(kelas.tahunAjaran);
    setSemester(kelas.semester);
    setRuangan(kelas.ruangan);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    const kelasData: Kelas = {
      id: editingKelas ? editingKelas.id : `k-${Date.now()}`,
      nama: nama.trim(),
      tingkat,
      jurusan: jurusan.trim(),
      waliKelas: waliKelas.trim() || 'Belum Ditentukan',
      noHpWaliKelas: noHpWaliKelas.trim() || '',
      tahunAjaran,
      semester,
      ruangan: ruangan.trim() || 'Ruang Teori'
    };

    onSaveKelas(kelasData);
    setIsModalOpen(false);
  };

  const filteredKelas = kelasList.filter(
    k => k.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
         k.jurusan.toLowerCase().includes(searchTerm.toLowerCase()) ||
         k.waliKelas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-8">
      
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <School className="w-4 h-4 text-indigo-600" />
            <span>Manajemen Data Kelas</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Total {kelasList.length} rombel aktif pada tahun ajaran 2025/2026
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kelas, jurusan, wali..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Add Kelas Button */}
          <button
            id="add-kelas-btn"
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kelas</span>
          </button>
        </div>
      </div>

      {/* Grid of Kelas Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredKelas.map((k) => {
          const siswaCount = siswaList.filter(s => s.kelasId === k.id).length;
          return (
            <div
              key={k.id}
              className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                      Tingkat {k.tingkat}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5 font-mono">{k.nama}</h3>
                    <p className="text-[11px] font-medium text-slate-600">{k.jurusan}</p>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => openEditModal(k)}
                      title="Edit Kelas"
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Yakin ingin menghapus kelas ${k.nama}?`)) {
                          onDeleteKelas(k.id);
                        }
                      }}
                      title="Hapus Kelas"
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-2.5 space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between gap-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">Wali: <strong className="text-slate-800">{k.waliKelas}</strong></span>
                    </div>
                    {onOpenWhatsApp && (
                      <button
                        type="button"
                        onClick={() => onOpenWhatsApp({
                          target: 'wali_kelas',
                          reportType: 'rekap_wali',
                          kelasId: k.id
                        })}
                        className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition flex items-center gap-0.5 shrink-0"
                        title="Kirim Laporan Rekap ke WhatsApp Wali Kelas"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">WA</span>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="truncate">Ruang: {k.ruangan}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{k.tahunAjaran} ({k.semester})</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Siswa Count & Navigation */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                  <Users className="w-3 h-3 text-blue-600" />
                  <span>{siswaCount} Siswa</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSelectKelas(k.id, 'siswa')}
                    className="text-[10px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition"
                  >
                    Siswa
                  </button>
                  <button
                    onClick={() => onSelectKelas(k.id, 'absen')}
                    className="text-[10px] font-semibold text-white bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded-md transition shadow-2xs"
                  >
                    Presensi
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredKelas.length === 0 && (
        <div className="text-center py-8 bg-white rounded-xl border border-slate-200 p-6">
          <School className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-700">Tidak ada kelas yang sesuai</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Coba ubah kata kunci pencarian Anda atau tambah kelas baru.</p>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT KELAS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-4.5 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <School className="w-4 h-4 text-blue-600" />
                <span>{editingKelas ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kelas *</label>
                <input
                  type="text"
                  required
                  placeholder="contoh: X MIPA 1 atau XII TKJ 2"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat *</label>
                  <select
                    value={tingkat}
                    onChange={(e) => setTingkat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  >
                    <option value="10">Kelas 10 (Fase E)</option>
                    <option value="11">Kelas 11 (Fase F)</option>
                    <option value="12">Kelas 12 (Fase F)</option>
                    <option value="7">Kelas 7 (SMP)</option>
                    <option value="8">Kelas 8 (SMP)</option>
                    <option value="9">Kelas 9 (SMP)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jurusan / Peminatan</label>
                  <input
                    type="text"
                    placeholder="MIPA / IPS / RPL / dll"
                    value={jurusan}
                    onChange={(e) => setJurusan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Wali Kelas</label>
                  <input
                    type="text"
                    placeholder="Nama Guru Wali Kelas"
                    value={waliKelas}
                    onChange={(e) => setWaliKelas(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp Wali Kelas</label>
                  <input
                    type="tel"
                    placeholder="0812xxxxxxxx"
                    value={noHpWaliKelas}
                    onChange={(e) => setNoHpWaliKelas(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ruangan / Lab</label>
                  <input
                    type="text"
                    placeholder="Ruang 101 / Lab Komputer"
                    value={ruangan}
                    onChange={(e) => setRuangan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value as 'Ganjil' | 'Genap')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  >
                    <option value="Ganjil">Semester Ganjil</option>
                    <option value="Genap">Semester Genap</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-200 mt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simpan Kelas</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
