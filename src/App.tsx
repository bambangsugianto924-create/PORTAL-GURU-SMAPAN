/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Guru, Kelas, Siswa, AbsensiRecord, NilaiRecord, JurnalRecord, ActiveTab, KopSuratConfig } from './types';
import { StorageService } from './services/storageService';
import { LoginRegister } from './components/LoginRegister';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { KelasView } from './components/KelasView';
import { SiswaView } from './components/SiswaView';
import { AbsensiView } from './components/AbsensiView';
import { NilaiView } from './components/NilaiView';
import { JurnalView } from './components/JurnalView';
import { RekapView } from './components/RekapView';
import { GasGeneratorView } from './components/GasGeneratorView';
import { ProfilView } from './components/ProfilView';
import { WhatsAppHubView } from './components/WhatsAppHubView';
import { WhatsAppModal } from './components/WhatsAppModal';
import { PrintModal } from './components/PrintModal';
import { KopEditorModal } from './components/KopEditorModal';
import { Menu, X, Printer, Settings2, MessageSquare } from 'lucide-react';

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<Guru | null>(() => StorageService.getCurrentUser());

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Core Data States
  const [kelasList, setKelasList] = useState<Kelas[]>(() => StorageService.getKelasList());
  const [siswaList, setSiswaList] = useState<Siswa[]>(() => StorageService.getSiswaList());
  const [absensiList, setAbsensiList] = useState<AbsensiRecord[]>(() => StorageService.getAbsensiList());
  const [nilaiList, setNilaiList] = useState<NilaiRecord[]>(() => StorageService.getNilaiList());
  const [jurnalList, setJurnalList] = useState<JurnalRecord[]>(() => StorageService.getJurnalList());
  const [kopSuratConfig, setKopSuratConfig] = useState<KopSuratConfig>(() => StorageService.getKopSurat());

  // Cross-view selections
  const [selectedKelasFilter, setSelectedKelasFilter] = useState<string>('ALL');
  const [selectedKelasIdForAbsen, setSelectedKelasIdForAbsen] = useState<string>(() => kelasList[0]?.id || '');
  const [selectedKelasIdForNilai, setSelectedKelasIdForNilai] = useState<string>(() => kelasList[0]?.id || '');

  // Kop Editor Modal state
  const [isKopEditorOpen, setIsKopEditorOpen] = useState(false);

  // WhatsApp modal state
  const [whatsAppModalState, setWhatsAppModalState] = useState<{
    isOpen: boolean;
    config?: {
      target?: 'ortu' | 'wali_kelas';
      reportType?: 'presensi' | 'nilai' | 'rekap_wali' | 'nilai_wali' | 'alert_absen' | 'alert_nilai' | 'custom';
      kelasId?: string;
      siswaId?: string;
      tanggal?: string;
    };
  }>({
    isOpen: false
  });

  // Print modal state
  const [printModalState, setPrintModalState] = useState<{
    isOpen: boolean;
    type: 'absen' | 'nilai' | 'jurnal';
    kelasId: string;
  }>({
    isOpen: false,
    type: 'absen',
    kelasId: kelasList[0]?.id || ''
  });

  const handleOpenWhatsApp = (config?: {
    target?: 'ortu' | 'wali_kelas';
    reportType?: string;
    kelasId?: string;
    siswaId?: string;
    tanggal?: string;
  }) => {
    setWhatsAppModalState({
      isOpen: true,
      config: config || {
        target: 'ortu',
        reportType: 'presensi',
        kelasId: kelasList[0]?.id || ''
      }
    });
  };

  const handleUpdateSiswaPhone = (siswaId: string, noHpOrtu: string) => {
    const list = siswaList.map(s => s.id === siswaId ? { ...s, noHpOrtu, noHp: s.noHp || noHpOrtu } : s);
    setSiswaList(list);
    StorageService.saveSiswaList(list);
  };

  const handleUpdateWaliKelasPhone = (kelasId: string, noHpWali: string) => {
    const list = kelasList.map(k => k.id === kelasId ? { ...k, noHpWaliKelas: noHpWali } : k);
    setKelasList(list);
    StorageService.saveKelasList(list);
  };

  // Keep Storage in sync when states update
  const handleSaveKelas = (kelas: Kelas) => {
    const list = [...kelasList];
    const index = list.findIndex(k => k.id === kelas.id);
    if (index >= 0) {
      list[index] = kelas;
    } else {
      list.push(kelas);
    }
    setKelasList(list);
    StorageService.saveKelasList(list);
  };

  const handleDeleteKelas = (kelasId: string) => {
    const list = kelasList.filter(k => k.id !== kelasId);
    setKelasList(list);
    StorageService.saveKelasList(list);
  };

  const handleSaveSiswa = (siswa: Siswa) => {
    const list = [...siswaList];
    const index = list.findIndex(s => s.id === siswa.id);
    if (index >= 0) {
      list[index] = siswa;
    } else {
      list.push(siswa);
    }
    setSiswaList(list);
    StorageService.saveSiswaList(list);
  };

  const handleDeleteSiswa = (siswaId: string) => {
    const list = siswaList.filter(s => s.id !== siswaId);
    setSiswaList(list);
    StorageService.saveSiswaList(list);
  };

  const handleSaveAbsensiBatch = (records: AbsensiRecord[]) => {
    const list = [...absensiList];
    records.forEach(r => {
      const idx = list.findIndex(
        item => item.kelasId === r.kelasId && item.siswaId === r.siswaId && item.tanggal === r.tanggal
      );
      if (idx >= 0) {
        list[idx] = r;
      } else {
        list.push(r);
      }
    });
    setAbsensiList(list);
    StorageService.saveAbsensiList(list);
  };

  const handleSaveNilaiBatch = (records: NilaiRecord[]) => {
    const list = [...nilaiList];
    records.forEach(r => {
      const idx = list.findIndex(
        item => item.kelasId === r.kelasId && item.siswaId === r.siswaId
      );
      if (idx >= 0) {
        list[idx] = r;
      } else {
        list.push(r);
      }
    });
    setNilaiList(list);
    StorageService.saveNilaiList(list);
  };

  const handleSaveJurnal = (jurnal: JurnalRecord) => {
    const list = [...jurnalList];
    const idx = list.findIndex(j => j.id === jurnal.id);
    if (idx >= 0) {
      list[idx] = jurnal;
    } else {
      list.unshift(jurnal);
    }
    setJurnalList(list);
    StorageService.saveJurnalList(list);
  };

  const handleDeleteJurnal = (id: string) => {
    const list = jurnalList.filter(j => j.id !== id);
    setJurnalList(list);
    StorageService.saveJurnalList(list);
  };

  const handleSaveKopSurat = (newConfig: KopSuratConfig) => {
    setKopSuratConfig(newConfig);
    StorageService.saveKopSurat(newConfig);
  };

  const handleUpdateGuru = (guru: Guru) => {
    setCurrentUser(guru);
    StorageService.setCurrentUser(guru);
    StorageService.saveGuru(guru);
  };

  const handleResetData = () => {
    StorageService.resetToSampleData();
    setKelasList(StorageService.getKelasList());
    setSiswaList(StorageService.getSiswaList());
    setAbsensiList(StorageService.getAbsensiList());
    setNilaiList(StorageService.getNilaiList());
    setJurnalList(StorageService.getJurnalList());
    setKopSuratConfig(StorageService.getKopSurat());
    setCurrentUser(StorageService.getCurrentUser());
  };

  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
  };

  const handleQuickAbsen = (kelasId: string) => {
    setSelectedKelasIdForAbsen(kelasId);
    setActiveTab('absen');
  };

  const handleSelectKelas = (kelasId: string, target: 'siswa' | 'absen' | 'nilai') => {
    if (target === 'siswa') {
      setSelectedKelasFilter(kelasId);
      setActiveTab('siswa');
    } else if (target === 'absen') {
      setSelectedKelasIdForAbsen(kelasId);
      setActiveTab('absen');
    } else {
      setSelectedKelasIdForNilai(kelasId);
      setActiveTab('nilai');
    }
  };

  const openPrintModal = (type: 'absen' | 'nilai' | 'jurnal', kelasId: string) => {
    setPrintModalState({
      isOpen: true,
      type,
      kelasId: kelasId || kelasList[0]?.id || ''
    });
  };

  // If user is not logged in, show Teacher Login and Registration screen
  if (!currentUser) {
    return <LoginRegister onLoginSuccess={(guru) => setCurrentUser(guru)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased text-slate-800 font-sans">
      
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        kopSuratConfig={kopSuratConfig}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={(tab) => { setActiveTab(tab); setMobileSidebarOpen(false); }}
        onOpenKopEditor={() => setIsKopEditorOpen(true)}
        onResetData={handleResetData}
      />

      {/* Mobile Menu Toggle Bar */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-2xs print:hidden">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg"
        >
          {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Menu Navigasi</span>
        </button>
        <span className="text-xs font-bold text-emerald-800 capitalize bg-emerald-100/70 px-2 py-0.5 rounded">
          {activeTab.replace('-', ' ')}
        </span>
      </div>

      {/* Main Layout: Left Sidebar + Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        
        {/* Left Sidebar (Desktop & Mobile Drawer) */}
        <div className={`${mobileSidebarOpen ? 'block' : 'hidden'} lg:block flex-shrink-0 z-20 print:hidden`}>
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setMobileSidebarOpen(false);
            }}
            currentUser={currentUser}
            kelasList={kelasList}
            siswaList={siswaList}
            onOpenKopEditor={() => setIsKopEditorOpen(true)}
          />
        </div>

        {/* Content Views */}
        <main className="flex-1 p-3 sm:p-4 lg:p-5 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              kelasList={kelasList}
              siswaList={siswaList}
              absensiList={absensiList}
              nilaiList={nilaiList}
              jurnalList={jurnalList}
              kopSuratConfig={kopSuratConfig}
              setActiveTab={setActiveTab}
              onQuickAbsen={handleQuickAbsen}
              onOpenKopEditor={() => setIsKopEditorOpen(true)}
              onOpenPrintModal={openPrintModal}
              onOpenWhatsApp={handleOpenWhatsApp}
            />
          )}

          {activeTab === 'laporan-wa' && (
            <WhatsAppHubView
              currentUser={currentUser}
              kelasList={kelasList}
              siswaList={siswaList}
              absensiList={absensiList}
              nilaiList={nilaiList}
              kopSuratConfig={kopSuratConfig}
              onOpenModal={handleOpenWhatsApp}
              onOpenWhatsAppModal={handleOpenWhatsApp}
              onUpdateSiswaPhone={handleUpdateSiswaPhone}
              onUpdateWaliKelasPhone={handleUpdateWaliKelasPhone}
            />
          )}

          {activeTab === 'kelas' && (
            <KelasView
              kelasList={kelasList}
              siswaList={siswaList}
              onSaveKelas={handleSaveKelas}
              onDeleteKelas={handleDeleteKelas}
              onSelectKelas={handleSelectKelas}
              onOpenWhatsApp={handleOpenWhatsApp}
            />
          )}

          {activeTab === 'siswa' && (
            <SiswaView
              siswaList={siswaList}
              kelasList={kelasList}
              nilaiList={nilaiList}
              absensiList={absensiList}
              selectedKelasFilter={selectedKelasFilter}
              setSelectedKelasFilter={setSelectedKelasFilter}
              onSaveSiswa={handleSaveSiswa}
              onDeleteSiswa={handleDeleteSiswa}
              onOpenWhatsApp={handleOpenWhatsApp}
            />
          )}

          {activeTab === 'absen' && (
            <AbsensiView
              kelasList={kelasList}
              siswaList={siswaList}
              absensiList={absensiList}
              selectedKelasId={selectedKelasIdForAbsen}
              setSelectedKelasId={setSelectedKelasIdForAbsen}
              onSaveAbsensiBatch={handleSaveAbsensiBatch}
              onOpenPrint={openPrintModal}
              onOpenWhatsApp={handleOpenWhatsApp}
            />
          )}

          {activeTab === 'nilai' && (
            <NilaiView
              currentUser={currentUser}
              kelasList={kelasList}
              siswaList={siswaList}
              nilaiList={nilaiList}
              selectedKelasId={selectedKelasIdForNilai}
              setSelectedKelasId={setSelectedKelasIdForNilai}
              onSaveNilaiBatch={handleSaveNilaiBatch}
              onOpenPrint={openPrintModal}
              onOpenWhatsApp={handleOpenWhatsApp}
            />
          )}

          {activeTab === 'jurnal' && (
            <JurnalView
              currentUser={currentUser}
              kelasList={kelasList}
              jurnalList={jurnalList}
              onSaveJurnal={handleSaveJurnal}
              onDeleteJurnal={handleDeleteJurnal}
              onOpenPrint={openPrintModal}
            />
          )}

          {activeTab === 'rekap' && (
            <RekapView
              currentUser={currentUser}
              kelasList={kelasList}
              siswaList={siswaList}
              absensiList={absensiList}
              nilaiList={nilaiList}
              jurnalList={jurnalList}
              kopSuratConfig={kopSuratConfig}
              onOpenKopEditor={() => setIsKopEditorOpen(true)}
              onOpenPrintModal={openPrintModal}
            />
          )}

          {activeTab === 'gas-generator' && (
            <GasGeneratorView currentUser={currentUser} />
          )}

          {activeTab === 'profil' && (
            <ProfilView
              currentUser={currentUser}
              kopSuratConfig={kopSuratConfig}
              onUpdateGuru={handleUpdateGuru}
              onOpenKopEditor={() => setIsKopEditorOpen(true)}
              onResetAllData={handleResetData}
            />
          )}
        </main>
      </div>

      {/* WhatsApp Reporting Modal */}
      {whatsAppModalState.isOpen && (
        <WhatsAppModal
          isOpen={whatsAppModalState.isOpen}
          onClose={() => setWhatsAppModalState({ isOpen: false })}
          currentUser={currentUser}
          kelasList={kelasList}
          siswaList={siswaList}
          absensiList={absensiList}
          nilaiList={nilaiList}
          kopSuratConfig={kopSuratConfig}
          initialConfig={whatsAppModalState.config}
          onUpdateSiswaPhone={handleUpdateSiswaPhone}
          onUpdateWaliKelasPhone={handleUpdateWaliKelasPhone}
        />
      )}

      {/* Print Document Modal */}
      {printModalState.isOpen && (
        <PrintModal
          type={printModalState.type}
          kelasId={printModalState.kelasId}
          currentUser={currentUser}
          kelasList={kelasList}
          siswaList={siswaList}
          absensiList={absensiList}
          nilaiList={nilaiList}
          jurnalList={jurnalList}
          kopSuratConfig={kopSuratConfig}
          onOpenKopEditor={() => setIsKopEditorOpen(true)}
          onClose={() => setPrintModalState(prev => ({ ...prev, isOpen: false }))}
        />
      )}

      {/* Kop Surat & Logo Editor Modal */}
      {isKopEditorOpen && (
        <KopEditorModal
          config={kopSuratConfig}
          onSave={handleSaveKopSurat}
          onClose={() => setIsKopEditorOpen(false)}
        />
      )}

    </div>
  );
}
