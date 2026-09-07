import { Guru, Kelas, Siswa, AbsensiRecord, NilaiRecord, KopSuratConfig, StatusAbsen } from '../types';

export type WhatsAppReportType =
  | 'presensi_ortu'
  | 'rekap_presensi_ortu'
  | 'nilai_ortu'
  | 'alert_presensi_ortu'
  | 'alert_nilai_ortu'
  | 'presensi_wali_kelas'
  | 'nilai_wali_kelas'
  | 'kustom';

/**
 * Format string nomor telepon ke standar WhatsApp internasional (contoh: 081234567890 -> 6281234567890)
 */
export const formatPhoneForWA = (phone?: string): string => {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
};

/**
 * Generate URL link langsung ke WhatsApp Web / Desktop / Mobile
 */
export const getWhatsAppUrl = (phone: string, message: string): string => {
  const cleanPhone = formatPhoneForWA(phone);
  const encodedText = encodeURIComponent(message);
  return cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;
};

/**
 * Generate URL link langsung ke WhatsApp Web khusus browser desktop
 */
export const getWhatsAppWebUrl = (phone: string, message: string): string => {
  const cleanPhone = formatPhoneForWA(phone);
  const encodedText = encodeURIComponent(message);
  return cleanPhone
    ? `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
    : `https://web.whatsapp.com/send?text=${encodedText}`;
};

/**
 * Generate short URL wa.me resmi
 */
export const getWaMeUrl = (phone: string, message: string): string => {
  const cleanPhone = formatPhoneForWA(phone);
  const encodedText = encodeURIComponent(message);
  return cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
};

/**
 * Format tanggal Indonesia ramah pengguna
 */
export const formatDateIndo = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(d);
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

const getSchoolName = (kopSurat?: KopSuratConfig): string => {
  return kopSurat?.namaSekolah ? kopSurat.namaSekolah.toUpperCase() : 'SEKOLAH';
};

const getStatusAbsenText = (status: StatusAbsen): { label: string; emoji: string } => {
  switch (status) {
    case 'H':
      return { label: 'HADIR (Tepat Waktu)', emoji: '✅' };
    case 'I':
      return { label: 'IZIN', emoji: 'ℹ️' };
    case 'S':
      return { label: 'SAKIT', emoji: '🏥' };
    case 'A':
      return { label: 'ALPA (Tanpa Keterangan)', emoji: '❌' };
    default:
      return { label: 'HADIR', emoji: '✅' };
  }
};

// 1. Laporan Presensi Harian Siswa ke Orang Tua
export const generatePresensiOrtuMessage = (params: {
  siswa: Siswa;
  kelas: Kelas;
  tanggal: string;
  absensiRecord?: AbsensiRecord;
  guru: Guru;
  kopSurat: KopSuratConfig;
  catatanTambahan?: string;
}): string => {
  const { siswa, kelas, tanggal, absensiRecord, guru, kopSurat, catatanTambahan } = params;
  const status = absensiRecord ? absensiRecord.status : 'H';
  const keterangan = absensiRecord?.keterangan || (status === 'H' ? 'Hadir mengikuti KBM dengan tertib' : '-');
  const statusInfo = getStatusAbsenText(status);

  let msg = `*LAPORAN KEHADIRAN SISWA*\n`;
  msg += `🏫 *${getSchoolName(kopSurat)}*\n`;
  msg += `──────────────────────────────\n`;
  msg += `Yth. Bapak/Ibu Orang Tua / Wali dari:\n`;
  msg += `👤 *${siswa.nama}*\n`;
  msg += `🆔 NISN: *${siswa.nisn}*\n`;
  msg += `📚 Kelas: *${kelas.nama}* (${kelas.jurusan})\n`;
  msg += `📖 Mata Pelajaran: *${guru.mapel}*\n\n`;

  msg += `📅 *Tanggal:* ${formatDateIndo(tanggal)}\n`;
  msg += `📍 *Status Kehadiran:* ${statusInfo.emoji} *${statusInfo.label}*\n`;
  msg += `📝 *Keterangan:* ${keterangan}\n`;

  if (catatanTambahan && catatanTambahan.trim()) {
    msg += `\n💬 *Pesan Khusus Guru:*\n"${catatanTambahan.trim()}"\n`;
  }

  msg += `──────────────────────────────\n`;
  msg += `_Laporan ini dikirimkan otomatis sebagai bentuk koordinasi dan transparansi antara sekolah dan orang tua murid._\n\n`;
  msg += `Salam hormat,\n`;
  msg += `👨‍🏫 *${guru.nama}*\n`;
  msg += `Guru Pengampu • ${guru.mapel}\n`;
  if (guru.noHp) msg += `📞 Kontak: ${guru.noHp}`;

  return msg;
};

// 2. Laporan Rekapitulasi Presensi Semester ke Orang Tua
export const generateRekapPresensiOrtuMessage = (params: {
  siswa: Siswa;
  kelas: Kelas;
  absensiList: AbsensiRecord[];
  guru: Guru;
  kopSurat: KopSuratConfig;
  catatanTambahan?: string;
}): string => {
  const { siswa, kelas, absensiList, guru, kopSurat, catatanTambahan } = params;
  const studentAbsen = absensiList.filter(a => a.siswaId === siswa.id);
  const h = studentAbsen.filter(a => a.status === 'H').length;
  const i = studentAbsen.filter(a => a.status === 'I').length;
  const s = studentAbsen.filter(a => a.status === 'S').length;
  const a = studentAbsen.filter(a => a.status === 'A').length;
  const total = h + i + s + a;
  const persen = total > 0 ? Math.round((h / total) * 100) : 100;
  const statusKeterangan = persen >= 85 ? 'Sangat Baik' : persen >= 75 ? 'Cukup / Memenuhi Syarat' : 'Perlu Perhatian Khusus';

  let msg = `*REKAPITULASI KEHADIRAN SISWA*\n`;
  msg += `🏫 *${getSchoolName(kopSurat)}*\n`;
  msg += `──────────────────────────────\n`;
  msg += `Yth. Bapak/Ibu Wali dari *${siswa.nama}*\n`;
  msg += `📚 Kelas: *${kelas.nama}* | Semester: ${kelas.semester} ${kelas.tahunAjaran}\n`;
  msg += `📖 Mata Pelajaran: *${guru.mapel}*\n\n`;

  msg += `📊 *Ringkasan Akumulasi Kehadiran:*\n`;
  msg += `• Total Pertemuan: *${total} Kali Pertemuan*\n`;
  msg += `• ✅ Hadir: *${h} Hari*\n`;
  msg += `• ℹ️ Izin: *${i} Hari*\n`;
  msg += `• 🏥 Sakit: *${s} Hari*\n`;
  msg += `• ❌ Alpa: *${a} Hari*\n`;
  msg += `• 📈 Tingkat Kehadiran: *${persen}%* (${statusKeterangan})\n`;

  if (catatanTambahan && catatanTambahan.trim()) {
    msg += `\n💬 *Catatan Guru:*\n"${catatanTambahan.trim()}"\n`;
  }

  msg += `──────────────────────────────\n`;
  msg += `Hormat kami,\n`;
  msg += `👨‍🏫 *${guru.nama}*\n`;
  msg += `Guru Pengampu ${guru.mapel}`;

  return msg;
};

// 3. Laporan Nilai / Rapor Ringkas Siswa ke Orang Tua
export const generateNilaiOrtuMessage = (params: {
  siswa: Siswa;
  kelas: Kelas;
  nilaiRecord?: NilaiRecord;
  guru: Guru;
  kopSurat: KopSuratConfig;
  kkm?: number;
  catatanTambahan?: string;
}): string => {
  const { siswa, kelas, nilaiRecord, guru, kopSurat, catatanTambahan } = params;
  const kkm = params.kkm || 75;
  const n = nilaiRecord || {
    tugas1: 85, tugas2: 85, tugas3: 85, tugas4: 85,
    uh1: 80, uh2: 80, uh3: 80, uh4: 80,
    pts: 85, pas: 85, nilaiAkhir: 83.5, predikat: 'B' as const, statusLulus: true,
    catatan: 'Hasil belajar konsisten dan aktif di kelas.'
  };

  let msg = `*LAPORAN HASIL BELAJAR & NILAI SISWA*\n`;
  msg += `🏫 *${getSchoolName(kopSurat)}*\n`;
  msg += `──────────────────────────────\n`;
  msg += `Yth. Bapak/Ibu Orang Tua / Wali dari:\n`;
  msg += `👤 *${siswa.nama}*\n`;
  msg += `🆔 NISN: *${siswa.nisn}*\n`;
  msg += `📚 Kelas: *${kelas.nama}*\n`;
  msg += `📖 Mata Pelajaran: *${guru.mapel}*\n\n`;

  msg += `📋 *Rincian Perolehan Nilai:*\n`;
  msg += `┌─ 📝 *TUGAS / FORMATIF (Bobot 20%)*\n`;
  msg += `│  • Tugas 1: *${n.tugas1}*\n`;
  msg += `│  • Tugas 2: *${n.tugas2}*\n`;
  msg += `│  • Tugas 3: *${n.tugas3}*\n`;
  msg += `│  • Tugas 4: *${n.tugas4}*\n`;
  msg += `├─ 📑 *ULANGAN HARIAN / SUMATIF (Bobot 20%)*\n`;
  msg += `│  • UH 1: *${n.uh1}*\n`;
  msg += `│  • UH 2: *${n.uh2}*\n`;
  msg += `│  • UH 3: *${n.uh3}*\n`;
  msg += `│  • UH 4: *${n.uh4}*\n`;
  msg += `├─ 🎯 *PENILAIAN TENGAH SEMESTER (30%)*\n`;
  msg += `│  • PTS: *${n.pts}*\n`;
  msg += `└─ 🏆 *PENILAIAN AKHIR SEMESTER (30%)*\n`;
  msg += `   • PAS: *${n.pas}*\n\n`;

  const isLulus = n.nilaiAkhir >= kkm || n.statusLulus;
  msg += `⭐ *NILAI AKHIR: ${n.nilaiAkhir}*\n`;
  msg += `🎖️ *Predikat: ${n.predikat}*\n`;
  msg += `📌 *Status Ketuntasan:* ${isLulus ? `✅ *TUNTAS (Memenuhi KKM ${kkm})*` : `⚠️ *BELUM TUNTAS (Perlu Pengayaan/Remedial)*`}\n\n`;

  if (n.catatan && n.catatan.trim()) {
    msg += `📝 *Catatan Perkembangan Siswa:*\n"${n.catatan.trim()}"\n`;
  }

  if (catatanTambahan && catatanTambahan.trim()) {
    msg += `\n💬 *Pesan Tambahan:*\n"${catatanTambahan.trim()}"\n`;
  }

  msg += `──────────────────────────────\n`;
  msg += `_Semoga ananda terus bersemangat meraih prestasi terbaik._\n\n`;
  msg += `Hormat kami,\n`;
  msg += `👨‍🏫 *${guru.nama}*\n`;
  msg += `Guru Pengampu • ${guru.mapel}`;

  return msg;
};

// 4. Alert Notifikasi Khusus (Siswa Alpa / Tidak Hadir)
export const generateAlertPresensiOrtuMessage = (params: {
  siswa: Siswa;
  kelas: Kelas;
  tanggal: string;
  status: StatusAbsen;
  keterangan: string;
  guru: Guru;
  kopSurat: KopSuratConfig;
  catatanTambahan?: string;
}): string => {
  const { siswa, kelas, tanggal, status, keterangan, guru, kopSurat, catatanTambahan } = params;
  const statusLabel = status === 'A' ? 'ALPA (Tanpa Keterangan)' : status === 'S' ? 'SAKIT' : 'IZIN';

  let msg = `⚠️ *PEMBERITAHUAN KETIDAKHADIRAN SISWA*\n`;
  msg += `🏫 *${getSchoolName(kopSurat)}*\n`;
  msg += `──────────────────────────────\n`;
  msg += `Yth. Bapak/Ibu Orang Tua / Wali dari:\n`;
  msg += `👤 *${siswa.nama}* (Kelas: *${kelas.nama}*)\n\n`;

  msg += `Kami menginformasikan bahwa pada hari *${formatDateIndo(tanggal)}*, ananda tercatat *${statusLabel}* pada jam pelajaran *${guru.mapel}*.\n`;
  if (keterangan && keterangan.trim()) {
    msg += `Keterangan tercatat: _${keterangan}_\n`;
  }

  msg += `\nMohon konfirmasi atau penjelasan dari Bapak/Ibu melalui balasan pesan ini demi kelancaran dan keselamatan ananda dalam proses belajar mengajar.\n`;

  if (catatanTambahan && catatanTambahan.trim()) {
    msg += `\n💬 *Pesan Khusus:*\n"${catatanTambahan.trim()}"\n`;
  }

  msg += `──────────────────────────────\n`;
  msg += `Terima kasih atas kerjasama dan perhatian Bapak/Ibu.\n\n`;
  msg += `Salam hormat,\n`;
  msg += `👨‍🏫 *${guru.nama}*\n`;
  msg += `📞 Kontak: ${guru.noHp || '-'}`;

  return msg;
};

// 5. Alert Notifikasi Nilai di Bawah KKM / Butuh Remedial
export const generateAlertNilaiOrtuMessage = (params: {
  siswa: Siswa;
  kelas: Kelas;
  nilaiRecord?: NilaiRecord;
  guru: Guru;
  kopSurat: KopSuratConfig;
  kkm?: number;
  catatanTambahan?: string;
}): string => {
  const { siswa, kelas, nilaiRecord, guru, kopSurat, catatanTambahan } = params;
  const kkm = params.kkm || 75;
  const akhir = nilaiRecord ? nilaiRecord.nilaiAkhir : 65;

  let msg = `📢 *INFORMASI PENDAMPINGAN BELAJAR & REMEDIAL*\n`;
  msg += `🏫 *${getSchoolName(kopSurat)}*\n`;
  msg += `──────────────────────────────\n`;
  msg += `Yth. Bapak/Ibu Orang Tua / Wali dari:\n`;
  msg += `👤 *${siswa.nama}* (Kelas: *${kelas.nama}*)\n\n`;

  msg += `Kami menyampaikan bahwa capaian nilai ananda pada mata pelajaran *${guru.mapel}* saat ini adalah *${akhir}* (Standar KKM Sekolah: ${kkm}).\n\n`;
  msg += `Untuk itu, kami memohon dukungan Bapak/Ibu di rumah agar ananda dapat mengikuti program *Remedial / Perbaikan Nilai* yang akan kami laksanakan.\n`;

  if (catatanTambahan && catatanTambahan.trim()) {
    msg += `\n📝 *Petunjuk Guru:*\n"${catatanTambahan.trim()}"\n`;
  }

  msg += `──────────────────────────────\n`;
  msg += `Mari bersama-sama membimbing ananda agar mencapai potensi terbaiknya.\n\n`;
  msg += `Hormat kami,\n`;
  msg += `👨‍🏫 *${guru.nama}*\n`;
  msg += `Guru Pengampu • ${guru.mapel}`;

  return msg;
};

// 6. Laporan Presensi Harian Kelas ke Wali Kelas
export const generatePresensiWaliKelasMessage = (params: {
  kelas: Kelas;
  tanggal: string;
  classStudents: Siswa[];
  absensiList: AbsensiRecord[];
  guru: Guru;
  kopSurat: KopSuratConfig;
  catatanTambahan?: string;
}): string => {
  const { kelas, tanggal, classStudents, absensiList, guru, kopSurat, catatanTambahan } = params;
  const todayRecords = absensiList.filter(a => a.kelasId === kelas.id && a.tanggal === tanggal);

  const hadirList = classStudents.filter(s => {
    const r = todayRecords.find(a => a.siswaId === s.id);
    return !r || r.status === 'H';
  });
  const izinList = classStudents.filter(s => todayRecords.find(a => a.siswaId === s.id)?.status === 'I');
  const sakitList = classStudents.filter(s => todayRecords.find(a => a.siswaId === s.id)?.status === 'S');
  const alpaList = classStudents.filter(s => todayRecords.find(a => a.siswaId === s.id)?.status === 'A');

  const total = classStudents.length;
  const hadirCount = hadirList.length;
  const persenHadir = total > 0 ? Math.round((hadirCount / total) * 100) : 0;

  let msg = `*LAPORAN PRESENSI HARIAN KELAS ${kelas.nama.toUpperCase()}*\n`;
  msg += `🏫 *${getSchoolName(kopSurat)}*\n`;
  msg += `──────────────────────────────\n`;
  msg += `Kepada Yth. Wali Kelas: *${kelas.waliKelas}*\n`;
  msg += `📖 Mata Pelajaran: *${guru.mapel}*\n`;
  msg += `📅 Tanggal: *${formatDateIndo(tanggal)}*\n\n`;

  msg += `📊 *Ringkasan Kehadiran:*\n`;
  msg += `• Total Siswa: *${total} Orang*\n`;
  msg += `• ✅ Hadir: *${hadirCount} Orang* (${persenHadir}%)\n`;
  msg += `• ℹ️ Izin: *${izinList.length} Orang*\n`;
  msg += `• 🏥 Sakit: *${sakitList.length} Orang*\n`;
  msg += `• ❌ Alpa: *${alpaList.length} Orang*\n\n`;

  if (izinList.length > 0 || sakitList.length > 0 || alpaList.length > 0) {
    msg += `📋 *Rincian Siswa Tidak Hadir:*\n`;
    if (alpaList.length > 0) {
      msg += `🔴 *ALPA:*\n`;
      alpaList.forEach((s, idx) => {
        const rec = todayRecords.find(a => a.siswaId === s.id);
        msg += `  ${idx + 1}. ${s.nama} ${rec?.keterangan ? `(${rec.keterangan})` : ''}\n`;
      });
    }
    if (sakitList.length > 0) {
      msg += `🟡 *SAKIT:*\n`;
      sakitList.forEach((s, idx) => {
        const rec = todayRecords.find(a => a.siswaId === s.id);
        msg += `  ${idx + 1}. ${s.nama} ${rec?.keterangan ? `(${rec.keterangan})` : ''}\n`;
      });
    }
    if (izinList.length > 0) {
      msg += `🔵 *IZIN:*\n`;
      izinList.forEach((s, idx) => {
        const rec = todayRecords.find(a => a.siswaId === s.id);
        msg += `  ${idx + 1}. ${s.nama} ${rec?.keterangan ? `(${rec.keterangan})` : ''}\n`;
      });
    }
  } else {
    msg += `🎉 *Alhamdulillah, seluruh siswa kelas ${kelas.nama} HADIR LENGKAP 100%!* ✨\n`;
  }

  if (catatanTambahan && catatanTambahan.trim()) {
    msg += `\n📝 *Catatan Tambahan Pengajar:*\n"${catatanTambahan.trim()}"\n`;
  }

  msg += `──────────────────────────────\n`;
  msg += `Salam sejawat,\n`;
  msg += `👨‍🏫 *${guru.nama}*\n`;
  msg += `Guru Pengampu • ${guru.mapel}`;

  return msg;
};

// 7. Laporan Rekap Nilai Kelas ke Wali Kelas
export const generateNilaiWaliKelasMessage = (params: {
  kelas: Kelas;
  classStudents: Siswa[];
  nilaiList: NilaiRecord[];
  guru: Guru;
  kopSurat: KopSuratConfig;
  kkm?: number;
  catatanTambahan?: string;
}): string => {
  const { kelas, classStudents, nilaiList, guru, kopSurat, catatanTambahan } = params;
  const kkm = params.kkm || 75;
  const classNilai = classStudents.map(s => {
    return nilaiList.find(n => n.siswaId === s.id) || {
      nilaiAkhir: 80,
      predikat: 'B',
      statusLulus: true,
      siswaId: s.id,
      nama: s.nama
    };
  });

  const total = classNilai.length;
  const sum = classNilai.reduce((acc, curr) => acc + curr.nilaiAkhir, 0);
  const avg = total > 0 ? (sum / total).toFixed(1) : '0';
  const tuntasList = classNilai.filter(n => n.nilaiAkhir >= kkm || n.statusLulus);
  const belumTuntasList = classNilai.filter(n => n.nilaiAkhir < kkm || !n.statusLulus);
  const tuntasRate = total > 0 ? Math.round((tuntasList.length / total) * 100) : 0;

  // Best & Lowest
  const sorted = [...classNilai].sort((a, b) => b.nilaiAkhir - a.nilaiAkhir);
  const topSiswa = sorted[0];
  const lowSiswa = sorted[sorted.length - 1];
  const topName = classStudents.find(s => s.id === topSiswa?.siswaId)?.nama || '-';
  const lowName = classStudents.find(s => s.id === lowSiswa?.siswaId)?.nama || '-';

  let msg = `*LAPORAN REKAP NILAI KELAS ${kelas.nama.toUpperCase()}*\n`;
  msg += `🏫 *${getSchoolName(kopSurat)}*\n`;
  msg += `──────────────────────────────\n`;
  msg += `Kepada Yth. Wali Kelas: *${kelas.waliKelas}*\n`;
  msg += `📖 Mata Pelajaran: *${guru.mapel}*\n`;
  msg += `📚 Semester: *${kelas.semester} ${kelas.tahunAjaran}*\n\n`;

  msg += `📊 *Statistik Penilaian Kelas:*\n`;
  msg += `• Jumlah Siswa Dinilai: *${total} Siswa*\n`;
  msg += `• 📈 Rata-rata Kelas: *${avg}*\n`;
  msg += `• 🏆 Nilai Tertinggi: *${topSiswa ? topSiswa.nilaiAkhir : '-'}* (${topName})\n`;
  msg += `• 📉 Nilai Terendah: *${lowSiswa ? lowSiswa.nilaiAkhir : '-'}* (${lowName})\n`;
  msg += `• ✅ Tingkat Ketuntasan: *${tuntasRate}%* (${tuntasList.length}/${total} Siswa Tuntas)\n\n`;

  if (belumTuntasList.length > 0) {
    msg += `⚠️ *Daftar Siswa Perlu Remedial/Binaan (< KKM ${kkm}):*\n`;
    belumTuntasList.forEach((n, idx) => {
      const s = classStudents.find(item => item.id === n.siswaId);
      msg += `  ${idx + 1}. ${s ? s.nama : 'Siswa'} (Nilai Akhir: *${n.nilaiAkhir}* - Predikat ${n.predikat})\n`;
    });
  } else {
    msg += `✨ *Semua siswa kelas ${kelas.nama} berhasil mencapai standar KKM (${kkm}).* 👏\n`;
  }

  if (catatanTambahan && catatanTambahan.trim()) {
    msg += `\n📝 *Catatan Khusus Pengajar:*\n"${catatanTambahan.trim()}"\n`;
  }

  msg += `──────────────────────────────\n`;
  msg += `Salam hormat,\n`;
  msg += `👨‍🏫 *${guru.nama}*\n`;
  msg += `Guru Pengampu • ${guru.mapel}`;

  return msg;
};
