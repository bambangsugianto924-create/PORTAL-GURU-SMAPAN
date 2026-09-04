import React, { useState } from 'react';
import { Siswa, Kelas, NilaiRecord, AbsensiRecord } from '../types';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Download,
  Eye,
  CheckCircle2,
  X,
  Phone,
  User,
  GraduationCap,
  MessageSquare,
  Send
} from 'lucide-react';

interface SiswaViewProps {
  siswaList: Siswa[];
  kelasList: Kelas[];
  nilaiList: NilaiRecord[];
  absensiList: AbsensiRecord[];
  selectedKelasFilter: string;
  setSelectedKelasFilter: (id: string) => void;
  onSaveSiswa: (siswa: Siswa) => void;
  onDeleteSiswa: (siswaId: string) => void;
  onOpenWhatsApp?: (config: any) => void;
}

export const SiswaView: React.FC<SiswaViewProps> = ({
  siswaList,
  kelasList,
  nilaiList,
  absensiList,
  selectedKelasFilter,
  setSelectedKelasFilter,
  onSaveSiswa,
  onDeleteSiswa,
  onOpenWhatsApp
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'L' | 'P'>('ALL');
  
  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [detailSiswa, setDetailSiswa] = useState<Siswa | null>(null);

  // Form State
  const [kelasId, setKelasId] = useState(kelasList[0]?.id || '');
  const [nisn, setNisn] = useState('');
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [noHp, setNoHp] = useState('');
  const [noHpOrtu, setNoHpOrtu] = useState('');
  const [namaWali, setNamaWali] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');

  const openAddModal = () => {
    setEditingSiswa(null);
    setKelasId(selectedKelasFilter !== 'ALL' ? selectedKelasFilter : kelasList[0]?.id || '');
    setNisn(`007${Math.floor(1000000 + Math.random() * 9000000)}`);
    setNama('');
    setJenisKelamin('L');
    setNoHp('');
    setNoHpOrtu('');
    setNamaWali('');
    setStatus('Aktif');
    setIsFormModalOpen(true);
  };

  const openEditModal = (siswa: Siswa) => {
    setEditingSiswa(siswa);
    setKelasId(siswa.kelasId);
    setNisn(siswa.nisn);
    setNama(siswa.nama);
    setJenisKelamin(siswa.jenisKelamin);
    setNoHp(siswa.noHp || '');
    setNoHpOrtu(siswa.noHpOrtu || siswa.noHp || '');
    setNamaWali(siswa.namaWali || '');
    setStatus(siswa.status);
    setIsFormModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !nisn.trim()) return;

    const data: Siswa = {
      id: editingSiswa ? editingSiswa.id : `s-${Date.now()}`,
      kelasId,
      nisn: nisn.trim(),
      nama: nama.trim(),
      jenisKelamin,
      noHp: noHp.trim() || '-',
      noHpOrtu: noHpOrtu.trim() || noHp.trim() || '-',
      namaWali: namaWali.trim() || '-',
      status
    };

    onSaveSiswa(data);
    setIsFormModalOpen(false);
  };

  // Filtered List
  const filteredSiswa = siswaList.filter((s) => {
    const matchesKelas = selectedKelasFilter === 'ALL' || s.kelasId === selectedKelasFilter;
    const matchesGender = genderFilter === 'ALL' || s.jenisKelamin === genderFilter;
    const matchesSearch = s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.nisn.includes(searchTerm);
    return matchesKelas && matchesGender && matchesSearch;
  });

  const exportCSV = () => {
    const headers = ['ID', 'NISN', 'Nama Siswa', 'Kelas', 'L/P', 'No HP', 'Nama Wali', 'Status'];
    const rows = filteredSiswa.map(s => {
      const k = kelasList.find(item => item.id === s.kelasId);
      return [
        s.id,
        s.nisn,
        `"${s.nama}"`,
        k ? k.nama : '-',
        s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        s.noHp || '-',
        `"${s.namaWali || '-'}"`,
        s.status
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Data_Siswa_${selectedKelasFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-8">
      
      {/* Header & Controls */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Direktori Data Siswa</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Menampilkan {filteredSiswa.length} dari total {siswaList.length} peserta didik
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
            <button
              id="add-siswa-btn"
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Siswa</span>
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2.5 border-t border-slate-100">
          
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama atau NISN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Kelas filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedKelasFilter}
              onChange={(e) => setSelectedKelasFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Kelas ({siswaList.length} Siswa)</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama} ({siswaList.filter(s => s.kelasId === k.id).length} Siswa)
                </option>
              ))}
            </select>
          </div>

          {/* Gender filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium shrink-0">Gender:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg w-full border border-slate-200">
              <button
                onClick={() => setGenderFilter('ALL')}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition ${genderFilter === 'ALL' ? 'bg-white shadow-2xs text-slate-800' : 'text-slate-500'}`}
              >
                Semua
              </button>
              <button
                onClick={() => setGenderFilter('L')}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition ${genderFilter === 'L' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-500'}`}
              >
                L
              </button>
              <button
                onClick={() => setGenderFilter('P')}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition ${genderFilter === 'P' ? 'bg-rose-500 text-white shadow-2xs' : 'text-slate-500'}`}
              >
                P
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Table of Students */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3">NISN</th>
                <th className="py-2.5 px-3">Nama Lengkap</th>
                <th className="py-2.5 px-3">Kelas</th>
                <th className="py-2.5 px-3 text-center">L/P</th>
                <th className="py-2.5 px-3">No. HP / Wali</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSiswa.map((siswa, idx) => {
                const kelas = kelasList.find(k => k.id === siswa.kelasId);
                return (
                  <tr key={siswa.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2 px-3 text-center font-medium text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 font-mono font-semibold text-slate-700 text-[11px]">
                      {siswa.nisn}
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-semibold text-slate-900">{siswa.nama}</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200/80">
                        {kelas ? kelas.nama : '-'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-block px-1.5 py-0.2 rounded font-bold text-[10px] ${siswa.jenisKelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                        {siswa.jenisKelamin === 'L' ? 'L' : 'P'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-[11px]">
                      <div className="flex items-center gap-1">
                        <span>{siswa.noHpOrtu || siswa.noHp || '-'}</span>
                        {onOpenWhatsApp && (siswa.noHpOrtu || siswa.noHp) && (
                          <button
                            type="button"
                            onClick={() => onOpenWhatsApp({
                              target: 'ortu',
                              reportType: 'presensi',
                              kelasId: siswa.kelasId,
                              siswaId: siswa.id
                            })}
                            className="p-0.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition"
                            title="Kirim Laporan WhatsApp ke Orang Tua"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">Wali: {siswa.namaWali || '-'}</div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${siswa.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        {siswa.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onOpenWhatsApp && (
                          <button
                            onClick={() => onOpenWhatsApp({
                              target: 'ortu',
                              reportType: 'presensi',
                              kelasId: siswa.kelasId,
                              siswaId: siswa.id
                            })}
                            title="Kirim Laporan WA"
                            className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setDetailSiswa(siswa)}
                          title="Lihat Profil Siswa"
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(siswa)}
                          title="Edit Siswa"
                          className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus data siswa ${siswa.nama}?`)) {
                              onDeleteSiswa(siswa.id);
                            }
                          }}
                          title="Hapus Siswa"
                          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSiswa.length === 0 && (
          <div className="text-center py-8 p-4">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-700">Tidak ada siswa yang ditemukan</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Coba sesuaikan filter kelas atau kata kunci pencarian Anda.</p>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT SISWA */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-4.5 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>{editingSiswa ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</span>
              </h3>
              <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Kelas *</label>
                <select
                  value={kelasId}
                  onChange={(e) => setKelasId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                >
                  {kelasList.map(k => (
                    <option key={k.id} value={k.id}>{k.nama} ({k.jurusan})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NISN *</label>
                  <input
                    type="text"
                    required
                    placeholder="007xxxxxxx"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin *</label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value as 'L' | 'P')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Siswa"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. WA Orang Tua / Wali *</label>
                  <input
                    type="tel"
                    placeholder="0812xxxxxxxx"
                    value={noHpOrtu}
                    onChange={(e) => setNoHpOrtu(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    placeholder="Nama Orang Tua/Wali"
                    value={namaWali}
                    onChange={(e) => setNamaWali(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. HP / WA Siswa (Opsional)</label>
                <input
                  type="tel"
                  placeholder="0813xxxxxxxx"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Keaktifan</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Aktif' | 'Nonaktif')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif / Pindah</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-200 mt-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simpan Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL SISWA */}
      {detailSiswa && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-4.5 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  {detailSiswa.nama.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{detailSiswa.nama}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">NISN: {detailSiswa.nisn}</p>
                </div>
              </div>
              <button onClick={() => setDetailSiswa(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Student metadata */}
            {(() => {
              const kelas = kelasList.find(k => k.id === detailSiswa.kelasId);
              const nilai = nilaiList.find(n => n.siswaId === detailSiswa.id);
              const absensi = absensiList.filter(a => a.siswaId === detailSiswa.id);
              const hadirCount = absensi.filter(a => a.status === 'H').length;

              return (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Kelas:</span>
                      <strong className="text-slate-800 text-xs">{kelas ? kelas.nama : '-'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Jenis Kelamin:</span>
                      <strong className="text-slate-800 text-xs">{detailSiswa.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Orang Tua / Wali:</span>
                      <strong className="text-slate-800 text-xs">{detailSiswa.namaWali || '-'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">No. WhatsApp:</span>
                      <strong className="text-slate-800 text-xs">{detailSiswa.noHp || '-'}</strong>
                    </div>
                  </div>

                  {/* Academic record summary */}
                  <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100">
                    <h4 className="font-bold text-blue-900 mb-1.5 flex items-center gap-1 text-xs">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                      <span>Rekap Akademik & Kehadiran</span>
                    </h4>

                    <div className="grid grid-cols-3 gap-2 text-center mt-1.5">
                      <div className="p-1.5 bg-white rounded-md border border-blue-200">
                        <span className="text-[9px] text-slate-500 block">Nilai Akhir</span>
                        <span className="text-sm font-extrabold text-blue-700 font-mono">
                          {nilai ? nilai.nilaiAkhir : '-'}
                        </span>
                      </div>
                      <div className="p-1.5 bg-white rounded-md border border-blue-200">
                        <span className="text-[9px] text-slate-500 block">Predikat</span>
                        <span className="text-sm font-extrabold text-purple-700 font-mono">
                          {nilai ? nilai.predikat : '-'}
                        </span>
                      </div>
                      <div className="p-1.5 bg-white rounded-md border border-blue-200">
                        <span className="text-[9px] text-slate-500 block">Total Hadir</span>
                        <span className="text-sm font-extrabold text-emerald-700 font-mono">
                          {hadirCount}x
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => setDetailSiswa(null)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
};
