import { Guru, Kelas, Siswa, AbsensiRecord, NilaiRecord, JurnalRecord, KopSuratConfig } from '../types';

export const INITIAL_KOP_SURAT: KopSuratConfig = {
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
  tahunAjaran: '2025/2026',
  semester: 'Genap',
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
};

export const INITIAL_GURU_LIST: Guru[] = [
  {
    id: 'guru-1',
    nama: 'Bambang Sugianto, M.Pd.',
    email: 'bambang@sekolah.sch.id',
    password: 'password123',
    nip: '19820415 200801 1 009',
    mapel: 'Informatika & Matematika',
    sekolah: 'SMAN 1 Teladan Nusantara',
    noHp: '081234567890',
  },
  {
    id: 'guru-2',
    nama: 'Siti Rahmawati, S.Pd.',
    email: 'siti@sekolah.sch.id',
    password: 'password123',
    nip: '19880920 201201 2 005',
    mapel: 'Bahasa Indonesia',
    sekolah: 'SMAN 1 Teladan Nusantara',
    noHp: '081298765432',
  }
];

export const INITIAL_KELAS_LIST: Kelas[] = [
  {
    id: 'k-1',
    nama: 'X MIPA 1',
    tingkat: '10',
    jurusan: 'MIPA',
    waliKelas: 'Bambang Sugianto, M.Pd.',
    noHpWaliKelas: '081234567890',
    tahunAjaran: '2025/2026',
    semester: 'Genap',
    ruangan: 'Lab Komputer 1',
  },
  {
    id: 'k-2',
    nama: 'X MIPA 2',
    tingkat: '10',
    jurusan: 'MIPA',
    waliKelas: 'Siti Rahmawati, S.Pd.',
    noHpWaliKelas: '081298765432',
    tahunAjaran: '2025/2026',
    semester: 'Genap',
    ruangan: 'Ruang Teori 102',
  },
  {
    id: 'k-3',
    nama: 'XI MIPA 1',
    tingkat: '11',
    jurusan: 'MIPA',
    waliKelas: 'Drs. Hendra Gunawan',
    noHpWaliKelas: '081377889900',
    tahunAjaran: '2025/2026',
    semester: 'Genap',
    ruangan: 'Ruang Teori 201',
  },
  {
    id: 'k-4',
    nama: 'XI IPS 1',
    tingkat: '11',
    jurusan: 'IPS',
    waliKelas: 'Nurul Hidayah, S.Sos.',
    noHpWaliKelas: '085712348899',
    tahunAjaran: '2025/2026',
    semester: 'Genap',
    ruangan: 'Ruang Teori 204',
  },
  {
    id: 'k-5',
    nama: 'XII RPL 1',
    tingkat: '12',
    jurusan: 'Rekayasa Perangkat Lunak',
    waliKelas: 'Ahmad Fauzi, S.Kom.',
    noHpWaliKelas: '081987654321',
    tahunAjaran: '2025/2026',
    semester: 'Genap',
    ruangan: 'Lab RPL',
  }
];

export const INITIAL_SISWA_LIST: Siswa[] = [
  // Kelas X MIPA 1 (k-1)
  { id: 's-101', kelasId: 'k-1', nisn: '0071234001', nama: 'Aditya Pratama', jenisKelamin: 'L', noHp: '081311110001', namaWali: 'Budi Pratama (Ayah)', noHpOrtu: '081211110001', status: 'Aktif' },
  { id: 's-102', kelasId: 'k-1', nisn: '0071234002', nama: 'Annisa Putri Maharani', jenisKelamin: 'P', noHp: '081311110002', namaWali: 'Yusuf Maharani (Ayah)', noHpOrtu: '081211110002', status: 'Aktif' },
  { id: 's-103', kelasId: 'k-1', nisn: '0071234003', nama: 'Bagas Satria Nugraha', jenisKelamin: 'L', noHp: '081311110003', namaWali: 'Agus Nugraha (Ayah)', noHpOrtu: '081211110003', status: 'Aktif' },
  { id: 's-104', kelasId: 'k-1', nisn: '0071234004', nama: 'Cantika Dewi Lestari', jenisKelamin: 'P', noHp: '081311110004', namaWali: 'Bambang Lestari (Ayah)', noHpOrtu: '081211110004', status: 'Aktif' },
  { id: 's-105', kelasId: 'k-1', nisn: '0071234005', nama: 'Dimas Arya Pamungkas', jenisKelamin: 'L', noHp: '081311110005', namaWali: 'Aryo Pamungkas (Ayah)', noHpOrtu: '081211110005', status: 'Aktif' },
  { id: 's-106', kelasId: 'k-1', nisn: '0071234006', nama: 'Fadhil Ihsan Maulana', jenisKelamin: 'L', noHp: '081311110006', namaWali: 'Maulana Malik (Ayah)', noHpOrtu: '081211110006', status: 'Aktif' },
  { id: 's-107', kelasId: 'k-1', nisn: '0071234007', nama: 'Gita Nurul Aini', jenisKelamin: 'P', noHp: '081311110007', namaWali: 'Surya Aini (Ibu)', noHpOrtu: '081211110007', status: 'Aktif' },
  { id: 's-108', kelasId: 'k-1', nisn: '0071234008', nama: 'Haikal Rasyid Al-Fath', jenisKelamin: 'L', noHp: '081311110008', namaWali: 'Rasyid Ridho (Ayah)', noHpOrtu: '081211110008', status: 'Aktif' },
  { id: 's-109', kelasId: 'k-1', nisn: '0071234009', nama: 'Intan Permata Sari', jenisKelamin: 'P', noHp: '081311110009', namaWali: 'Joko Susilo (Ayah)', noHpOrtu: '081211110009', status: 'Aktif' },
  { id: 's-110', kelasId: 'k-1', nisn: '0071234010', nama: 'Muhammad Rizky Ramadhan', jenisKelamin: 'L', noHp: '081311110010', namaWali: 'Ramadhan Ali (Ayah)', noHpOrtu: '081211110010', status: 'Aktif' },

  // Kelas X MIPA 2 (k-2)
  { id: 's-201', kelasId: 'k-2', nisn: '0072234001', nama: 'Ahmad Kevin Saputra', jenisKelamin: 'L', noHp: '081322220001', namaWali: 'Saputra Jaya (Ayah)', noHpOrtu: '081222220001', status: 'Aktif' },
  { id: 's-202', kelasId: 'k-2', nisn: '0072234002', nama: 'Bella Syahrini', jenisKelamin: 'P', noHp: '081322220002', namaWali: 'Syahrir (Ayah)', noHpOrtu: '081222220002', status: 'Aktif' },
  { id: 's-203', kelasId: 'k-2', nisn: '0072234003', nama: 'Daffa Raihan', jenisKelamin: 'L', noHp: '081322220003', namaWali: 'Raihan Hadi (Ayah)', noHpOrtu: '081222220003', status: 'Aktif' },
  { id: 's-204', kelasId: 'k-2', nisn: '0072234004', nama: 'Eka Novitasari', jenisKelamin: 'P', noHp: '081322220004', namaWali: 'Novri (Ayah)', noHpOrtu: '081222220004', status: 'Aktif' },
  { id: 's-205', kelasId: 'k-2', nisn: '0072234005', nama: 'Fajar Kurniawan', jenisKelamin: 'L', noHp: '081322220005', namaWali: 'Kurnia (Ayah)', noHpOrtu: '081222220005', status: 'Aktif' },

  // Kelas XI MIPA 1 (k-3)
  { id: 's-301', kelasId: 'k-3', nisn: '0063234001', nama: 'Alifia Zahra', jenisKelamin: 'P', noHp: '081333330001', namaWali: 'Zahrudin (Ayah)', noHpOrtu: '081233330001', status: 'Aktif' },
  { id: 's-302', kelasId: 'k-3', nisn: '0063234002', nama: 'Bayu Segara', jenisKelamin: 'L', noHp: '081333330002', namaWali: 'Segara (Ayah)', noHpOrtu: '081233330002', status: 'Aktif' },
  { id: 's-303', kelasId: 'k-3', nisn: '0063234003', nama: 'Citra Kirana', jenisKelamin: 'P', noHp: '081333330003', namaWali: 'Kirana (Ibu)', noHpOrtu: '081233330003', status: 'Aktif' },
  { id: 's-304', kelasId: 'k-3', nisn: '0063234004', nama: 'Danang Wicaksono', jenisKelamin: 'L', noHp: '081333330004', namaWali: 'Wicaksono (Ayah)', noHpOrtu: '081233330004', status: 'Aktif' },

  // Kelas XI IPS 1 (k-4)
  { id: 's-401', kelasId: 'k-4', nisn: '0064234001', nama: 'Galang Rambu Anarki', jenisKelamin: 'L', noHp: '081344440001', namaWali: 'Iwan (Ayah)', noHpOrtu: '081244440001', status: 'Aktif' },
  { id: 's-402', kelasId: 'k-4', nisn: '0064234002', nama: 'Hana Marwah', jenisKelamin: 'P', noHp: '081344440002', namaWali: 'Marwan (Ayah)', noHpOrtu: '081244440002', status: 'Aktif' },

  // Kelas XII RPL 1 (k-5)
  { id: 's-501', kelasId: 'k-5', nisn: '0055234001', nama: 'Irfan Hakim Coding', jenisKelamin: 'L', noHp: '081355550001', namaWali: 'Hakim (Ayah)', noHpOrtu: '081255550001', status: 'Aktif' },
  { id: 's-502', kelasId: 'k-5', nisn: '0055234002', nama: 'Jessica Developer', jenisKelamin: 'P', noHp: '081355550002', namaWali: 'David (Ayah)', noHpOrtu: '081255550002', status: 'Aktif' }
];

export const getTodayString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const INITIAL_ABSENSI_LIST: AbsensiRecord[] = [
  { id: 'ab-1', kelasId: 'k-1', siswaId: 's-101', tanggal: getTodayString(), status: 'H', keterangan: 'Tepat waktu', waktuCatat: '07:15' },
  { id: 'ab-2', kelasId: 'k-1', siswaId: 's-102', tanggal: getTodayString(), status: 'H', keterangan: 'Tepat waktu', waktuCatat: '07:18' },
  { id: 'ab-3', kelasId: 'k-1', siswaId: 's-103', tanggal: getTodayString(), status: 'S', keterangan: 'Demam (Surat Dokter terlampir)', waktuCatat: '07:30' },
  { id: 'ab-4', kelasId: 'k-1', siswaId: 's-104', tanggal: getTodayString(), status: 'H', keterangan: 'Tepat waktu', waktuCatat: '07:10' },
  { id: 'ab-5', kelasId: 'k-1', siswaId: 's-105', tanggal: getTodayString(), status: 'I', keterangan: 'Izin urusan keluarga ke luar kota', waktuCatat: '07:25' },
  { id: 'ab-6', kelasId: 'k-1', siswaId: 's-106', tanggal: getTodayString(), status: 'H', keterangan: 'Tepat waktu', waktuCatat: '07:05' },
  { id: 'ab-7', kelasId: 'k-1', siswaId: 's-107', tanggal: getTodayString(), status: 'H', keterangan: 'Tepat waktu', waktuCatat: '07:12' },
  { id: 'ab-8', kelasId: 'k-1', siswaId: 's-108', tanggal: getTodayString(), status: 'H', keterangan: 'Tepat waktu', waktuCatat: '07:20' },
  { id: 'ab-9', kelasId: 'k-1', siswaId: 's-109', tanggal: getTodayString(), status: 'H', keterangan: 'Tepat waktu', waktuCatat: '07:14' },
  { id: 'ab-10', kelasId: 'k-1', siswaId: 's-110', tanggal: getTodayString(), status: 'H', keterangan: 'Tepat waktu', waktuCatat: '07:22' }
];

export const calculateNilaiAkhir = (
  t1: number = 0,
  t2: number = 0,
  t3: number = 0,
  t4: number = 0,
  u1: number = 0,
  u2: number = 0,
  u3: number = 0,
  u4: number = 0,
  pts: number = 0,
  pas: number = 0,
  kkm: number = 75
) => {
  // Bobot: Rata-rata 4 Tugas (20%) + Rata-rata 4 UH (20%) + PTS (30%) + PAS (30%)
  const avgTugas = (t1 + t2 + t3 + t4) / 4;
  const avgUH = (u1 + u2 + u3 + u4) / 4;
  const akhir = (avgTugas * 0.2) + (avgUH * 0.2) + (pts * 0.3) + (pas * 0.3);
  const rounded = Math.round(akhir * 10) / 10;
  
  let predikat: 'A' | 'B' | 'C' | 'D' = 'D';
  if (rounded >= 88) predikat = 'A';
  else if (rounded >= 78) predikat = 'B';
  else if (rounded >= 68) predikat = 'C';
  else predikat = 'D';

  const statusLulus = rounded >= kkm;

  return { nilaiAkhir: rounded, predikat, statusLulus };
};

export const INITIAL_NILAI_LIST: NilaiRecord[] = [
  {
    id: 'nil-101',
    kelasId: 'k-1',
    siswaId: 's-101',
    mapel: 'Informatika',
    tugas1: 85,
    tugas2: 90,
    tugas3: 88,
    tugas4: 86,
    uh1: 88,
    uh2: 84,
    uh3: 86,
    uh4: 88,
    pts: 86,
    pas: 92,
    ...calculateNilaiAkhir(85, 90, 88, 86, 88, 84, 86, 88, 86, 92),
    catatan: 'Pemahaman logika pemrograman sangat baik.'
  },
  {
    id: 'nil-102',
    kelasId: 'k-1',
    siswaId: 's-102',
    mapel: 'Informatika',
    tugas1: 92,
    tugas2: 95,
    tugas3: 94,
    tugas4: 96,
    uh1: 90,
    uh2: 92,
    uh3: 94,
    uh4: 95,
    pts: 94,
    pas: 96,
    ...calculateNilaiAkhir(92, 95, 94, 96, 90, 92, 94, 95, 94, 96),
    catatan: 'Sangat teliti dan aktif dalam proyek tim.'
  },
  {
    id: 'nil-103',
    kelasId: 'k-1',
    siswaId: 's-103',
    mapel: 'Informatika',
    tugas1: 75,
    tugas2: 80,
    tugas3: 78,
    tugas4: 76,
    uh1: 72,
    uh2: 76,
    uh3: 74,
    uh4: 75,
    pts: 74,
    pas: 78,
    ...calculateNilaiAkhir(75, 80, 78, 76, 72, 76, 74, 75, 74, 78),
    catatan: 'Tingkatkan latihan algoritma dasar.'
  },
  {
    id: 'nil-104',
    kelasId: 'k-1',
    siswaId: 's-104',
    mapel: 'Informatika',
    tugas1: 88,
    tugas2: 86,
    tugas3: 89,
    tugas4: 90,
    uh1: 85,
    uh2: 89,
    uh3: 88,
    uh4: 87,
    pts: 87,
    pas: 90,
    ...calculateNilaiAkhir(88, 86, 89, 90, 85, 89, 88, 87, 87, 90),
    catatan: 'Penyusunan basis data sangat rapi.'
  },
  {
    id: 'nil-105',
    kelasId: 'k-1',
    siswaId: 's-105',
    mapel: 'Informatika',
    tugas1: 80,
    tugas2: 82,
    tugas3: 84,
    tugas4: 81,
    uh1: 78,
    uh2: 80,
    uh3: 82,
    uh4: 80,
    pts: 82,
    pas: 85,
    ...calculateNilaiAkhir(80, 82, 84, 81, 78, 80, 82, 80, 82, 85),
    catatan: 'Cukup antusias dan konsisten.'
  },
  {
    id: 'nil-106',
    kelasId: 'k-1',
    siswaId: 's-106',
    mapel: 'Informatika',
    tugas1: 95,
    tugas2: 96,
    tugas3: 98,
    tugas4: 97,
    uh1: 94,
    uh2: 98,
    uh3: 96,
    uh4: 97,
    pts: 95,
    pas: 98,
    ...calculateNilaiAkhir(95, 96, 98, 97, 94, 98, 96, 97, 95, 98),
    catatan: 'Siswa berbakat dalam pemecahan masalah komputasi.'
  },
  {
    id: 'nil-107',
    kelasId: 'k-1',
    siswaId: 's-107',
    mapel: 'Informatika',
    tugas1: 82,
    tugas2: 85,
    tugas3: 83,
    tugas4: 86,
    uh1: 80,
    uh2: 84,
    uh3: 85,
    uh4: 82,
    pts: 83,
    pas: 86,
    ...calculateNilaiAkhir(82, 85, 83, 86, 80, 84, 85, 82, 83, 86),
    catatan: 'Pertahankan kedisiplinan tugas.'
  },
  {
    id: 'nil-108',
    kelasId: 'k-1',
    siswaId: 's-108',
    mapel: 'Informatika',
    tugas1: 70,
    tugas2: 72,
    tugas3: 74,
    tugas4: 73,
    uh1: 68,
    uh2: 74,
    uh3: 70,
    uh4: 72,
    pts: 71,
    pas: 75,
    ...calculateNilaiAkhir(70, 72, 74, 73, 68, 74, 70, 72, 71, 75),
    catatan: 'Perlu pengayaan pada konsep percabangan dan perulangan.'
  },
  {
    id: 'nil-109',
    kelasId: 'k-1',
    siswaId: 's-109',
    mapel: 'Informatika',
    tugas1: 89,
    tugas2: 91,
    tugas3: 90,
    tugas4: 92,
    uh1: 87,
    uh2: 90,
    uh3: 89,
    uh4: 91,
    pts: 88,
    pas: 92,
    ...calculateNilaiAkhir(89, 91, 90, 92, 87, 90, 89, 91, 88, 92),
    catatan: 'Sangat baik dalam implementasi desain UI.'
  },
  {
    id: 'nil-110',
    kelasId: 'k-1',
    siswaId: 's-110',
    mapel: 'Informatika',
    tugas1: 84,
    tugas2: 88,
    tugas3: 86,
    tugas4: 87,
    uh1: 82,
    uh2: 85,
    uh3: 84,
    uh4: 86,
    pts: 86,
    pas: 89,
    ...calculateNilaiAkhir(84, 88, 86, 87, 82, 85, 84, 86, 86, 89),
    catatan: 'Penyampaian presentasi tugas kelompok sangat bagus.'
  }
];

export const INITIAL_JURNAL_LIST: JurnalRecord[] = [
  {
    id: 'jur-1',
    guruId: 'guru-1',
    kelasId: 'k-1',
    tanggal: getTodayString(),
    jamKe: '1 - 3 (07:15 - 09:30)',
    mapel: 'Informatika',
    materiPokok: 'Pengenalan Algoritma & Flowchart Pemrograman',
    capaianPembelajaran: 'Siswa mampu merancang diagram alir (flowchart) untuk menyelesaikan persoalan aritmatika sederhana.',
    jumlahHadir: 8,
    jumlahTidakHadir: 2,
    kendala: 'Beberapa siswa masih tertukar antara simbol proses dan simbol keputusan pada flowchart.',
    solusi: 'Diberikan lembar kerja interaktif dan studi kasus visual bertahap.',
    statusKetercapaian: 'Tercapai'
  },
  {
    id: 'jur-2',
    guruId: 'guru-1',
    kelasId: 'k-2',
    tanggal: getTodayString(),
    jamKe: '4 - 5 (09:45 - 11:15)',
    mapel: 'Informatika',
    materiPokok: 'Struktur Data Larik (Array) & Tipe Data Dasar',
    capaianPembelajaran: 'Peserta didik memahami konsep indeks array dan pengalokasian memori data.',
    jumlahHadir: 5,
    jumlahTidakHadir: 0,
    kendala: 'Waktu lab terpotong sedikit karena kendala jaringan di awal pembelajaran.',
    solusi: 'Menggunakan compiler lokal offline sehingga praktikum berjalan lancar.',
    statusKetercapaian: 'Tercapai'
  },
  {
    id: 'jur-3',
    guruId: 'guru-1',
    kelasId: 'k-5',
    tanggal: getTodayString(),
    jamKe: '7 - 9 (13:00 - 15:15)',
    mapel: 'Pemrograman Web (RPL)',
    materiPokok: 'Integrasi Google Apps Script Web App dengan Google Sheets',
    capaianPembelajaran: 'Siswa dapat membuat endpoint doGet() dan doPost() untuk membaca serta menulis data spreadsheet.',
    jumlahHadir: 2,
    jumlahTidakHadir: 0,
    kendala: 'Pengaturan CORS dan izin otorisasi script Google.',
    solusi: 'Demonstrasi langkah deployment Web App dengan opsi "Execute as Me" dan "Anyone".',
    statusKetercapaian: 'Tercapai'
  }
];
