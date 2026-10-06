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
  const kopTopPaddingCm = Math.max(kopSettings?.kop_top_padding_cm ?? 5.5, 5.5);
  const kopImageUrl = kopSettings?.kop_image_url || '/kop_yayasan.jpg';

  const hasKopImage = Boolean(kopImageUrl && kopImageUrl.trim() !== '');
  const formattedIssuedDate = letter.issued_date
    ? new Date(letter.issued_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div
      className={`printable-area bg-white text-slate-900 font-serif leading-relaxed p-6 sm:p-12 max-w-[210mm] min-h-[297mm] h-auto mx-auto shadow-2xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full print:bg-transparent relative overflow-visible ${
        shouldHideKopOnPrint ? 'print-hide-kop' : ''
      } ${
        isBulkPrint ? 'print:break-after-page page-break-after-always mb-8 print:mb-0' : ''
      }`}
    >
      {/* 1. FULL PAGE A4 BACKGROUND KOP IMAGE */}
      {hasKopImage && !shouldHideKopOnPrint && (
        <div
          className="absolute inset-0 z-0 pointer-events-none print-hide-kop"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            zIndex: 0
          }}
        >
          <img
            src={kopImageUrl}
            alt="Kop Surat A4 Background"
            className="w-full h-full object-fill block"
            style={{ width: '100%', height: '100%', objectFit: 'fill' }}
          />
        </div>
      )}

      {/* 2. TEXT KOP HEADER (ONLY WHEN NO IMAGE KOP IS PRESENT) */}
      {!hasKopImage && !shouldHideKopOnPrint && (
        <div className="mb-6 border-b-2 border-slate-900 pb-3 relative z-10">
          <div className="text-center">
            <h3 className="text-sm font-bold tracking-widest uppercase text-slate-800">{line1}</h3>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase mt-0.5">{line2}</h1>
            <p className="text-[11px] text-slate-600 font-sans mt-1">{address}</p>
            <p className="text-[10px] text-slate-500 font-sans">{contact}</p>
          </div>
        </div>
      )}

      {/* 3. LETTER CONTENT LAYERED ON TOP OF BACKGROUND */}
      <div
        className="relative z-10"
        style={{
          paddingTop: hasKopImage && !shouldHideKopOnPrint
            ? `${kopTopPaddingCm}cm`
            : `${printMarginCm}cm`
        }}
      >
        {/* NOMOR SURAT & JUDUL */}
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

        {/* BISMILLAH & OPENING */}
        <div className="mb-4">
          <p className="italic font-semibold text-xs sm:text-sm text-center mb-2">Bismillahirrahmānirrahīm</p>
          <p className="text-xs leading-relaxed text-justify">
            Dengan selalu bertawakal kepada Allah SWT, {letter.signer_title || 'Ketua Umum'} Yayasan Pendidikan Islam Pondok Pesantren Al-Qur'aniyyah :
          </p>
        </div>

        {/* MENIMBANG, MENGINGAT, MEMPERHATIKAN */}
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

        {/* PAGE BREAK MARKER FOR PRINT */}
        <div className="text-center my-6">
          <h3 className="text-base font-black uppercase text-slate-900 tracking-widest underline underline-offset-4">
            MEMUTUSKAN
          </h3>
        </div>

        {/* MEMUTUSKAN / MENETAPKAN */}
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

        {/* TANGGAL PENETAPAN & TANDA TANGAN */}
        <div className="flex justify-end text-xs mt-10 pb-8 avoid-page-break break-inside-avoid page-break-inside-avoid">
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
                <div className="w-24 h-24 border-2 border-indigo-700/60 rounded-full flex items-center justify-center text-[9px] font-black text-indigo-800 rotate-[-15deg] opacity-75 shadow-inner p-1 text-center leading-tight uppercase pointer-events-none">
                  YAYASAN PON-PES AL-QUR'ANIYYAH
                </div>
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
    </div>
  );
};
