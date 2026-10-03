import React from 'react';
import { OfficialLetter, LetterKopSettings } from '../../types';

interface LetterPrintPreviewProps {
  letter: OfficialLetter;
  kopSettings?: LetterKopSettings;
  hideKopOnPrintOverride?: boolean;
  isBulkPrint?: boolean;
}

export const LetterPrintPreview: React.FC<LetterPrintPreviewProps> = ({
  letter,
  kopSettings,
  hideKopOnPrintOverride,
  isBulkPrint = false
}) => {
  const line1 = kopSettings?.header_line1 || 'YAYASAN PENDIDIKAN ISLAM';
  const line2 = kopSettings?.header_line2 || "PONDOK PESANTREN AL-QUR'ANIYYAH";
  const address = kopSettings?.address || "Jl. Pesantren Al-Qur'aniyyah No. 12, Cipayung, Tangerang Selatan / Megamendung, Bogor";
  const contact = kopSettings?.contact || "Telp: (021) 7458000 | Email: yayasan@alquraniyyah.sch.id";

  // Determine whether to hide Kop when printing onto physical paper
  const shouldHideKopOnPrint = hideKopOnPrintOverride !== undefined
    ? hideKopOnPrintOverride
    : (kopSettings?.hide_kop_on_print ?? true);

  const printMarginCm = kopSettings?.print_top_margin_cm || 3.5;

  const formattedIssuedDate = letter.issued_date
    ? new Date(letter.issued_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div
      className={`bg-white text-slate-900 font-serif leading-relaxed p-6 sm:p-10 max-w-[210mm] mx-auto shadow-2xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full print:bg-transparent relative ${
        isBulkPrint ? 'print:break-after-page page-break-after-always mb-8 print:mb-0' : ''
      }`}
    >
      {/* 1. KOP SURAT YAYASAN (GAMBAR ATAU TEKS) */}
      <div className={`mb-6 border-b-2 border-slate-900 pb-3 relative ${shouldHideKopOnPrint ? 'print:hidden' : ''}`}>
        {kopSettings?.kop_image_url ? (
          <div className="w-full flex items-center justify-center">
            <img
              src={kopSettings.kop_image_url}
              alt="Kop Surat Resmi"
              className="max-h-36 w-auto object-contain mx-auto"
            />
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-sm font-bold tracking-widest uppercase text-slate-800">{line1}</h3>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase mt-0.5">{line2}</h1>
            <p className="text-[11px] text-slate-600 font-sans mt-1">{address}</p>
            <p className="text-[10px] text-slate-500 font-sans">{contact}</p>
          </div>
        )}
      </div>

      {/* Spacer margin atas saat cetak di kertas fisik berpemberat Kop */}
      {shouldHideKopOnPrint && (
        <div
          className="hidden print:block"
          style={{ height: `${printMarginCm}cm` }}
        />
      )}

      {/* 2. NOMOR SURAT & JUDUL */}
      <div className="text-center mb-6">
        <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-wide underline underline-offset-4">
          {letter.header_title || 'KEPUTUSAN KETUA UMUM'}
        </h2>
        <p className="text-xs font-bold text-slate-800 mt-1 uppercase tracking-wider">
          NOMOR : {letter.letter_number}
        </p>

        <div className="mt-4 max-w-xl mx-auto">
          <p className="text-xs font-bold text-slate-900 uppercase">TENTANG</p>
          <p className="text-xs sm:text-sm font-black uppercase text-slate-900 leading-snug mt-1 border-t border-b border-slate-300 py-1.5 px-3">
            {letter.subject}
          </p>
        </div>
      </div>

      {/* 3. BISMILLAH & OPENING */}
      <div className="mb-4">
        <p className="italic font-semibold text-xs sm:text-sm text-center mb-2">Bismillahirrahmānirrahīm</p>
        <p className="text-xs leading-relaxed text-justify">
          Dengan selalu bertawakal kepada Allah SWT, {letter.signer_title || 'Ketua Umum'} Yayasan Pendidikan Islam Pondok Pesantren Al-Qur'aniyyah :
        </p>
      </div>

      {/* 4. MENIMBANG, MENGINGAT, MEMPERHATIKAN */}
      <div className="space-y-3 text-xs text-justify mb-6">
        {/* Menimbang */}
        {letter.considering && letter.considering.length > 0 && (
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3 font-bold">Menimbang</div>
            <div className="col-span-1 text-center font-bold">:</div>
            <div className="col-span-8 space-y-1">
              {letter.considering.map((item, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="font-bold">{idx + 1}.</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mengingat */}
        {letter.in_view && letter.in_view.length > 0 && (
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3 font-bold">Mengingat</div>
            <div className="col-span-1 text-center font-bold">:</div>
            <div className="col-span-8 space-y-1">
              {letter.in_view.map((item, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="font-bold">{idx + 1}.</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Memperhatikan */}
        {letter.observing && letter.observing.length > 0 && (
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3 font-bold">Memperhatikan</div>
            <div className="col-span-1 text-center font-bold">:</div>
            <div className="col-span-8 space-y-1">
              {letter.observing.map((item, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="font-bold">{idx + 1 > 1 ? `${idx + 1}.` : ''}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PAGE BREAK MARKER FOR PRINT (matching Image 2) */}
      <div className="text-center my-6">
        <h3 className="text-base font-black uppercase text-slate-900 tracking-widest underline underline-offset-4">
          MEMUTUSKAN
        </h3>
      </div>

      {/* 5. MEMUTUSKAN / MENETAPKAN */}
      {letter.deciding && Object.keys(letter.deciding).length > 0 && (
        <div className="space-y-3 text-xs text-justify mb-8">
          {Object.entries(letter.deciding).map(([key, val], idx) => (
            <div key={key} className="grid grid-cols-12 gap-2">
              <div className="col-span-3 font-bold">
                {idx === 0 ? 'Menetapkan :' : ''}
              </div>
              <div className="col-span-2 font-bold">{key}</div>
              <div className="col-span-1 text-center font-bold">:</div>
              <div className="col-span-6 whitespace-pre-line leading-relaxed">
                {val}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. TANGGAL PENETAPAN & TANDA TANGAN KETUA UMUM */}
      <div className="flex justify-end text-xs mt-10">
        <div className="w-72 text-left relative">
          <p className="flex justify-between">
            <span>Ditetapkan di</span>
            <span>: {letter.issued_city || 'Tangerang Selatan'}</span>
          </p>
          <p className="flex justify-between">
            <span>Pada tanggal</span>
            <span>: {formattedIssuedDate}</span>
          </p>

          <div className="mt-4 text-center">
            <p className="font-bold uppercase text-slate-900">Yayasan Pendidikan Islam</p>
            <p className="font-bold uppercase text-slate-900">Pondok Pesantren Al-Qur'aniyyah</p>

            {/* Signature & Stamp Space */}
            <div className="h-24 my-2 flex items-center justify-center relative">
              {/* Optional Stempel Watermark */}
              <div className="w-24 h-24 border-2 border-indigo-700/60 rounded-full flex items-center justify-center text-[9px] font-black text-indigo-800 rotate-[-15deg] opacity-75 shadow-inner p-1 text-center leading-tight uppercase pointer-events-none">
                YAYASAN PON-PES AL-QUR'ANIYYAH
              </div>
              {/* Signature Line */}
              <div className="absolute bottom-2 left-0 right-0 border-b border-slate-900 w-3/4 mx-auto" />
            </div>

            <p className="font-black text-sm uppercase underline text-slate-900">
              {letter.signer_name || 'Dr. KH. M. Sobron Zayyan, SQ., MA'}
            </p>
            <p className="font-bold text-xs text-slate-800 mt-0.5">
              {letter.signer_title || 'Ketua Umum'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
