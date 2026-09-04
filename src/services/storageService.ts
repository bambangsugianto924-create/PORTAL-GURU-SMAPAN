import { Guru, Kelas, Siswa, AbsensiRecord, NilaiRecord, JurnalRecord, KopSuratConfig } from '../types';
import {
  INITIAL_GURU_LIST,
  INITIAL_KELAS_LIST,
  INITIAL_SISWA_LIST,
  INITIAL_ABSENSI_LIST,
  INITIAL_NILAI_LIST,
  INITIAL_JURNAL_LIST,
  INITIAL_KOP_SURAT
} from '../data/initialData';

const STORAGE_KEYS = {
  CURRENT_USER: 'pg_current_guru',
  USERS: 'pg_guru_list',
  KELAS: 'pg_kelas_list',
  SISWA: 'pg_siswa_list',
  ABSENSI: 'pg_absensi_list',
  NILAI: 'pg_nilai_list',
  JURNAL: 'pg_jurnal_list',
  KOP_SURAT: 'pg_kop_surat',
};

export const StorageService = {
  // Kop Surat
  getKopSurat: (): KopSuratConfig => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KOP_SURAT);
      return data ? { ...INITIAL_KOP_SURAT, ...JSON.parse(data) } : INITIAL_KOP_SURAT;
    } catch {
      return INITIAL_KOP_SURAT;
    }
  },

  saveKopSurat: (kop: KopSuratConfig) => {
    localStorage.setItem(STORAGE_KEYS.KOP_SURAT, JSON.stringify(kop));
  },
  // Current user / session
  getCurrentUser: (): Guru | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) return JSON.parse(data);
      // Default to first teacher for instant ready-to-run experience if not explicitly logged out
      return INITIAL_GURU_LIST[0];
    } catch {
      return INITIAL_GURU_LIST[0];
    }
  },

  setCurrentUser: (guru: Guru | null) => {
    if (guru) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(guru));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  getGuruList: (): Guru[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_GURU_LIST;
    } catch {
      return INITIAL_GURU_LIST;
    }
  },

  saveGuru: (guru: Guru): boolean => {
    const list = StorageService.getGuruList();
    const existingIndex = list.findIndex(g => g.email.toLowerCase() === guru.email.toLowerCase());
    if (existingIndex >= 0) {
      list[existingIndex] = guru;
    } else {
      list.push(guru);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));
    return true;
  },

  // Kelas
  getKelasList: (): Kelas[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KELAS);
      return data ? JSON.parse(data) : INITIAL_KELAS_LIST;
    } catch {
      return INITIAL_KELAS_LIST;
    }
  },

  saveKelasList: (list: Kelas[]) => {
    localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(list));
  },

  // Siswa
  getSiswaList: (): Siswa[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SISWA);
      return data ? JSON.parse(data) : INITIAL_SISWA_LIST;
    } catch {
      return INITIAL_SISWA_LIST;
    }
  },

  saveSiswaList: (list: Siswa[]) => {
    localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(list));
  },

  // Absensi
  getAbsensiList: (): AbsensiRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ABSENSI);
      return data ? JSON.parse(data) : INITIAL_ABSENSI_LIST;
    } catch {
      return INITIAL_ABSENSI_LIST;
    }
  },

  saveAbsensiList: (list: AbsensiRecord[]) => {
    localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(list));
  },

  // Nilai
  getNilaiList: (): NilaiRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NILAI);
      return data ? JSON.parse(data) : INITIAL_NILAI_LIST;
    } catch {
      return INITIAL_NILAI_LIST;
    }
  },

  saveNilaiList: (list: NilaiRecord[]) => {
    localStorage.setItem(STORAGE_KEYS.NILAI, JSON.stringify(list));
  },

  // Jurnal
  getJurnalList: (): JurnalRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JURNAL);
      return data ? JSON.parse(data) : INITIAL_JURNAL_LIST;
    } catch {
      return INITIAL_JURNAL_LIST;
    }
  },

  saveJurnalList: (list: JurnalRecord[]) => {
    localStorage.setItem(STORAGE_KEYS.JURNAL, JSON.stringify(list));
  },

  // Reset to default sample data
  resetToSampleData: () => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_GURU_LIST));
    localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(INITIAL_KELAS_LIST));
    localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(INITIAL_SISWA_LIST));
    localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(INITIAL_ABSENSI_LIST));
    localStorage.setItem(STORAGE_KEYS.NILAI, JSON.stringify(INITIAL_NILAI_LIST));
    localStorage.setItem(STORAGE_KEYS.JURNAL, JSON.stringify(INITIAL_JURNAL_LIST));
    localStorage.setItem(STORAGE_KEYS.KOP_SURAT, JSON.stringify(INITIAL_KOP_SURAT));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_GURU_LIST[0]));
  },

  exportDataAsJSON: (): string => {
    const data = {
      guru: StorageService.getGuruList(),
      kelas: StorageService.getKelasList(),
      siswa: StorageService.getSiswaList(),
      absensi: StorageService.getAbsensiList(),
      nilai: StorageService.getNilaiList(),
      jurnal: StorageService.getJurnalList(),
      kopSurat: StorageService.getKopSurat(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }
};
