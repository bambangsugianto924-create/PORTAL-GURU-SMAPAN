export interface Guru {
  id: string;
  nama: string;
  email: string;
  password?: string;
  nip: string;
  mapel: string;
  sekolah: string;
  noHp: string;
  fotoUrl?: string;
}

export interface Kelas {
  id: string;
  nama: string; // e.g. "X MIPA 1"
  tingkat: string; // e.g. "10", "11", "12"
  jurusan: string; // e.g. "MIPA", "IPS", "TKJ"
  waliKelas: string;
  noHpWaliKelas?: string;
  tahunAjaran: string; // e.g. "2025/2026"
  semester: 'Ganjil' | 'Genap';
  ruangan: string;
}

export interface Siswa {
  id: string;
  kelasId: string;
  nisn: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  noHp?: string;
  namaWali?: string;
  noHpOrtu?: string;
  status: 'Aktif' | 'Nonaktif';
}

export type StatusAbsen = 'H' | 'I' | 'S' | 'A';

export interface AbsensiRecord {
  id: string;
  kelasId: string;
  siswaId: string;
  tanggal: string; // YYYY-MM-DD
  status: StatusAbsen;
  keterangan: string;
  waktuCatat: string;
}

export interface NilaiRecord {
  id: string;
  kelasId: string;
  siswaId: string;
  mapel: string;
  tugas1: number;
  tugas2: number;
  tugas3: number;
  tugas4: number;
  uh1: number;
  uh2: number;
  uh3: number;
  uh4: number;
  pts: number;
  pas: number;
  nilaiAkhir: number;
  predikat: 'A' | 'B' | 'C' | 'D';
  statusLulus: boolean;
  catatan?: string;
}

export type StatusKetercapaian = 'Tercapai' | 'Sebagian' | 'Belum';

export interface JurnalRecord {
  id: string;
  guruId: string;
  kelasId: string;
  tanggal: string; // YYYY-MM-DD
  jamKe: string; // e.g. "1 - 3 (07:30 - 09:45)"
  mapel: string;
  materiPokok: string;
  capaianPembelajaran: string;
  jumlahHadir: number;
  jumlahTidakHadir: number;
  kendala: string;
  solusi: string;
  statusKetercapaian: StatusKetercapaian;
}

export type LogoTypeOption = 'tutwuri' | 'kemenag' | 'garuda' | 'pemda' | 'sekolah' | 'vokasi' | 'custom' | 'none';

export interface KopSuratConfig {
  pemerintah: string;
  dinas: string;
  namaSekolah: string;
  alamat: string;
  kota: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  email: string;
  website: string;
  akreditasi: string;
  npsn: string;
  // Logo Kiri
  logoUrl: string;
  logoType: LogoTypeOption;
  tampilkanLogo: boolean;
  tampilkanLogoKiri?: boolean;
  // Logo Kanan
  logoKananUrl?: string;
  logoKananType?: LogoTypeOption;
  tampilkanLogoKanan?: boolean;
  // Pengaturan Ukuran Logo
  ukuranLogo?: 'kecil' | 'standar' | 'besar';
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  tampilkanGarisGanda: boolean;
}

export type ActiveTab = 'dashboard' | 'kelas' | 'siswa' | 'absen' | 'nilai' | 'jurnal' | 'rekap' | 'laporan-wa' | 'gas-generator' | 'profil';
