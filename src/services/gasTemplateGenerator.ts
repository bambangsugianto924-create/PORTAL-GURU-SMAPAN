export interface GasGeneratorOptions {
  appName: string;
  spreadsheetName: string;
  teacherName: string;
  schoolName: string;
  includeSampleData: boolean;
}

export const generateCodeGs = (options: GasGeneratorOptions): string => {
  return `/**
 * ===================================================================
 * APLIKASI WEB PORTAL GURU & MANAJEMEN KELAS (GOOGLE APPS SCRIPT)
 * Dibuat khusus untuk pemula - Langsung jalan dengan Google Spreadsheet!
 * Sekolah: ${options.schoolName || 'SMAN 1 Teladan Nusantara'}
 * Guru: ${options.teacherName || 'Bambang Sugianto, M.Pd.'}
 * ===================================================================
 */

// 1. FUNGSI UNTUK MENAMPILKAN WEB APP
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('${options.appName || 'Portal Guru & Manajemen Sekolah'}')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// 2. FUNGSI INISIALISASI DATABASE SPREADSHEET OTOMATIS
// Jalankan fungsi ini sekali di editor Apps Script untuk membuat semua sheet & header!
function initDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheets = [
    {
      name: "Data_Guru",
      headers: ["ID", "Nama_Lengkap", "Email", "Password", "NIP", "Mata_Pelajaran", "Sekolah", "No_HP"]
    },
    {
      name: "Data_Kelas",
      headers: ["ID", "Nama_Kelas", "Tingkat", "Jurusan", "Wali_Kelas", "Tahun_Ajaran", "Semester", "Ruangan"]
    },
    {
      name: "Data_Siswa",
      headers: ["ID", "Kelas_ID", "NISN", "Nama_Siswa", "Jenis_Kelamin", "No_HP", "Nama_Wali", "Status"]
    },
    {
      name: "Data_Absensi",
      headers: ["ID", "Kelas_ID", "Siswa_ID", "Tanggal", "Status", "Keterangan", "Waktu_Catat"]
    },
    {
      name: "Data_Nilai",
      headers: ["ID", "Kelas_ID", "Siswa_ID", "Mata_Pelajaran", "Tugas_1", "Tugas_2", "Tugas_3", "Tugas_4", "UH_1", "UH_2", "UH_3", "UH_4", "PTS", "PAS", "Nilai_Akhir", "Predikat", "Status_Lulus", "Catatan"]
    },
    {
      name: "Data_Jurnal",
      headers: ["ID", "Guru_ID", "Kelas_ID", "Tanggal", "Jam_Ke", "Mata_Pelajaran", "Materi_Pokok", "Capaian", "Hadir", "Tidak_Hadir", "Kendala", "Solusi", "Status"]
    }
  ];

  sheets.forEach(function(s) {
    var sheet = ss.getSheetByName(s.name);
    if (!sheet) {
      sheet = ss.insertSheet(s.name);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(s.headers);
      var headerRange = sheet.getRange(1, 1, 1, s.headers.length);
      headerRange.setBackground("#2563EB").setFontColor("#FFFFFF").setFontWeight("bold");
    }
  });

  ${options.includeSampleData ? `
  // Tambah akun guru default jika sheet guru masih kosong
  var guruSheet = ss.getSheetByName("Data_Guru");
  if (guruSheet.getLastRow() <= 1) {
    guruSheet.appendRow([
      "guru-1",
      "${options.teacherName || 'Bambang Sugianto, M.Pd.'}",
      "guru@sekolah.sch.id",
      "123456",
      "19820415 200801 1 009",
      "Informatika",
      "${options.schoolName || 'SMAN 1 Teladan'}",
      "081234567890"
    ]);
  }
  ` : ''}

  return "Berhasil! Semua tabel database di Google Spreadsheet telah disiapkan.";
}

// 3. FUNGSI HELPER AMBIL DATA SEMUA SHEET SEBAGAI JSON
function getAppData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  function sheetToObjects(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() <= 1) return [];
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var result = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j];
      }
      result.push(obj);
    }
    return result;
  }

  return {
    guru: sheetToObjects("Data_Guru"),
    kelas: sheetToObjects("Data_Kelas"),
    siswa: sheetToObjects("Data_Siswa"),
    absensi: sheetToObjects("Data_Absensi"),
    nilai: sheetToObjects("Data_Nilai"),
    jurnal: sheetToObjects("Data_Jurnal")
  };
}

// 4. FUNGSI SIMPAN / UPDATE DATA DARI WEB APP KE SPREADSHEET
function simpanData(type, payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetMap = {
      'guru': 'Data_Guru',
      'kelas': 'Data_Kelas',
      'siswa': 'Data_Siswa',
      'absensi': 'Data_Absensi',
      'nilai': 'Data_Nilai',
      'jurnal': 'Data_Jurnal'
    };
    
    var sheetName = sheetMap[type];
    if (!sheetName) throw new Error("Tipe data tidak dikenali: " + type);
    
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      initDatabase();
      sheet = ss.getSheetByName(sheetName);
    }

    if (Array.isArray(payload)) {
      // Simpan bulk / batch
      payload.forEach(function(item) {
        var row = Object.values(item);
        sheet.appendRow(row);
      });
    } else {
      var row = Object.values(payload);
      sheet.appendRow(row);
    }

    return { success: true, message: "Data " + type + " berhasil disimpan!" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// 5. FUNGSI LOGIN GURU
function loginGuru(email, password) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Data_Guru");
  if (!sheet || sheet.getLastRow() <= 1) {
    return { success: false, message: "Data guru belum terdaftar." };
  }
  
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var rowEmail = data[i][2];
    var rowPass = data[i][3];
    if (rowEmail.toString().toLowerCase() === email.toLowerCase() && rowPass.toString() === password.toString()) {
      return {
        success: true,
        user: {
          id: data[i][0],
          nama: data[i][1],
          email: data[i][2],
          nip: data[i][4],
          mapel: data[i][5],
          sekolah: data[i][6],
          noHp: data[i][7]
        }
      };
    }
  }
  return { success: false, message: "Email atau password salah." };
}
`;
};

export const generateIndexHtml = (options: GasGeneratorOptions): string => {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.appName || 'Portal Guru & Manajemen Sekolah'}</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased min-h-screen">
  <div id="app" class="max-w-6xl mx-auto p-4 sm:p-6">
    <!-- Header -->
    <header class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-md">
          PG
        </div>
        <div>
          <h1 class="text-xl font-bold text-slate-900">${options.appName || 'Portal Guru Digital'}</h1>
          <p class="text-xs text-slate-500">${options.schoolName || 'SMAN 1 Teladan Nusantara'} • Google Apps Script Web App</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          ● Terhubung Google Sheets
        </span>
      </div>
    </header>

    <!-- Main Navigation Tabs -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      <button class="bg-blue-600 text-white font-medium py-3 px-4 rounded-xl shadow-sm hover:bg-blue-700 transition text-center">Dashboard</button>
      <button class="bg-white text-slate-700 border border-slate-200 font-medium py-3 px-4 rounded-xl hover:bg-slate-100 transition text-center">Data Kelas</button>
      <button class="bg-white text-slate-700 border border-slate-200 font-medium py-3 px-4 rounded-xl hover:bg-slate-100 transition text-center">Data Siswa</button>
      <button class="bg-white text-slate-700 border border-slate-200 font-medium py-3 px-4 rounded-xl hover:bg-slate-100 transition text-center">Absensi & Nilai</button>
      <button class="bg-white text-slate-700 border border-slate-200 font-medium py-3 px-4 rounded-xl hover:bg-slate-100 transition text-center">Jurnal Mengajar</button>
    </div>

    <!-- Quick Overview Card -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 class="text-lg font-bold text-slate-800 mb-4">Status Integrasi Google Apps Script</h2>
      <p class="text-slate-600 text-sm leading-relaxed mb-4">
        Web App ini terhubung langsung dengan Google Spreadsheet sebagai basis data penyimpanan cloud gratis dari Google. Anda dapat menginput nilai, absensi, dan jurnal harian tanpa server tambahan.
      </p>
      <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs flex items-center gap-2">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span>Tip: Gunakan fungsi <code class="font-mono font-bold">google.script.run.getAppData()</code> untuk mengambil data real-time dari spreadsheet.</span>
      </div>
    </div>
  </div>
</body>
</html>
`;
};
