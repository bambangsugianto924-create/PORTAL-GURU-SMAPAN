import React, { useState } from 'react';
import { Guru } from '../types';
import { StorageService } from '../services/storageService';
import { 
  GraduationCap, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  BookOpen, 
  School, 
  Phone, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoginRegisterProps {
  onLoginSuccess: (guru: Guru) => void;
}

export const LoginRegister: React.FC<LoginRegisterProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('bambang@sekolah.sch.id');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register form state
  const [regNama, setRegNama] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regNip, setRegNip] = useState('');
  const [regMapel, setRegMapel] = useState('');
  const [regSekolah, setRegSekolah] = useState('SMAN 1 Teladan Nusantara');
  const [regNoHp, setRegNoHp] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Harap isi email dan kata sandi Anda.');
      return;
    }

    const guruList = StorageService.getGuruList();
    const found = guruList.find(
      g => g.email.toLowerCase() === loginEmail.trim().toLowerCase()
    );

    if (found) {
      if (found.password && found.password !== loginPassword) {
        setErrorMsg('Kata sandi yang Anda masukkan salah.');
        return;
      }
      StorageService.setCurrentUser(found);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      onLoginSuccess(found);
    } else {
      setErrorMsg('Akun guru dengan email tersebut belum terdaftar. Silakan daftar akun baru atau gunakan akun demo.');
    }
  };

  const handleDemoLogin = (email: string) => {
    const guruList = StorageService.getGuruList();
    const found = guruList.find(g => g.email === email) || guruList[0];
    if (found) {
      StorageService.setCurrentUser(found);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      onLoginSuccess(found);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regNama.trim() || !regEmail.trim() || !regPassword.trim() || !regMapel.trim()) {
      setErrorMsg('Harap lengkapi semua field bertanda bintang (*).');
      return;
    }

    const guruList = StorageService.getGuruList();
    const existing = guruList.find(g => g.email.toLowerCase() === regEmail.trim().toLowerCase());
    if (existing) {
      setErrorMsg('Email ini sudah terdaftar. Silakan langsung masuk.');
      return;
    }

    const newGuru: Guru = {
      id: `guru-${Date.now()}`,
      nama: regNama.trim(),
      email: regEmail.trim(),
      password: regPassword.trim(),
      nip: regNip.trim() || '-',
      mapel: regMapel.trim(),
      sekolah: regSekolah.trim() || 'SMA / SMK Negeri',
      noHp: regNoHp.trim() || '-',
    };

    StorageService.saveGuru(newGuru);
    StorageService.setCurrentUser(newGuru);
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
    setSuccessMsg('Pendaftaran akun guru berhasil! Mengalihkan ke dashboard...');
    setTimeout(() => {
      onLoginSuccess(newGuru);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-3 sm:p-4 text-slate-100">
      <div className="w-full max-w-sm">
        
        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 shadow-md text-white mb-2.5 ring-2 ring-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Portal Guru Digital
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Sistem Manajemen Kelas, Siswa, Absen, Nilai & Jurnal
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 sm:p-5 shadow-xl">
          
          {/* Tab Switcher */}
          <div className="flex bg-slate-900/80 p-0.5 rounded-lg border border-slate-700/60 mb-4">
            <button
              id="tab-login-btn"
              type="button"
              onClick={() => { setIsRegister(false); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                !isRegister
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Masuk Guru
            </button>
            <button
              id="tab-register-btn"
              type="button"
              onClick={() => { setIsRegister(true); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                isRegister
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Daftar Akun
            </button>
          </div>

          {/* Feedback message */}
          {errorMsg && (
            <div className="mb-3 p-2.5 bg-rose-500/15 border border-rose-500/40 rounded-lg text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-3 p-2.5 bg-emerald-500/15 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {!isRegister ? (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  Email Akun Guru
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="contoh: bambang@sekolah.sch.id"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                    Kata Sandi
                  </label>
                  <span className="text-[10px] text-blue-400 cursor-pointer hover:underline" onClick={() => setLoginPassword('password123')}>
                    Default: password123
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password-input"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <button
                id="submit-login-btn"
                type="submit"
                className="w-full mt-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-3 rounded-lg shadow-2xs transition duration-150 flex items-center justify-center gap-1.5 text-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                Masuk ke Dashboard Guru
              </button>

              {/* Quick Demo Login Pill Buttons */}
              <div className="pt-3 border-t border-slate-700/60">
                <p className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Akun Demo (1-Klik Masuk):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('bambang@sekolah.sch.id')}
                    className="text-left p-2 rounded-lg bg-slate-900/80 hover:bg-blue-900/40 border border-slate-700 hover:border-blue-500/50 transition group"
                  >
                    <p className="text-[11px] font-semibold text-slate-200 group-hover:text-blue-300">Pak Bambang, M.Pd.</p>
                    <p className="text-[9px] text-slate-400">Guru Informatika</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('siti@sekolah.sch.id')}
                    className="text-left p-2 rounded-lg bg-slate-900/80 hover:bg-blue-900/40 border border-slate-700 hover:border-blue-500/50 transition group"
                  >
                    <p className="text-[11px] font-semibold text-slate-200 group-hover:text-blue-300">Bu Siti, S.Pd.</p>
                    <p className="text-[9px] text-slate-400">Guru Bhs Indonesia</p>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-2.5 max-h-[65vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  Nama Lengkap & Gelar *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-nama-input"
                    type="text"
                    required
                    value={regNama}
                    onChange={(e) => setRegNama(e.target.value)}
                    placeholder="Drs. Ahmad Dahlan, M.Pd."
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                    Email Guru *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-email-input"
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="guru@sekolah.sch.id"
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                    Kata Sandi *
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-pass-input"
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 char"
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                    Mata Pelajaran *
                  </label>
                  <div className="relative">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-mapel-input"
                      type="text"
                      required
                      value={regMapel}
                      onChange={(e) => setRegMapel(e.target.value)}
                      placeholder="Matematika / IPA"
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                    NIP / NUPTK
                  </label>
                  <input
                    id="reg-nip-input"
                    type="text"
                    value={regNip}
                    onChange={(e) => setRegNip(e.target.value)}
                    placeholder="1985xxxx"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                    Asal Sekolah
                  </label>
                  <div className="relative">
                    <School className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-sekolah-input"
                      type="text"
                      value={regSekolah}
                      onChange={(e) => setRegSekolah(e.target.value)}
                      placeholder="SMAN 1 Teladan"
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                    No. WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-hp-input"
                      type="tel"
                      value={regNoHp}
                      onChange={(e) => setRegNoHp(e.target.value)}
                      placeholder="0812xxxx"
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                id="submit-register-btn"
                type="submit"
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-3 rounded-lg shadow-2xs transition duration-150 flex items-center justify-center gap-1.5 text-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Daftar & Buat Akun Guru
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Sistem Terverifikasi & Kompatibel Google Apps Script</span>
        </div>

      </div>
    </div>
  );
};
