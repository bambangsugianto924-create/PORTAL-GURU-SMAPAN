import React, { useState } from 'react';
import { KopSuratConfig, LogoTypeOption } from '../types';
import { School, Award, Landmark, BookOpen, Shield, GraduationCap } from 'lucide-react';

interface KopSuratHeaderProps {
  config: KopSuratConfig;
  className?: string;
  isCompact?: boolean;
}

export const KopSuratHeader: React.FC<KopSuratHeaderProps> = ({
  config,
  className = '',
  isCompact = false
}) => {
  const [leftImgError, setLeftImgError] = useState(false);
  const [rightImgError, setRightImgError] = useState(false);

  // Determine logo size classes
  const getSizeClass = () => {
    if (isCompact) return 'w-12 h-12 text-[9px]';
    switch (config.ukuranLogo) {
      case 'kecil':
        return 'w-14 h-14 text-[10px]';
      case 'besar':
        return 'w-22 h-22 text-[12px]';
      case 'standar':
      default:
        return 'w-18 h-18 text-[11px]';
    }
  };

  const getImgSizeClass = () => {
    if (isCompact) return 'w-12 h-12';
    switch (config.ukuranLogo) {
      case 'kecil':
        return 'w-14 h-14';
      case 'besar':
        return 'w-22 h-22';
      case 'standar':
      default:
        return 'w-18 h-18';
    }
  };

  const getIconSizeClass = () => {
    if (isCompact) return 'w-5 h-5';
    switch (config.ukuranLogo) {
      case 'kecil':
        return 'w-6 h-6';
      case 'besar':
        return 'w-10 h-10';
      case 'standar':
      default:
        return 'w-8 h-8';
    }
  };

  // Helper to render an individual logo (left or right)
  const renderLogoItem = (
    position: 'kiri' | 'kanan',
    type: LogoTypeOption = 'tutwuri',
    url?: string,
    imgError?: boolean,
    onImgError?: () => void
  ) => {
    const sizeClass = getSizeClass();
    const imgSizeClass = getImgSizeClass();
    const iconSizeClass = getIconSizeClass();

    if (type === 'none') {
      return null;
    }

    if (type === 'custom' && url && !imgError) {
      return (
        <img
          src={url}
          alt={position === 'kiri' ? 'Logo Kiri Kop Surat' : 'Logo Kanan Kop Surat'}
          className={`object-contain ${imgSizeClass} flex-shrink-0`}
          referrerPolicy="no-referrer"
          onError={onImgError}
        />
      );
    }

    if (type === 'kemenag') {
      return (
        <div className={`flex flex-col items-center justify-center rounded-full bg-emerald-800 text-white font-bold ${sizeClass} border-2 border-amber-400 shadow-xs flex-shrink-0`}>
          <Landmark className={`${iconSizeClass} text-amber-300`} />
          <span className="text-[6px] sm:text-[7px] font-mono tracking-tighter text-amber-200 mt-0.5">KEMENAG</span>
        </div>
      );
    }

    if (type === 'garuda') {
      return (
        <div className={`flex flex-col items-center justify-center rounded-full bg-amber-600 text-white font-bold ${sizeClass} border-2 border-amber-300 shadow-xs flex-shrink-0`}>
          <Award className={`${iconSizeClass} text-amber-100`} />
          <span className="text-[6px] sm:text-[7px] font-bold tracking-tighter text-amber-100 mt-0.5">GARUDA</span>
        </div>
      );
    }

    if (type === 'pemda') {
      return (
        <div className={`flex flex-col items-center justify-center rounded-full bg-slate-800 text-white font-bold ${sizeClass} border-2 border-amber-400 shadow-xs flex-shrink-0`}>
          <Shield className={`${iconSizeClass} text-amber-300`} />
          <span className="text-[6px] sm:text-[7px] font-mono tracking-tighter text-amber-200 mt-0.5">PEMDA</span>
        </div>
      );
    }

    if (type === 'sekolah') {
      return (
        <div className={`flex flex-col items-center justify-center rounded-full bg-blue-800 text-white font-bold ${sizeClass} border-2 border-blue-300 shadow-xs flex-shrink-0`}>
          <BookOpen className={`${iconSizeClass} text-amber-300`} />
          <span className="text-[6px] sm:text-[7px] tracking-tighter text-amber-200 font-bold uppercase">SEKOLAH</span>
        </div>
      );
    }

    if (type === 'vokasi') {
      return (
        <div className={`flex flex-col items-center justify-center rounded-full bg-teal-800 text-white font-bold ${sizeClass} border-2 border-teal-300 shadow-xs flex-shrink-0`}>
          <GraduationCap className={`${iconSizeClass} text-teal-200`} />
          <span className="text-[6px] sm:text-[7px] tracking-tighter text-teal-100 font-bold uppercase">SMK/VOKASI</span>
        </div>
      );
    }

    // Default: Tut Wuri Handayani
    return (
      <div className={`flex flex-col items-center justify-center rounded-full bg-blue-900 text-white font-bold ${sizeClass} border-2 border-amber-400 shadow-xs flex-shrink-0`}>
        <School className={`${iconSizeClass} text-amber-300`} />
        <span className="text-[6px] sm:text-[7px] tracking-tighter text-amber-200 font-bold uppercase">TUT WURI</span>
      </div>
    );
  };

  // Determine whether to display left and right logos
  const showLeftLogo = (config.tampilkanLogoKiri ?? config.tampilkanLogo ?? true) && config.logoType !== 'none';
  const showRightLogo = (config.tampilkanLogoKanan ?? true) && (config.logoKananType ?? 'sekolah') !== 'none';

  return (
    <div className={`w-full text-slate-900 ${className}`}>
      <div className="flex items-center justify-between gap-2.5 sm:gap-4 pb-2.5">
        {/* Logo Kiri */}
        <div className="flex-shrink-0 flex items-center justify-center">
          {showLeftLogo ? (
            renderLogoItem('kiri', config.logoType, config.logoUrl, leftImgError, () => setLeftImgError(true))
          ) : (
            // Dummy spacer when left is off but right is on to keep center aligned, only if in non-compact mode
            showRightLogo && !isCompact ? <div className={`hidden sm:block ${getImgSizeClass()}`} /> : null
          )}
        </div>

        {/* Center Text Information */}
        <div className="flex-1 text-center font-serif leading-tight px-1">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">
            {config.pemerintah}
          </p>
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-slate-800">
            {config.dinas}
          </p>
          <h1 className="text-base sm:text-lg lg:text-xl font-extrabold uppercase tracking-wide text-slate-950 my-0.5">
            {config.namaSekolah}
          </h1>
          <p className="text-[9px] sm:text-[10px] font-sans text-slate-600">
            {config.alamat}, {config.kota}, {config.provinsi} {config.kodePos && `Kode Pos ${config.kodePos}`}
          </p>
          <p className="text-[8.5px] sm:text-[9.5px] font-sans text-slate-500 mt-0.5">
            {config.telepon && `Telp: ${config.telepon} `}
            {config.email && `• Email: ${config.email} `}
            {config.website && `• Website: ${config.website} `}
            {config.npsn && `• NPSN: ${config.npsn} `}
            {config.akreditasi && `• ${config.akreditasi}`}
          </p>
        </div>

        {/* Logo Kanan */}
        <div className="flex-shrink-0 flex items-center justify-center">
          {showRightLogo ? (
            renderLogoItem(
              'kanan',
              config.logoKananType ?? 'sekolah',
              config.logoKananUrl,
              rightImgError,
              () => setRightImgError(true)
            )
          ) : (
            // Dummy spacer when right is off but left is on to keep center aligned
            showLeftLogo && !isCompact ? <div className={`hidden sm:block ${getImgSizeClass()}`} /> : null
          )}
        </div>
      </div>

      {/* Double Border Separator */}
      {config.tampilkanGarisGanda && (
        <div className="w-full space-y-[2px] mt-1 mb-4">
          <div className="w-full border-t-2 border-slate-900"></div>
          <div className="w-full border-t border-slate-900"></div>
        </div>
      )}
    </div>
  );
};
