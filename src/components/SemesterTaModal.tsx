import React, { useState } from 'react';
import { PeriodeAjaran, Kelas } from '../types';
import {
  Calendar,
  CheckCircle2,
  X,
  Layers,
  Sparkles,
  Clock,
  ArrowRight,
  School,
  Info,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SemesterTaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPeriode: PeriodeAjaran;
  kelasList: Kelas[];
  onSavePeriode: (newPeriode: PeriodeAjaran, updateAllKelas: boolean) => void;
}

const TAHUN_AJARAN_PRESETS = [
  '2023/2024',
  '2024/2025',
  '2025/2026',
  '2026/2027',
  '2027/2028'
];

export const SemesterTaModal: React.FC<SemesterTaModalProps> = ({
  isOpen,
  onClose,
  currentPeriode,
  kelasList,
  onSavePeriode
}) => {
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>(currentPeriode.semester || 'Genap');
  const [tahunAjaran, setTahunAjaran] = useState(currentPeriode.tahunAjaran || '2025/2026');
  const [updateAllKelas, setUpdateAllKelas] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tahunAjaran.trim()) return;

    onSavePeriode(
      {
        semester,
        tahunAjaran: tahunAjaran.trim()
      },
      updateAllKelas
    );

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-4 sm:p-5 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>Pengaturan Semester & Tahun Ajaran</span>
              </h3>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Sesuaikan kalender akademik aktif untuk presensi, rekap nilai, cetak, dan WhatsApp
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Periode ajaran berhasil diperbarui dan diterapkan!</span>
            </div>
          )}

          {/* 1. Pemilihan Semester */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Pilih Semester Aktif:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Semester Ganjil Card */}
              <button
                type="button"
                onClick={() => setSemester('Ganjil')}
                className={`p-3.5 rounded-xl border text-left transition relative cursor-pointer ${
                  semester === 'Ganjil'
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {semester === 'Ganjil' && (
                  <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 mb-1.5">
                  Semester 1 (Gasal)
                </span>
                <h4 className="text-sm font-bold text-slate-900">Semester Ganjil</h4>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Juli s.d. Desember</span>
                </p>
                <div className="mt-2 text-[10px] text-slate-600 bg-white/80 p-1.5 rounded border border-slate-200">
                  Target: PTS 1, PAS 1 / SAS Ganjil
                </div>
              </button>

              {/* Semester Genap Card */}
              <button
                type="button"
                onClick={() => setSemester('Genap')}
                className={`p-3.5 rounded-xl border text-left transition relative cursor-pointer ${
                  semester === 'Genap'
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {semester === 'Genap' && (
                  <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-1.5">
                  Semester 2 (Genap)
                </span>
                <h4 className="text-sm font-bold text-slate-900">Semester Genap</h4>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Januari s.d. Juni</span>
                </p>
                <div className="mt-2 text-[10px] text-slate-600 bg-white/80 p-1.5 rounded border border-slate-200">
                  Target: PTS 2, PAT / SAS Genap & Kenaikan
                </div>
              </button>
            </div>
          </div>

          {/* 2. Tahun Ajaran */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Tahun Pelajaran / Tahun Ajaran:
            </label>
            
            {/* Direct Input */}
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Contoh: 2025/2026 atau 2026/2027"
                value={tahunAjaran}
                onChange={(e) => setTahunAjaran(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Quick Preset Chips */}
            <div>
              <span className="text-[11px] text-slate-500 font-medium block mb-1.5">Pilihan Cepat:</span>
              <div className="flex flex-wrap gap-1.5">
                {TAHUN_AJARAN_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTahunAjaran(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      tahunAjaran === preset
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Opsi Sinkronisasi ke Seluruh Kelas */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={updateAllKelas}
                onChange={(e) => setUpdateAllKelas(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Terapkan ke Seluruh Data Kelas ({kelasList.length} kelas aktif)
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5 leading-relaxed">
                  Secara otomatis menyinkronkan semester dan tahun ajaran semua kelas Anda agar langsung seragam tanpa perlu mengedit satu per satu.
                </span>
              </div>
            </label>
          </div>

          {/* Live Preview Indicator */}
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                  Akan tercatat di dokumen resmi:
                </span>
                <span className="font-bold text-slate-900">
                  Semester {semester} • Tahun Pelajaran {tahunAjaran || '...'}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900 text-[10px] font-bold">
              Siap Aktif
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-300 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Terapkan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
