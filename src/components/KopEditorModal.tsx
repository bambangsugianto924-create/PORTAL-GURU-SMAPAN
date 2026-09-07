import React, { useState, useRef } from 'react';
import { KopSuratConfig, LogoTypeOption } from '../types';
import { KopSuratHeader } from './KopSuratHeader';
import {
  School,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ShieldCheck,
  User,
  ArrowLeftRight,
  Trash2,
  Shield,
  BookOpen,
  GraduationCap,
  Award,
  Landmark,
  Eye,
  EyeOff,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface KopEditorModalProps {
  config: KopSuratConfig;
  kkm?: number;
  onSave: (newConfig: KopSuratConfig, newKKM?: number) => void;
  onClose: () => void;
}

export const KopEditorModal: React.FC<KopEditorModalProps> = ({
  config,
  kkm = 75,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<KopSuratConfig>({
    ...config,
    tampilkanLogoKiri: config.tampilkanLogoKiri ?? config.tampilkanLogo ?? true,
    tampilkanLogoKanan: config.tampilkanLogoKanan ?? true,
    logoKananType: config.logoKananType ?? 'sekolah',
    logoKananUrl: config.logoKananUrl ?? '',
    ukuranLogo: config.ukuranLogo ?? 'standar'
  });
  const [kkmValue, setKkmValue] = useState<number>(kkm);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeLogoTab, setActiveLogoTab] = useState<'both' | 'kiri' | 'kanan'>('both');

  const fileInputKiriRef = useRef<HTMLInputElement>(null);
  const fileInputKananRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof KopSuratConfig, value: any) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      // Keep legacy tampilkanLogo in sync with tampilkanLogoKiri
      if (field === 'tampilkanLogoKiri') {
        next.tampilkanLogo = value;
      }
      return next;
    });
  };

  const handleFileUpload = (position: 'kiri' | 'kanan', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file logo maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const resultStr = event.target.result as string;
          if (position === 'kiri') {
            setFormData(prev => ({
              ...prev,
              logoType: 'custom',
              logoUrl: resultStr,
              tampilkanLogo: true,
              tampilkanLogoKiri: true
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              logoKananType: 'custom',
              logoKananUrl: resultStr,
              tampilkanLogoKanan: true
            }));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSwapLogos = () => {
    setFormData(prev => ({
      ...prev,
      // Current right becomes left
      logoUrl: prev.logoKananUrl || '',
      logoType: prev.logoKananType || 'sekolah',
      tampilkanLogo: prev.tampilkanLogoKanan ?? true,
      tampilkanLogoKiri: prev.tampilkanLogoKanan ?? true,
      // Current left becomes right
      logoKananUrl: prev.logoUrl || '',
      logoKananType: prev.logoType || 'tutwuri',
      tampilkanLogoKanan: prev.tampilkanLogoKiri ?? prev.tampilkanLogo ?? true
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, kkmValue);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="font-bold text-sm">Pengaturan Kop Surat & Logo Sekolah</h3>
              <p className="text-[10px] text-emerald-200">Kop ini otomatis diterapkan pada seluruh cetakan PDF dan berkas rekap</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-emerald-200 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Live Preview Box */}
          <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                <Sliders className="w-3 h-3" />
                <span>Pratinjau Langsung (Live Preview) Kop Surat</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Format Resmi A4</span>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-lg border border-slate-200 shadow-2xs">
              <KopSuratHeader config={formData} isCompact={false} />
            </div>
          </div>

          {/* Form Editor */}
          <form id="kop-editor-form" onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            
            {/* Section 1: Instansi & Sekolah */}
            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 space-y-2.5">
              <h4 className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <School className="w-3.5 h-3.5 text-emerald-600" />
                <span>1. Identitas Instansi & Sekolah</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Pemerintah Daerah / Yayasan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pemerintah}
                    onChange={(e) => handleInputChange('pemerintah', e.target.value)}
                    placeholder="PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Dinas / Lembaga Pendidikan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dinas}
                    onChange={(e) => handleInputChange('dinas', e.target.value)}
                    placeholder="DINAS PENDIDIKAN DAN KEBUDAYAAN"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Nama Resmi Sekolah / Madrasah *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.namaSekolah}
                    onChange={(e) => handleInputChange('namaSekolah', e.target.value)}
                    placeholder="SMAN 1 TELADAN NUSANTARA"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    NPSN & Akreditasi
                  </label>
                  <input
                    type="text"
                    value={formData.akreditasi}
                    onChange={(e) => handleInputChange('akreditasi', e.target.value)}
                    placeholder="Akreditasi A (Unggul)"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Alamat & Kontak */}
            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 space-y-2.5">
              <h4 className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. Alamat & Kontak Resmi</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Alamat Jalan & Nomor *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.alamat}
                    onChange={(e) => handleInputChange('alamat', e.target.value)}
                    placeholder="Jl. Pendidikan Nasional No. 45, Kebayoran Baru"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Kota / Kabupaten *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kota}
                    onChange={(e) => handleInputChange('kota', e.target.value)}
                    placeholder="Jakarta Selatan"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Provinsi</label>
                  <input
                    type="text"
                    value={formData.provinsi}
                    onChange={(e) => handleInputChange('provinsi', e.target.value)}
                    placeholder="DKI Jakarta"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Kode Pos</label>
                  <input
                    type="text"
                    value={formData.kodePos}
                    onChange={(e) => handleInputChange('kodePos', e.target.value)}
                    placeholder="12140"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">No. Telepon</label>
                  <input
                    type="text"
                    value={formData.telepon}
                    onChange={(e) => handleInputChange('telepon', e.target.value)}
                    placeholder="(021) 7890123"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Email Resmi</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="info@sman1teladan.sch.id"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Logo & Tampilan Kop (Kiri dan Kanan) */}
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200/80">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>3. Pengaturan Logo Kop Surat (Kiri & Kanan)</span>
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Sesuaikan logo instansi/dinas di kiri dan logo sekolah di kanan sesuai format resmi
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSwapLogos}
                    title="Tukar posisi logo kiri dan kanan"
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs transition"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    <span>Tukar Kiri ⇄ Kanan</span>
                  </button>

                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[10px]">
                    <span className="px-1.5 text-slate-500 font-semibold">Ukuran:</span>
                    <button
                      type="button"
                      onClick={() => handleInputChange('ukuranLogo', 'kecil')}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition ${
                        formData.ukuranLogo === 'kecil'
                          ? 'bg-emerald-700 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Kecil
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('ukuranLogo', 'standar')}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition ${
                        formData.ukuranLogo === 'standar' || !formData.ukuranLogo
                          ? 'bg-emerald-700 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Standar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('ukuranLogo', 'besar')}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition ${
                        formData.ukuranLogo === 'besar'
                          ? 'bg-emerald-700 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Besar
                    </button>
                  </div>
                </div>
              </div>

              {/* Mode Tampilan Tab Logo */}
              <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveLogoTab('both')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${
                    activeLogoTab === 'both'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Kiri & Kanan (Bilateral)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLogoTab('kiri')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${
                    activeLogoTab === 'kiri'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Fokus Logo Kiri
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLogoTab('kanan')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${
                    activeLogoTab === 'kanan'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Fokus Logo Kanan
                </button>
              </div>

              {/* Dual Logo Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                {/* KARTU LOGO KIRI */}
                {(activeLogoTab === 'both' || activeLogoTab === 'kiri') && (
                  <div className={`p-3 rounded-xl border transition ${
                    formData.tampilkanLogoKiri
                      ? 'bg-white border-blue-200 shadow-2xs'
                      : 'bg-slate-100/70 border-slate-200 opacity-80'
                  }`}>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[9px] font-extrabold uppercase">
                          Sisi Kiri Kop
                        </span>
                        <h5 className="font-bold text-xs text-slate-800">Logo Instansi / Pemda / Nasional</h5>
                      </div>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.tampilkanLogoKiri}
                          onChange={(e) => {
                            handleInputChange('tampilkanLogoKiri', e.target.checked);
                            handleInputChange('tampilkanLogo', e.target.checked);
                          }}
                          className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-[10px] font-semibold text-slate-700">
                          {formData.tampilkanLogoKiri ? 'Aktif' : 'Mati'}
                        </span>
                      </label>
                    </div>

                    {/* Presets Kiri */}
                    <div className="space-y-2">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        Pilih Lambang Logo Kiri:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleInputChange('logoType', 'tutwuri')}
                          className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition ${
                            formData.logoType === 'tutwuri'
                              ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-500'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <School className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
                          <span className="text-[10px] truncate">Tut Wuri Handayani</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInputChange('logoType', 'pemda')}
                          className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition ${
                            formData.logoType === 'pemda'
                              ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-500'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Shield className="w-3.5 h-3.5 text-slate-700 flex-shrink-0" />
                          <span className="text-[10px] truncate">Pemda / Provinsi</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInputChange('logoType', 'kemenag')}
                          className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition ${
                            formData.logoType === 'kemenag'
                              ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-500'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Landmark className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                          <span className="text-[10px] truncate">Kemenag / Madrasah</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInputChange('logoType', 'garuda')}
                          className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition ${
                            formData.logoType === 'garuda'
                              ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-500'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <span className="text-[10px] truncate">Garuda Pancasila</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInputChange('logoType', 'sekolah')}
                          className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition ${
                            formData.logoType === 'sekolah'
                              ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-500'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <BookOpen className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
                          <span className="text-[10px] truncate">Lambang Sekolah</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInputChange('logoType', 'custom')}
                          className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition ${
                            formData.logoType === 'custom'
                              ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold ring-1 ring-purple-500'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                          <span className="text-[10px] truncate">Unggah Gambar Sendiri</span>
                        </button>
                      </div>

                      {/* Custom Upload Kiri */}
                      {formData.logoType === 'custom' && (
                        <div className="p-2.5 bg-purple-50/50 rounded-lg border border-purple-200 space-y-2 mt-2">
                          <input
                            type="file"
                            ref={fileInputKiriRef}
                            accept="image/*"
                            onChange={(e) => handleFileUpload('kiri', e)}
                            className="hidden"
                          />
                          
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputKiriRef.current?.click()}
                              className="py-1.5 px-2.5 bg-white hover:bg-purple-100 text-purple-700 font-bold rounded-lg border border-purple-300 text-[10px] flex items-center gap-1 transition shadow-2xs"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Pilih File Gambar (Maks 2MB)</span>
                            </button>

                            {formData.logoUrl && (
                              <button
                                type="button"
                                onClick={() => handleInputChange('logoUrl', '')}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded border border-rose-200 transition"
                                title="Hapus gambar logo kiri"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {formData.logoUrl && (
                            <div className="flex items-center gap-2 p-1.5 bg-white rounded border border-purple-200">
                              <img
                                src={formData.logoUrl}
                                alt="Pratinjau Kiri"
                                className="w-9 h-9 object-contain border border-slate-200 rounded p-0.5 bg-slate-50"
                                referrerPolicy="no-referrer"
                              />
                              <div className="text-[10px] overflow-hidden">
                                <p className="font-bold text-emerald-700 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Logo Kiri Siap Dipakai</span>
                                </p>
                                <p className="text-[9px] text-slate-500 truncate">Format Base64 / URL tersimpan</p>
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block text-[8.5px] font-bold text-slate-500 uppercase">
                              Atau Tempel URL Gambar Kiri:
                            </label>
                            <input
                              type="url"
                              value={formData.logoUrl}
                              onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                              placeholder="https://contoh.sch.id/logo-pemda.png"
                              className="w-full bg-white border border-slate-200 rounded p-1 text-[10px] focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* KARTU LOGO KANAN */}
                {(activeLogoTab === 'both' || activeLogoTab === 'kanan') && (
                  <div className={`p-3 rounded-xl border transition ${
                    formData.tampilkanLogoKanan
                      ? 'bg-white border-emerald-200 shadow-2xs'
                      : 'bg-slate-100/70 border-slate-200 opacity-80'
                  }`}>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase">
                          Sisi Kanan Kop
                        </span>
                        <h5 className="font-bold text-xs text-slate-800">Logo Sekolah / Kejuruan / Kustom</h5>
                      </div>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.tampilkanLogoKanan}
                          onChange={(e) => handleInputChange('tampilkanLogoKanan', e.target.checked)}
                          className="w-3.5 h-3.5 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-[10px] font-semibold text-slate-700">
                          {formData.tampilkanLogoKanan ? 'Aktif' : 'Mati'}
                        </span>
                      </label>
                    </div>

                    {/* Presets Kanan */}
                    <div className="space-y-2">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        Pilih Lambang Logo Kanan:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleInputChange('logoKananType', 'sekolah')}
                          className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition ${
                            formData.logoKananType === 'sekolah'
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <BookOpen className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
                          <span className="text-[10px] truncate">Lambang Sekolah</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInputChange('logoKananType', 'vokasi')}
                          className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition ${
                            formData.logoKananType === 'vokasi'
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <GraduationCap className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
                          <span className="text-[10px] truncate">SMK / Kejuruan</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInputChange('logoKananType', 'tutwuri')}
                          className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition ${
                            formData.logoKananType === 'tutwuri'
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <School className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
                          <span className="text-[10px] truncate">Tut Wuri Handayani</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInputChange('logoKananType', 'kemenag')}
                          className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition ${
                            formData.logoKananType === 'kemenag'
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Landmark className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                          <span className="text-[10px] truncate">Kemenag / Madrasah</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInputChange('logoKananType', 'garuda')}
                          className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition ${
                            formData.logoKananType === 'garuda'
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <span className="text-[10px] truncate">Garuda Pancasila</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInputChange('logoKananType', 'custom')}
                          className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition ${
                            formData.logoKananType === 'custom'
                              ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold ring-1 ring-purple-500'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                          <span className="text-[10px] truncate">Unggah Gambar Sekolah</span>
                        </button>
                      </div>

                      {/* Custom Upload Kanan */}
                      {formData.logoKananType === 'custom' && (
                        <div className="p-2.5 bg-purple-50/50 rounded-lg border border-purple-200 space-y-2 mt-2">
                          <input
                            type="file"
                            ref={fileInputKananRef}
                            accept="image/*"
                            onChange={(e) => handleFileUpload('kanan', e)}
                            className="hidden"
                          />
                          
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputKananRef.current?.click()}
                              className="py-1.5 px-2.5 bg-white hover:bg-purple-100 text-purple-700 font-bold rounded-lg border border-purple-300 text-[10px] flex items-center gap-1 transition shadow-2xs"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Pilih File Gambar (Maks 2MB)</span>
                            </button>

                            {formData.logoKananUrl && (
                              <button
                                type="button"
                                onClick={() => handleInputChange('logoKananUrl', '')}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded border border-rose-200 transition"
                                title="Hapus gambar logo kanan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {formData.logoKananUrl && (
                            <div className="flex items-center gap-2 p-1.5 bg-white rounded border border-purple-200">
                              <img
                                src={formData.logoKananUrl}
                                alt="Pratinjau Kanan"
                                className="w-9 h-9 object-contain border border-slate-200 rounded p-0.5 bg-slate-50"
                                referrerPolicy="no-referrer"
                              />
                              <div className="text-[10px] overflow-hidden">
                                <p className="font-bold text-emerald-700 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Logo Kanan Siap Dipakai</span>
                                </p>
                                <p className="text-[9px] text-slate-500 truncate">Format Base64 / URL tersimpan</p>
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block text-[8.5px] font-bold text-slate-500 uppercase">
                              Atau Tempel URL Gambar Kanan:
                            </label>
                            <input
                              type="url"
                              value={formData.logoKananUrl || ''}
                              onChange={(e) => handleInputChange('logoKananUrl', e.target.value)}
                              placeholder="https://contoh.sch.id/logo-sekolah.png"
                              className="w-full bg-white border border-slate-200 rounded p-1 text-[10px] focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Tampilan Garis Ganda Pemisah */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.tampilkanGarisGanda}
                    onChange={(e) => handleInputChange('tampilkanGarisGanda', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span>Tampilkan Garis Ganda Pemisah Resmi (Standar Dokumen Kedinasan)</span>
                </label>
              </div>
            </div>

            {/* Section: Tahun Pelajaran & Semester Aktif Sekolah */}
            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/90 space-y-2.5">
              <h4 className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span>4. Periode Akademik Sekolah (Tahun Pelajaran & Semester)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Tahun Pelajaran / Ajaran *
                  </label>
                  <input
                    type="text"
                    value={formData.tahunAjaran || '2025/2026'}
                    onChange={(e) => handleInputChange('tahunAjaran', e.target.value)}
                    placeholder="Contoh: 2025/2026"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <p className="text-[9px] text-slate-500 mt-1">Dicantumkan pada kop surat dan rekap laporan.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Semester Berjalan *
                  </label>
                  <select
                    value={formData.semester || 'Genap'}
                    onChange={(e) => handleInputChange('semester', e.target.value as 'Ganjil' | 'Genap')}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Ganjil">Semester Ganjil (Gasal / 1)</option>
                    <option value="Genap">Semester Genap (Genap / 2)</option>
                  </select>
                  <p className="text-[9px] text-slate-500 mt-1">Periode aktif penilaian semester.</p>
                </div>
              </div>
            </div>

            {/* Section 5: Penandatangan Kepala Sekolah */}
            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 space-y-2.5">
              <h4 className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>5. Identitas Kepala Sekolah (Tanda Tangan Dokumen)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Nama Kepala Sekolah & Gelar *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.namaKepalaSekolah}
                    onChange={(e) => handleInputChange('namaKepalaSekolah', e.target.value)}
                    placeholder="Dr. H. Sulaiman, M.Pd."
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    NIP Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    value={formData.nipKepalaSekolah}
                    onChange={(e) => handleInputChange('nipKepalaSekolah', e.target.value)}
                    placeholder="19700512 199512 1 002"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 6: Standar KKM / KKTP Sekolah */}
            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 space-y-2.5">
              <h4 className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-emerald-700" />
                <span>6. Standar Kriteria Ketuntasan Minimal (KKM / KKTP)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Nilai Standar KKM Kelulusan *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={kkmValue}
                      onChange={(e) => setKkmValue(Number(e.target.value))}
                      className="w-20 bg-white border border-emerald-300 rounded-lg p-2 text-sm font-bold text-emerald-900 text-center font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-2xs"
                    />
                    <div className="flex items-center gap-1">
                      {[65, 70, 75, 78, 80].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setKkmValue(val)}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${
                            kkmValue === val
                              ? 'bg-emerald-700 text-white shadow-2xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-lg border border-emerald-100 leading-relaxed">
                  Standar KKM ini akan disimpan secara global dan langsung diperbarui pada Leger Nilai, batas tuntas/remedial, rekap laporan, serta notifikasi WhatsApp ke orang tua siswa.
                </div>
              </div>
            </div>

          </form>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Kembalikan setelan Kop Surat ke format standar?')) {
                setFormData({
                  pemerintah: 'PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA',
                  dinas: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
                  namaSekolah: 'SMAN 1 TELADAN NUSANTARA',
                  alamat: 'Jl. Pendidikan Nasional No. 45, Kebayoran Baru',
                  kota: 'Jakarta Selatan',
                  provinsi: 'DKI Jakarta',
                  kodePos: '12140',
                  telepon: '(021) 7890123',
                  email: 'info@sman1teladan.sch.id',
                  website: 'https://sman1teladan.sch.id',
                  akreditasi: 'Akreditasi A (Unggul)',
                  npsn: '20104050',
                  logoUrl: '',
                  logoType: 'tutwuri',
                  tampilkanLogo: true,
                  tampilkanLogoKiri: true,
                  logoKananUrl: '',
                  logoKananType: 'sekolah',
                  tampilkanLogoKanan: true,
                  ukuranLogo: 'standar',
                  namaKepalaSekolah: 'Dr. H. Sulaiman, M.Pd.',
                  nipKepalaSekolah: '19700512 199512 1 002',
                  tampilkanGarisGanda: true
                });
              }
            }}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Bawaan</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              form="kop-editor-form"
              className="py-1.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan Kop</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
