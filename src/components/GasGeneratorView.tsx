import React, { useState, useMemo } from 'react';
import { Guru } from '../types';
import {
  generateCodeGs,
  generateIndexHtml,
  GasGeneratorOptions
} from '../services/gasTemplateGenerator';
import {
  Code2,
  Copy,
  Check,
  Download,
  FileCode,
  Sparkles,
  HelpCircle,
  Play,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GasGeneratorViewProps {
  currentUser: Guru;
}

export const GasGeneratorView: React.FC<GasGeneratorViewProps> = ({ currentUser }) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'codegs' | 'indexhtml' | 'panduan'>('codegs');
  const [copiedCode, setCopiedCode] = useState(false);

  // Generator Options
  const [appName, setAppName] = useState('Portal Guru & Manajemen Sekolah');
  const [spreadsheetName, setSpreadsheetName] = useState('DB_Portal_Guru_2026');
  const [teacherName, setTeacherName] = useState(currentUser.nama);
  const [schoolName, setSchoolName] = useState(currentUser.sekolah);
  const [includeSampleData, setIncludeSampleData] = useState(true);

  const generatorOptions: GasGeneratorOptions = useMemo(() => ({
    appName,
    spreadsheetName,
    teacherName,
    schoolName,
    includeSampleData
  }), [appName, spreadsheetName, teacherName, schoolName, includeSampleData]);

  const codeGsContent = useMemo(() => generateCodeGs(generatorOptions), [generatorOptions]);
  const indexHtmlContent = useMemo(() => generateIndexHtml(generatorOptions), [generatorOptions]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownload = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-4 pb-8">
      
      {/* Header Spotlight */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-indigo-800/40">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold w-fit mb-2 border border-cyan-400/30">
          <Sparkles className="w-3 h-3" />
          <span>Generator Google Apps Script (GAS) Otomatis</span>
        </div>
        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
          Hasilkan Kode Google Apps Script Siap Pakai
        </h2>
        <p className="text-slate-300 text-[11px] mt-1 max-w-2xl leading-normal">
          Salin kode di bawah ini ke Google Sheets Anda untuk memiliki backend dan sistem database cloud gratis dari Google tanpa perlu langganan server!
        </p>
      </div>

      {/* Configuration Box */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
          <span>1. Konfigurasi Generator Script</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Judul Web App</label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Nama Spreadsheet</label>
            <input
              type="text"
              value={spreadsheetName}
              onChange={(e) => setSpreadsheetName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Nama Guru Pemilik</label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Nama Sekolah</label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Code Viewer Box */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-md text-slate-100">
        
        {/* Code Tabs Header */}
        <div className="flex flex-wrap items-center justify-between p-2.5 bg-slate-950 border-b border-slate-800 gap-2">
          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveCodeTab('codegs')}
              className={`py-1 px-2.5 rounded-md font-mono text-xs font-semibold transition flex items-center gap-1 ${
                activeCodeTab === 'codegs'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3 h-3 text-cyan-300" />
              <span>Code.gs</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('indexhtml')}
              className={`py-1 px-2.5 rounded-md font-mono text-xs font-semibold transition flex items-center gap-1 ${
                activeCodeTab === 'indexhtml'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3 h-3 text-amber-300" />
              <span>Index.html</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('panduan')}
              className={`py-1 px-2.5 rounded-md text-xs font-semibold transition flex items-center gap-1 ${
                activeCodeTab === 'panduan'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3 h-3 text-emerald-300" />
              <span>Panduan Pasang</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {activeCodeTab === 'codegs' && (
              <>
                <button
                  onClick={() => handleDownload('Code.gs', codeGsContent)}
                  className="py-1 px-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition"
                >
                  <Download className="w-3 h-3" />
                  <span>Unduh .gs</span>
                </button>
                <button
                  onClick={() => handleCopy(codeGsContent)}
                  className="py-1 px-2.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Tersalin!' : 'Salin Code.gs'}</span>
                </button>
              </>
            )}

            {activeCodeTab === 'indexhtml' && (
              <>
                <button
                  onClick={() => handleDownload('Index.html', indexHtmlContent)}
                  className="py-1 px-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition"
                >
                  <Download className="w-3 h-3" />
                  <span>Unduh .html</span>
                </button>
                <button
                  onClick={() => handleCopy(indexHtmlContent)}
                  className="py-1 px-2.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Tersalin!' : 'Salin Index.html'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Code Content Display */}
        <div className="p-3 overflow-x-auto max-h-[460px] font-mono text-[11px] leading-relaxed">
          {activeCodeTab === 'codegs' && (
            <pre className="text-slate-300 select-all whitespace-pre">
              <code>{codeGsContent}</code>
            </pre>
          )}

          {activeCodeTab === 'indexhtml' && (
            <pre className="text-slate-300 select-all whitespace-pre">
              <code>{indexHtmlContent}</code>
            </pre>
          )}

          {activeCodeTab === 'panduan' && (
            <div className="font-sans text-xs text-slate-200 space-y-3 p-1">
              <div className="p-3 bg-blue-950/70 border border-blue-800 rounded-lg">
                <h4 className="text-xs font-bold text-cyan-300 mb-1">
                  Cara Memasang Script Ini di Google Spreadsheet (Untuk Pemula)
                </h4>
                <p className="text-slate-300 leading-normal text-[11px]">
                  Ikuti 5 langkah mudah berikut untuk menjalankan portal guru ini secara mandiri:
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs mb-0.5">Buat Google Spreadsheet Baru</h5>
                    <p className="text-slate-400 text-[11px]">
                      Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">sheets.new</a> di browser Anda dan beri nama spreadsheet misalnya <code className="text-amber-300 font-mono">{spreadsheetName}</code>.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs mb-0.5">Buka Apps Script</h5>
                    <p className="text-slate-400 text-[11px]">
                      Di menu atas Google Sheets, klik menu <strong className="text-white">Ekstensi (Extensions)</strong> &gt; <strong className="text-white">Apps Script</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                    3
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs mb-0.5">Tempel Kode Code.gs</h5>
                    <p className="text-slate-400 text-[11px]">
                      Hapus semua kode bawaan di file <code className="text-cyan-300 font-mono">Code.gs</code>, lalu salin dan tempelkan kode dari tab <strong className="text-white">Code.gs</strong> di atas. Klik ikon disket (Simpan).
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                    4
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs mb-0.5">Jalankan Inisialisasi Database</h5>
                    <p className="text-slate-400 text-[11px]">
                      Pilih fungsi <code className="text-amber-300 font-mono">initDatabase</code> di dropdown atas editor lalu klik tombol <strong className="text-white">Jalankan (Run)</strong>. Berikan izin otorisasi Google sekali saja. Semua sheet tabel akan otomatis tercipta!
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                    5
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs mb-0.5">Deploy sebagai Aplikasi Web (Web App)</h5>
                    <p className="text-slate-400 text-[11px]">
                      Klik tombol biru <strong className="text-white">Deploy &gt; New deployment</strong>. Pilih tipe <strong className="text-white">Web app</strong>, atur <em>Execute as: Me</em> dan <em>Who has access: Anyone</em>. Klik Deploy dan bagikan URL Web App Anda!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
