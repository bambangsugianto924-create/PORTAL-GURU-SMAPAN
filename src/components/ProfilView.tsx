import React, { useState } from 'react';
import { Guru, KopSuratConfig } from '../types';
import { StorageService } from '../services/storageService';
import { KopSuratHeader } from './KopSuratHeader';
import {
  UserCircle,
  Save,
  CheckCircle2,
  School,
  Lock,
  RefreshCw,
  Database,
  Download,
  Settings2,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProfilViewProps {
  currentUser: Guru;
  kopSuratConfig: KopSuratConfig;
  onUpdateGuru: (guru: Guru) => void;
  onOpenKopEditor: () => void;
  onResetAllData: () => void;
}

export const ProfilView: React.FC<ProfilViewProps> = ({
  currentUser,
  kopSuratConfig,
  onUpdateGuru,
  onOpenKopEditor,
  onResetAllData
}) => {
  const [nama, setNama] = useState(currentUser.nama);
  const [email, setEmail] = useState(currentUser.email);
  const [nip, setNip] = useState(currentUser.nip);
  const [mapel, setMapel] = useState(currentUser.mapel);
  const [sekolah, setSekolah] = useState(currentUser.sekolah);
  const [noHp, setNoHp] = useState(currentUser.noHp);
  const [password, setPassword] = useState(currentUser.password || 'password123');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !email.trim()) return;

    const updated: Guru = {
      ...currentUser,
      nama: nama.trim(),
      email: email.trim(),
      nip: nip.trim(),
      mapel: mapel.trim(),
      sekolah: sekolah.trim(),
      noHp: noHp.trim(),
      password: password.trim()
    };

    onUpdateGuru(updated);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_Portal_Guru_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  return (
    <div className="space-y-4 pb-8 max-w-4xl">
      
      {/* Header */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCircle className="w-4 h-4 text-emerald-700" />
            <span>Profil Guru & Setelan Sekolah</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Perbarui identitas guru, setelan Kop Surat & logo sekolah, serta pencadangan database
          </p>
        </div>

        <button
          onClick={onOpenKopEditor}
          className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-300 transition flex items-center gap-1.5"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Edit Kop & Logo Sekolah</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Profil guru berhasil diperbarui!</span>
        </div>
      )}

      {/* Kop Surat Live Preview Summary */}
      <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-xs text-slate-900">Format Kop Surat & Logo Terpasang</h3>
          </div>
          <button
            onClick={onOpenKopEditor}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Ubah Detail Kop</span>
            <Sliders className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-slate-50/70 p-3 sm:p-4 rounded-xl border border-slate-200">
          <KopSuratHeader config={kopSuratConfig} isCompact={true} />
        </div>
      </div>

      {/* Main Profile Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white font-bold text-base flex items-center justify-center shadow-2xs">
              {nama.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900">{nama}</h3>
              <p className="text-[11px] text-slate-500">{mapel} • {kopSuratConfig.namaSekolah || sekolah}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Nama Lengkap & Gelar *</label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">NIP / NUPTK</label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Email Guru *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Kata Sandi (Password)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Mata Pelajaran Diampu</label>
              <input
                type="text"
                required
                value={mapel}
                onChange={(e) => setMapel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Nama Instansi / Sekolah</label>
              <input
                type="text"
                required
                value={sekolah}
                onChange={(e) => setSekolah(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Nomor WhatsApp / Kontak</label>
            <input
              type="tel"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none font-mono"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg shadow-2xs transition flex items-center gap-1.5 text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Profil</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backup & Reset Utilities */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-slate-700" />
          <span>Pencadangan Data & Reset</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div>
            <h4 className="font-bold text-xs text-slate-800">Cadangkan Seluruh Data (JSON Backup)</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Unduh data guru, kelas, siswa, absensi, nilai, jurnal, dan kop surat ke format JSON.</p>
          </div>
          <button
            onClick={handleExportBackup}
            className="w-full sm:w-auto py-1.5 px-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Cadangan</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-rose-50/60 rounded-lg border border-rose-100">
          <div>
            <h4 className="font-bold text-xs text-rose-900">Muat Ulang Data Contoh Awal (Reset Database)</h4>
            <p className="text-[10px] text-rose-700 mt-0.5">Kembalikan data kelas, siswa, absensi, dan nilai ke setelan default awal.</p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin mengatur ulang data ke data sampel bawaan?')) {
                onResetAllData();
              }
            }}
            className="w-full sm:w-auto py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

    </div>
  );
};
