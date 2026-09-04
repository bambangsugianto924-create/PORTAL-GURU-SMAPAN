import React, { useState, useEffect, useMemo } from 'react';
import { Guru, Kelas, Siswa, AbsensiRecord, NilaiRecord, KopSuratConfig, StatusAbsen } from '../types';
import {
  formatPhoneForWA,
  getWhatsAppUrl,
  getWhatsAppWebUrl,
  getWaMeUrl,
  generatePresensiOrtuMessage,
  generateRekapPresensiOrtuMessage,
  generateNilaiOrtuMessage,
  generateAlertPresensiOrtuMessage,
  generateAlertNilaiOrtuMessage,
  generatePresensiWaliKelasMessage,
  generateNilaiWaliKelasMessage
} from '../services/whatsappService';
import { getTodayString } from '../data/initialData';
import {
  X,
  Send,
  Copy,
  Check,
  Phone,
  User,
  Users,
  School,
  Calendar,
  Sparkles,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Search,
  Filter,
  ArrowRight,
  Info,
  Clock,
  Save
} from 'lucide-react';

export interface WhatsAppModalConfig {
  target?: 'ortu' | 'wali_kelas';
  reportType?: 'presensi' | 'rekap_presensi' | 'nilai' | 'alert_presensi' | 'alert_nilai' | 'presensi_wali' | 'nilai_wali' | 'kustom' | string;
  kelasId?: string;
  siswaId?: string;
  tanggal?: string;
}

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Guru;
  kelasList: Kelas[];
  siswaList: Siswa[];
  absensiList: AbsensiRecord[];
  nilaiList: NilaiRecord[];
  kopSuratConfig?: KopSuratConfig;
  initialConfig?: WhatsAppModalConfig | null;
  onUpdateSiswaPhone?: (siswaId: string, noHpOrtu: string) => void;
  onUpdateWaliKelasPhone?: (kelasId: string, noHpWali: string) => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  kelasList,
  siswaList,
  absensiList,
  nilaiList,
  kopSuratConfig,
  initialConfig,
  onUpdateSiswaPhone,
  onUpdateWaliKelasPhone
}) => {
  const [targetType, setTargetType] = useState<'ortu' | 'wali_kelas'>('ortu');
  const [selectedKelasId, setSelectedKelasId] = useState<string>(kelasList[0]?.id || '');
  const [selectedSiswaId, setSelectedSiswaId] = useState<string>('');
  const [reportType, setReportType] = useState<string>('presensi');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [catatanTambahan, setCatatanTambahan] = useState<string>('');
  const [manualPhone, setManualPhone] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isManualEdit, setIsManualEdit] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [phoneWarning, setPhoneWarning] = useState<string>('');
  const [savedPhoneSuccess, setSavedPhoneSuccess] = useState<boolean>(false);
  const [batchPhoneDrafts, setBatchPhoneDrafts] = useState<Record<string, string>>({});
  const [activeTabMode, setActiveTabMode] = useState<'single' | 'batch'>('single');
  const [batchFilter, setBatchFilter] = useState<'all' | 'absent_only' | 'remedial_only'>('all');
  const [sentStudentIds, setSentStudentIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fallback safe kop surat config
  const safeKopSurat = useMemo(() => {
    return kopSuratConfig || {
      namaSekolah: 'SMA NEGERI 1 CONTOH',
      npsn: '12345678',
      alamat: 'Jl. Pendidikan No. 1',
      kabupatenKota: 'Kota',
      provinsi: 'Provinsi',
      kodePos: '12345',
      noTelepon: '-',
      email: '-',
      website: '-'
    };
  }, [kopSuratConfig]);

  // Synchronize when opened or initialConfig changes
  useEffect(() => {
    if (isOpen) {
      if (initialConfig) {
        setTargetType(initialConfig.target || 'ortu');
        if (initialConfig.kelasId) setSelectedKelasId(initialConfig.kelasId);
        if (initialConfig.siswaId) setSelectedSiswaId(initialConfig.siswaId);
        if (initialConfig.tanggal) setSelectedDate(initialConfig.tanggal);
        if (initialConfig.reportType) {
          let rt = initialConfig.reportType;
          if (rt === 'rekap_wali') rt = 'presensi_wali';
          if (rt === 'alert_absen') rt = 'alert_presensi';
          if (rt === 'custom') rt = 'kustom';
          setReportType(rt);
        }
      } else {
        if (!selectedKelasId && kelasList.length > 0) {
          setSelectedKelasId(kelasList[0].id);
        }
      }
      setIsManualEdit(false);
      setCopied(false);
      setPhoneWarning('');
    }
  }, [isOpen, initialConfig, kelasList]);

  const selectedKelas = useMemo(() => {
    return kelasList.find(k => k.id === selectedKelasId) || kelasList[0];
  }, [kelasList, selectedKelasId]);

  const classStudents = useMemo(() => {
    return siswaList.filter(s => s.kelasId === selectedKelasId);
  }, [siswaList, selectedKelasId]);

  // Set default student if none selected or selected student not in current class
  useEffect(() => {
    if (classStudents.length > 0) {
      const exists = classStudents.some(s => s.id === selectedSiswaId);
      if (!exists) {
        setSelectedSiswaId(classStudents[0].id);
      }
    } else {
      setSelectedSiswaId('');
    }
  }, [classStudents, selectedSiswaId]);

  const selectedSiswa = useMemo(() => {
    return classStudents.find(s => s.id === selectedSiswaId) || classStudents[0];
  }, [classStudents, selectedSiswaId]);

  // Synchronize target phone number based on targetType
  useEffect(() => {
    if (targetType === 'ortu') {
      if (selectedSiswa) {
        const phone = selectedSiswa.noHpOrtu || selectedSiswa.noHp || '';
        setManualPhone(phone);
      } else {
        setManualPhone('');
      }
    } else {
      if (selectedKelas) {
        setManualPhone(selectedKelas.noHpWaliKelas || '');
      } else {
        setManualPhone('');
      }
    }
  }, [targetType, selectedSiswa, selectedKelas]);

  // Get records for selected student / class
  const studentAbsensiToday = useMemo(() => {
    if (!selectedSiswaId) return undefined;
    return absensiList.find(a => a.siswaId === selectedSiswaId && a.tanggal === selectedDate);
  }, [absensiList, selectedSiswaId, selectedDate]);

  const studentNilai = useMemo(() => {
    if (!selectedSiswaId) return undefined;
    return nilaiList.find(n => n.siswaId === selectedSiswaId);
  }, [nilaiList, selectedSiswaId]);

  // Generate Message dynamically
  const generatedMessage = useMemo(() => {
    if (!selectedKelas) return '';

    if (targetType === 'ortu') {
      if (!selectedSiswa) return 'Pilih siswa terlebih dahulu.';

      switch (reportType) {
        case 'presensi':
          return generatePresensiOrtuMessage({
            siswa: selectedSiswa,
            kelas: selectedKelas,
            tanggal: selectedDate,
            absensiRecord: studentAbsensiToday,
            guru: currentUser,
            kopSurat: safeKopSurat,
            catatanTambahan
          });
        case 'rekap_presensi':
          return generateRekapPresensiOrtuMessage({
            siswa: selectedSiswa,
            kelas: selectedKelas,
            absensiList,
            guru: currentUser,
            kopSurat: safeKopSurat,
            catatanTambahan
          });
        case 'nilai':
          return generateNilaiOrtuMessage({
            siswa: selectedSiswa,
            kelas: selectedKelas,
            nilaiRecord: studentNilai,
            guru: currentUser,
            kopSurat: safeKopSurat,
            catatanTambahan
          });
        case 'alert_presensi':
          return generateAlertPresensiOrtuMessage({
            siswa: selectedSiswa,
            kelas: selectedKelas,
            tanggal: selectedDate,
            status: studentAbsensiToday?.status || 'A',
            keterangan: studentAbsensiToday?.keterangan || 'Tidak hadir tanpa keterangan',
            guru: currentUser,
            kopSurat: safeKopSurat,
            catatanTambahan
          });
        case 'alert_nilai':
          return generateAlertNilaiOrtuMessage({
            siswa: selectedSiswa,
            kelas: selectedKelas,
            nilaiRecord: studentNilai,
            guru: currentUser,
            kopSurat: safeKopSurat,
            catatanTambahan
          });
        case 'kustom':
          return customMessage || `Yth. Orang Tua dari *${selectedSiswa.nama}*,\n\n`;
        default:
          return generatePresensiOrtuMessage({
            siswa: selectedSiswa,
            kelas: selectedKelas,
            tanggal: selectedDate,
            absensiRecord: studentAbsensiToday,
            guru: currentUser,
            kopSurat: safeKopSurat,
            catatanTambahan
          });
      }
    } else {
      // Target is Wali Kelas
      switch (reportType) {
        case 'presensi_wali':
        case 'presensi':
        case 'rekap_presensi':
          return generatePresensiWaliKelasMessage({
            kelas: selectedKelas,
            tanggal: selectedDate,
            classStudents,
            absensiList,
            guru: currentUser,
            kopSurat: safeKopSurat,
            catatanTambahan
          });
        case 'nilai_wali':
        case 'nilai':
        case 'alert_nilai':
          return generateNilaiWaliKelasMessage({
            kelas: selectedKelas,
            classStudents,
            nilaiList,
            guru: currentUser,
            kopSurat: safeKopSurat,
            catatanTambahan
          });
        default:
          return generatePresensiWaliKelasMessage({
            kelas: selectedKelas,
            tanggal: selectedDate,
            classStudents,
            absensiList,
            guru: currentUser,
            kopSurat: safeKopSurat,
            catatanTambahan
          });
      }
    }
  }, [
    targetType,
    reportType,
    selectedKelas,
    selectedSiswa,
    selectedDate,
    studentAbsensiToday,
    studentNilai,
    currentUser,
    safeKopSurat,
    catatanTambahan,
    customMessage,
    absensiList,
    classStudents,
    nilaiList
  ]);

  // Keep customMessage in sync if not manually edited
  useEffect(() => {
    if (!isManualEdit) {
      setCustomMessage(generatedMessage);
    }
  }, [generatedMessage, isManualEdit]);

  const activeMessageText = isManualEdit ? customMessage : generatedMessage;

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(activeMessageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = activeMessageText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendSingleWhatsApp = (preferWeb: boolean = false) => {
    if (!manualPhone.trim()) {
      setPhoneWarning('Mohon masukkan nomor WhatsApp penerima (contoh: 081234567890) atau salin teks pesan.');
      return;
    }
    setPhoneWarning('');
    const url = preferWeb
      ? getWhatsAppWebUrl(manualPhone, activeMessageText)
      : getWhatsAppUrl(manualPhone, activeMessageText);
    window.open(url, '_blank');

    if (selectedSiswa) {
      setSentStudentIds(prev => new Set(prev).add(selectedSiswa.id));
    }
  };

  const handleSaveBatchPhone = (siswaId: string) => {
    const draft = batchPhoneDrafts[siswaId];
    if (!draft || !draft.trim()) return;
    if (onUpdateSiswaPhone) {
      onUpdateSiswaPhone(siswaId, draft.trim());
      setSavedPhoneSuccess(true);
      setTimeout(() => setSavedPhoneSuccess(false), 2000);
    }
  };

  const handleSendBatchStudent = (siswa: Siswa, preferWeb: boolean = false) => {
    const draft = batchPhoneDrafts[siswa.id];
    const phone = (draft && draft.trim()) ? draft.trim() : (siswa.noHpOrtu || siswa.noHp || '');
    if (!phone) {
      setPhoneWarning(`Nomor WhatsApp untuk ${siswa.nama} belum terisi.`);
      return;
    }
    setPhoneWarning('');

    if (draft && draft.trim() && onUpdateSiswaPhone && draft.trim() !== siswa.noHpOrtu) {
      onUpdateSiswaPhone(siswa.id, draft.trim());
    }

    let msg = '';
    const ab = absensiList.find(a => a.siswaId === siswa.id && a.tanggal === selectedDate);
    const nil = nilaiList.find(n => n.siswaId === siswa.id);

    if (reportType === 'nilai' || reportType === 'alert_nilai') {
      msg = generateNilaiOrtuMessage({
        siswa,
        kelas: selectedKelas,
        nilaiRecord: nil,
        guru: currentUser,
        kopSurat: safeKopSurat,
        catatanTambahan
      });
    } else {
      msg = generatePresensiOrtuMessage({
        siswa,
        kelas: selectedKelas,
        tanggal: selectedDate,
        absensiRecord: ab,
        guru: currentUser,
        kopSurat: safeKopSurat,
        catatanTambahan
      });
    }

    const url = preferWeb
      ? getWhatsAppWebUrl(phone, msg)
      : getWhatsAppUrl(phone, msg);

    window.open(url, '_blank');
    setSentStudentIds(prev => new Set(prev).add(siswa.id));
  };

  // Filtered batch students
  const filteredBatchStudents = useMemo(() => {
    return classStudents.filter(s => {
      // Search
      const matchSearch = !searchQuery || s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery);
      if (!matchSearch) return false;

      if (batchFilter === 'absent_only') {
        const rec = absensiList.find(a => a.siswaId === s.id && a.tanggal === selectedDate);
        return rec && rec.status !== 'H';
      }

      if (batchFilter === 'remedial_only') {
        const nil = nilaiList.find(n => n.siswaId === s.id);
        return nil && !nil.statusLulus;
      }

      return true;
    });
  }, [classStudents, searchQuery, batchFilter, absensiList, nilaiList, selectedDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Header - WhatsApp Green theme */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 px-5 py-3.5 text-white flex items-center justify-between shadow-md border-b border-emerald-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-white shadow-inner">
              <MessageSquare className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>Laporan WhatsApp Resmi</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/50 text-emerald-300 font-mono border border-emerald-400/30">
                    wa.me Direct
                  </span>
                </h2>
              </div>
              <p className="text-xs text-emerald-100/90">
                Kirim notifikasi presensi, hasil belajar & rekap langsung ke WhatsApp Orang Tua atau Wali Kelas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-emerald-900/50 hover:bg-emerald-900 text-emerald-200 hover:text-white transition"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Header Mode Switcher: Kirim Satuan vs Kirim Massal/Berurutan */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-lg">
            <button
              onClick={() => setActiveTabMode('single')}
              className={`px-3 py-1 rounded-md font-bold transition flex items-center gap-1.5 ${
                activeTabMode === 'single'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Kirim Personal / Satuan</span>
            </button>

            <button
              onClick={() => {
                setActiveTabMode('batch');
                setTargetType('ortu');
              }}
              className={`px-3 py-1 rounded-md font-bold transition flex items-center gap-1.5 ${
                activeTabMode === 'batch'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Kirim Berurutan Seluruh Kelas</span>
              {classStudents.length > 0 && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {classStudents.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <School className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-semibold text-slate-700">{kopSuratConfig.namaSekolah}</span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {activeTabMode === 'single' ? (
            /* Single Direct Sender View */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Controls Column (5 cols) */}
              <div className="lg:col-span-5 space-y-3.5">
                
                {/* 1. Target Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Penerima
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetType('ortu');
                        if (reportType.includes('wali')) setReportType('presensi');
                      }}
                      className={`p-2 rounded-xl border text-xs font-bold text-left transition flex items-center gap-2 ${
                        targetType === 'ortu'
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 shadow-2xs ring-1 ring-emerald-400'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${targetType === 'ortu' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div>Orang Tua / Wali</div>
                        <div className="text-[10px] font-normal text-slate-500">Perorangan siswa</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTargetType('wali_kelas');
                        if (!reportType.includes('wali')) setReportType('presensi_wali');
                      }}
                      className={`p-2 rounded-xl border text-xs font-bold text-left transition flex items-center gap-2 ${
                        targetType === 'wali_kelas'
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 shadow-2xs ring-1 ring-emerald-400'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${targetType === 'wali_kelas' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <School className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div>Wali Kelas</div>
                        <div className="text-[10px] font-normal text-slate-500">Rekap rombel kelas</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Select Kelas & Siswa / Wali */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Pilih Kelas
                    </label>
                    <select
                      value={selectedKelasId}
                      onChange={(e) => setSelectedKelasId(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    >
                      {kelasList.map(k => (
                        <option key={k.id} value={k.id}>{k.nama} ({k.jurusan})</option>
                      ))}
                    </select>
                  </div>

                  {targetType === 'ortu' ? (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Pilih Siswa
                      </label>
                      <select
                        value={selectedSiswaId}
                        onChange={(e) => setSelectedSiswaId(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                      >
                        {classStudents.map(s => (
                          <option key={s.id} value={s.id}>{s.nama}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Wali Kelas
                      </label>
                      <div className="px-2.5 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-800 truncate">
                        {selectedKelas?.waliKelas || '-'}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Phone number contact input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-700" />
                      <span>Nomor WhatsApp Penerima</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Standar Indonesia (08/62)</span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      value={manualPhone}
                      onChange={(e) => {
                        setManualPhone(e.target.value);
                        if (phoneWarning) setPhoneWarning('');
                      }}
                      placeholder="081234567890"
                      className="w-full pl-3 pr-24 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold text-emerald-950"
                    />
                    {manualPhone && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-mono font-semibold">
                        +{formatPhoneForWA(manualPhone)}
                      </div>
                    )}
                  </div>

                  {/* Feedback when phone is saved */}
                  {savedPhoneSuccess && (
                    <div className="mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Nomor WhatsApp berhasil disimpan ke database!</span>
                    </div>
                  )}

                  {/* Warning banner if phone is empty upon sending */}
                  {phoneWarning && (
                    <div className="mt-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{phoneWarning}</span>
                    </div>
                  )}
                  
                  {targetType === 'ortu' && selectedSiswa && (
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Wali: {selectedSiswa.namaWali || 'Orang Tua'}</span>
                      {onUpdateSiswaPhone && manualPhone && manualPhone !== selectedSiswa.noHpOrtu && (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateSiswaPhone(selectedSiswa.id, manualPhone);
                            setSavedPhoneSuccess(true);
                            setTimeout(() => setSavedPhoneSuccess(false), 2500);
                          }}
                          className="text-emerald-700 hover:text-emerald-800 font-bold underline flex items-center gap-0.5"
                        >
                          <Save className="w-2.5 h-2.5" />
                          <span>Simpan No ini ke Siswa</span>
                        </button>
                      )}
                    </div>
                  )}

                  {targetType === 'wali_kelas' && selectedKelas && (
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Wali: {selectedKelas.waliKelas || '-'}</span>
                      {onUpdateWaliKelasPhone && manualPhone && manualPhone !== selectedKelas.noHpWaliKelas && (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateWaliKelasPhone(selectedKelas.id, manualPhone);
                            setSavedPhoneSuccess(true);
                            setTimeout(() => setSavedPhoneSuccess(false), 2500);
                          }}
                          className="text-emerald-700 hover:text-emerald-800 font-bold underline flex items-center gap-0.5"
                        >
                          <Save className="w-2.5 h-2.5" />
                          <span>Simpan No ini ke Wali Kelas</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. Jenis Laporan Pills */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Format & Jenis Laporan
                  </label>
                  
                  {targetType === 'ortu' ? (
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => { setReportType('presensi'); setIsManualEdit(false); }}
                        className={`p-2 rounded-lg border text-left font-medium transition ${
                          reportType === 'presensi'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Presensi Harian</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-normal mt-0.5">Kehadiran per tanggal</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setReportType('nilai'); setIsManualEdit(false); }}
                        className={`p-2 rounded-lg border text-left font-medium transition ${
                          reportType === 'nilai'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Hasil Belajar / Nilai</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-normal mt-0.5">Tugas, UH, PTS, PAS</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setReportType('alert_presensi'); setIsManualEdit(false); }}
                        className={`p-2 rounded-lg border text-left font-medium transition ${
                          reportType === 'alert_presensi'
                            ? 'border-rose-500 bg-rose-50 text-rose-950 font-bold shadow-2xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-rose-700">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Peringatan Alpa</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-normal mt-0.5">Notifikasi tidak hadir</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setReportType('rekap_presensi'); setIsManualEdit(false); }}
                        className={`p-2 rounded-lg border text-left font-medium transition ${
                          reportType === 'rekap_presensi'
                            ? 'border-teal-500 bg-teal-50 text-teal-950 font-bold shadow-2xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-teal-700">
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Rekap Presensi</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-normal mt-0.5">Total H, I, S, A semester</p>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => { setReportType('presensi_wali'); setIsManualEdit(false); }}
                        className={`p-2 rounded-lg border text-left font-medium transition ${
                          reportType === 'presensi_wali'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Presensi Rombel</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-normal mt-0.5">Daftar hadir & alpa harian</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setReportType('nilai_wali'); setIsManualEdit(false); }}
                        className={`p-2 rounded-lg border text-left font-medium transition ${
                          reportType === 'nilai_wali'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Rekap Nilai Rombel</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-normal mt-0.5">Statistik & siswa remedial</p>
                      </button>
                    </div>
                  )}
                </div>

                {/* 5. Date selection for daily attendance */}
                {(reportType === 'presensi' || reportType === 'alert_presensi' || reportType === 'presensi_wali') && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Tanggal Presensi
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-semibold"
                    />
                  </div>
                )}

                {/* 6. Catatan Tambahan Guru */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pesan Khusus / Catatan Pengajar <span className="text-slate-400 font-normal">(Opsional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={catatanTambahan}
                    onChange={(e) => {
                      setCatatanTambahan(e.target.value);
                      setIsManualEdit(false);
                    }}
                    placeholder="Contoh: Mohon bimbing ananda untuk tugas proyek akhir pekan ini..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none text-slate-800"
                  />
                </div>

              </div>

              {/* Right Live WhatsApp Bubble Preview Column (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-3 bg-slate-900/5 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Pratinjau Pesan WhatsApp</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsManualEdit(!isManualEdit)}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded transition ${
                          isManualEdit
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {isManualEdit ? 'Mode Edit Aktif' : 'Edit Teks Manual'}
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyMessage}
                        className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-300 transition flex items-center gap-1 shadow-2xs"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Realistic WhatsApp Chat Bubble Container */}
                  <div className="bg-[#efeae2] p-3.5 rounded-xl border border-emerald-900/10 shadow-inner max-h-[380px] overflow-y-auto font-sans relative">
                    <div className="max-w-[95%] bg-white rounded-lg p-3 text-xs text-slate-900 shadow-sm border border-slate-200/80 relative ml-auto space-y-1">
                      {isManualEdit ? (
                        <textarea
                          rows={12}
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          className="w-full text-xs font-mono bg-amber-50/50 p-2 border border-amber-200 rounded focus:outline-none resize-none leading-relaxed"
                        />
                      ) : (
                        <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800 select-text">
                          {generatedMessage}
                        </div>
                      )}

                      {/* WhatsApp timestamp & read receipt icon */}
                      <div className="flex items-center justify-end gap-1 text-[9.5px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-100">
                        <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-emerald-600 font-bold">✓✓</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500">
                    Penerima: <strong className="text-slate-800">{targetType === 'ortu' ? (selectedSiswa?.nama || '-') : (selectedKelas?.waliKelas || '-')}</strong>
                    {manualPhone ? (
                      <span className="ml-1 text-emerald-700 font-mono font-semibold">({manualPhone})</span>
                    ) : (
                      <span className="ml-1 text-rose-600 font-semibold">(Nomor belum diisi)</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
                    </button>

                    <a
                      href={manualPhone ? getWhatsAppWebUrl(manualPhone, activeMessageText) : '#'}
                      target={manualPhone ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (!manualPhone.trim()) {
                          e.preventDefault();
                          setPhoneWarning('Mohon isi nomor WhatsApp penerima terlebih dahulu.');
                          return;
                        }
                        setPhoneWarning('');
                        if (selectedSiswa) {
                          setSentStudentIds(prev => new Set(prev).add(selectedSiswa.id));
                        }
                      }}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition flex items-center gap-1"
                      title="Buka langsung di WhatsApp Web di tab browser baru"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>WhatsApp Web</span>
                    </a>

                    <a
                      href={manualPhone ? getWhatsAppUrl(manualPhone, activeMessageText) : '#'}
                      target={manualPhone ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (!manualPhone.trim()) {
                          e.preventDefault();
                          setPhoneWarning('Mohon masukkan nomor WhatsApp penerima (contoh: 081234567890).');
                          return;
                        }
                        setPhoneWarning('');
                        if (selectedSiswa) {
                          setSentStudentIds(prev => new Set(prev).add(selectedSiswa.id));
                        }
                      }}
                      className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition flex items-center gap-1.5 shadow-sm active:scale-98"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim ke WhatsApp</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* Batch Sequential Sender View (Seluruh Kelas) */
            <div className="space-y-4">
              
              {/* Batch Top Bar: Kelas Selector, Filter, Search */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Rombel Kelas
                    </span>
                    <select
                      value={selectedKelasId}
                      onChange={(e) => setSelectedKelasId(e.target.value)}
                      className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg font-bold text-emerald-950"
                    >
                      {kelasList.map(k => (
                        <option key={k.id} value={k.id}>{k.nama}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Jenis Laporan Massal
                    </span>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                    >
                      <option value="presensi">Presensi Harian ({selectedDate})</option>
                      <option value="nilai">Hasil Belajar / Nilai Siswa</option>
                      <option value="alert_presensi">Peringatan Ketidakhadiran (Alpa/Sakit/Izin)</option>
                      <option value="rekap_presensi">Rekap Presensi Semester</option>
                    </select>
                  </div>
                </div>

                {/* Filter and Search */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari siswa..."
                      className="pl-8 pr-3 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <select
                    value={batchFilter}
                    onChange={(e) => setBatchFilter(e.target.value as any)}
                    className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg font-semibold text-slate-700"
                  >
                    <option value="all">Semua Siswa ({classStudents.length})</option>
                    <option value="absent_only">Hanya Tidak Hadir (I/S/A)</option>
                    <option value="remedial_only">Hanya Perlu Remedial (&lt; KKM)</option>
                  </select>
                </div>
              </div>

              {/* Batch Table List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="max-h-[420px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">No</th>
                        <th className="py-2.5 px-3">Nama Siswa & NISN</th>
                        <th className="py-2.5 px-3">Wali & No. WhatsApp</th>
                        <th className="py-2.5 px-3 text-center">Status / Nilai</th>
                        <th className="py-2.5 px-3 text-center">Status Kirim</th>
                        <th className="py-2.5 px-3 text-center w-36">Aksi WA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredBatchStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-400">
                            Tidak ada siswa yang sesuai dengan filter atau kriteria pencarian.
                          </td>
                        </tr>
                      ) : (
                        filteredBatchStudents.map((s, idx) => {
                          const isSent = sentStudentIds.has(s.id);
                          const ab = absensiList.find(a => a.siswaId === s.id && a.tanggal === selectedDate);
                          const nil = nilaiList.find(n => n.siswaId === s.id);
                          const draftPhone = batchPhoneDrafts[s.id];
                          const phone = draftPhone || s.noHpOrtu || s.noHp || '';

                          return (
                            <tr key={s.id} className="hover:bg-slate-50/80 transition">
                              <td className="py-2.5 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                              
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-slate-900">{s.nama}</div>
                                <div className="text-[10px] text-slate-500 font-mono">NISN: {s.nisn}</div>
                              </td>

                              <td className="py-2.5 px-3">
                                <div className="text-slate-700 font-medium">{s.namaWali || 'Orang Tua'}</div>
                                {phone ? (
                                  <div className="text-[10px] font-mono text-emerald-800 font-semibold flex items-center gap-1">
                                    <span>📱 {phone}</span>
                                    {draftPhone && draftPhone !== s.noHpOrtu && (
                                      <button
                                        type="button"
                                        onClick={() => handleSaveBatchPhone(s.id)}
                                        className="text-[9px] text-emerald-700 hover:underline font-bold"
                                        title="Simpan nomor ke data siswa"
                                      >
                                        [Simpan]
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <div className="mt-0.5">
                                    <div className="text-[10px] text-rose-500 font-semibold mb-0.5">Belum ada No WA</div>
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="text"
                                        placeholder="08..."
                                        value={batchPhoneDrafts[s.id] ?? ''}
                                        onChange={(e) => setBatchPhoneDrafts(prev => ({ ...prev, [s.id]: e.target.value }))}
                                        className="w-24 px-1.5 py-0.5 text-[10px] font-mono border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleSaveBatchPhone(s.id)}
                                        className="px-1.5 py-0.5 text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold"
                                      >
                                        Simpan
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </td>

                              <td className="py-2.5 px-3 text-center">
                                {reportType === 'nilai' ? (
                                  nil ? (
                                    <span className={`inline-flex px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                                      nil.statusLulus ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                    }`}>
                                      {nil.nilaiAkhir} ({nil.predikat})
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[10px]">-</span>
                                  )
                                ) : (
                                  ab ? (
                                    <span className={`inline-flex px-2 py-0.5 rounded font-bold text-[10px] ${
                                      ab.status === 'H' ? 'bg-emerald-100 text-emerald-800' :
                                      ab.status === 'I' ? 'bg-blue-100 text-blue-800' :
                                      ab.status === 'S' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                                    }`}>
                                      {ab.status === 'H' ? 'Hadir' : ab.status === 'I' ? 'Izin' : ab.status === 'S' ? 'Sakit' : 'Alpa'}
                                    </span>
                                  ) : (
                                    <span className="text-emerald-700 text-[10px] font-bold">Hadir</span>
                                  )
                                )}
                              </td>

                              <td className="py-2.5 px-3 text-center">
                                {isSent ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Terkirim</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-medium">Belum Dikirim</span>
                                )}
                              </td>

                              <td className="py-2.5 px-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleSendBatchStudent(s)}
                                    disabled={!phone}
                                    className={`py-1 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs ${
                                      isSent
                                        ? 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200'
                                        : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                                    } ${!phone ? 'opacity-40 cursor-not-allowed' : ''}`}
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>{isSent ? 'Kirim Ulang' : 'Kirim WA'}</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Batch Footer Stats */}
              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-950 font-medium">
                  <Info className="w-4 h-4 text-emerald-700" />
                  <span>
                    Kemajuan Pengiriman: <strong>{sentStudentIds.size}</strong> dari <strong>{classStudents.length} Siswa</strong> terkirim
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSentStudentIds(new Set())}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline font-medium"
                  >
                    Reset Status Terkirim
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Terhubung via WhatsApp Web & Mobile URL API</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 transition"
          >
            Selesai / Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
