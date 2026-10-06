import { OfficialLetter, LetterTemplate, LetterKopSettings, LetterType, LetterKopTemplate, LetterDeliveryLog } from '../types';
import { store } from './storageStore';
import { auditService } from './auditService';

export interface LetterFilterOptions {
  search?: string;
  type?: LetterType | 'all';
  employee_id?: string;
  status?: string;
}

export const letterService = {
  // Letters Management
  async getLetters(filters: LetterFilterOptions = {}): Promise<OfficialLetter[]> {
    let list = store.getOfficialLetters();

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        l =>
          l.title.toLowerCase().includes(q) ||
          l.letter_number.toLowerCase().includes(q) ||
          l.employee_name.toLowerCase().includes(q) ||
          (l.employee_nirg_nirk && l.employee_nirg_nirk.toLowerCase().includes(q))
      );
    }

    if (filters.type && filters.type !== 'all') {
      list = list.filter(l => l.type === filters.type);
    }

    if (filters.employee_id) {
      list = list.filter(l => l.employee_id === filters.employee_id);
    }

    if (filters.status) {
      list = list.filter(l => l.status === filters.status);
    }

    // Sort newest first
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getLetterById(id: string): Promise<OfficialLetter | null> {
    const list = store.getOfficialLetters();
    return list.find(l => l.id === id) || null;
  },

  async saveLetter(data: Partial<OfficialLetter>): Promise<OfficialLetter> {
    const list = store.getOfficialLetters();
    let saved: OfficialLetter;
    const now = new Date().toISOString();

    if (data.id) {
      const idx = list.findIndex(l => l.id === data.id);
      if (idx === -1) throw new Error('Surat tidak ditemukan');
      saved = { ...list[idx], ...data, updated_at: now } as OfficialLetter;
      list[idx] = saved;
      await auditService.log('UPDATE', 'documents', saved.id, { entity: 'OfficialLetter', number: saved.letter_number });
    } else {
      saved = {
        id: `ltr-${Date.now()}`,
        letter_number: data.letter_number || (await this.generateNextLetterNumber(data.type || 'sk_pengangkatan')),
        template_id: data.template_id,
        type: data.type || 'sk_pengangkatan',
        title: data.title || 'Surat Resmi',
        employee_id: data.employee_id || '',
        employee_name: data.employee_name || '',
        employee_email: data.employee_email,
        employee_nik: data.employee_nik,
        employee_nirg_nirk: data.employee_nirg_nirk,
        employee_position: data.employee_position,
        employee_unit: data.employee_unit,
        employee_gender: data.employee_gender,
        employee_birth_info: data.employee_birth_info,
        employee_education_level: data.employee_education_level,
        subject: data.subject || '',
        header_title: data.header_title || "KEPUTUSAN KETUA UMUM YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR'ANIYYAH",
        considering: data.considering || [],
        in_view: data.in_view || [],
        observing: data.observing || [],
        deciding: data.deciding || {},
        effective_date: data.effective_date || new Date().toISOString().split('T')[0],
        end_date: data.end_date,
        issued_date: data.issued_date || new Date().toISOString().split('T')[0],
        issued_city: data.issued_city || 'Tangerang Selatan',
        signer_name: data.signer_name || 'Dr. KH. M. Sobron Zayyan, SQ., MA',
        signer_title: data.signer_title || 'Ketua Umum',
        status: data.status || 'diterbitkan',
        created_at: now
      };
      list.unshift(saved);
      await auditService.log('CREATE', 'documents', saved.id, { entity: 'OfficialLetter', number: saved.letter_number });
    }

    store.setOfficialLetters(list);
    return saved;
  },

  async deleteLetter(id: string): Promise<void> {
    const list = store.getOfficialLetters().filter(l => l.id !== id);
    store.setOfficialLetters(list);
    await auditService.log('DELETE', 'documents', id, { entity: 'OfficialLetter' });
  },

  // Auto-generate Letter Numbering (e.g. 048 /SK/YASPIQ/X/2026)
  async generateNextLetterNumber(type: LetterType): Promise<string> {
    const letters = store.getOfficialLetters();
    const typeCodeMap: Record<LetterType, string> = {
      sk_pengangkatan: 'SK',
      sp_peringatan: 'SP-1',
      sk_penugasan: 'SKP',
      surat_keterangan: 'SKET',
      custom: 'SURAT'
    };
    const code = typeCodeMap[type] || 'SK';

    let maxNum = 0;
    letters.forEach(l => {
      const match = l.letter_number.match(/^(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });

    const nextNum = String(maxNum + 1).padStart(3, '0');
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const currentMonth = romanMonths[new Date().getMonth()];
    const currentYear = new Date().getFullYear();

    return `${nextNum} /${code}/YASPIQ/${currentMonth}/${currentYear}`;
  },

  // Templates Management
  async getTemplates(): Promise<LetterTemplate[]> {
    return store.getLetterTemplates();
  },

  async saveTemplate(data: Partial<LetterTemplate>): Promise<LetterTemplate> {
    const list = store.getLetterTemplates();
    let saved: LetterTemplate;

    if (data.id) {
      const idx = list.findIndex(t => t.id === data.id);
      if (idx === -1) throw new Error('Template tidak ditemukan');
      saved = { ...list[idx], ...data } as LetterTemplate;
      list[idx] = saved;
    } else {
      saved = {
        id: `tpl-${Date.now()}`,
        code: data.code || `TPL-${Date.now()}`,
        title: data.title || 'Template Surat Baru',
        type: data.type || 'custom',
        subject_template: data.subject_template || '',
        header_title: data.header_title || "KEPUTUSAN KETUA UMUM YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR'ANIYYAH",
        considering_text: data.considering_text || [],
        in_view_text: data.in_view_text || [],
        observing_text: data.observing_text || [],
        deciding_text: data.deciding_text || {},
        footer_city: data.footer_city || 'Tangerang Selatan',
        signer_name: data.signer_name || 'Dr. KH. M. Sobron Zayyan, SQ., MA',
        signer_title: data.signer_title || 'Ketua Umum',
        created_at: new Date().toISOString()
      };
      list.push(saved);
    }

    store.setLetterTemplates(list);
    return saved;
  },

  async deleteTemplate(id: string): Promise<void> {
    const list = store.getLetterTemplates().filter(t => t.id !== id);
    store.setLetterTemplates(list);
  },

  // Kop Settings & Kop Templates Management
  async getKopSettings(): Promise<LetterKopSettings> {
    return store.getLetterKopSettings();
  },

  async saveKopSettings(data: LetterKopSettings): Promise<LetterKopSettings> {
    store.setLetterKopSettings(data);
    return data;
  },

  async getKopTemplates(): Promise<LetterKopTemplate[]> {
    return store.getKopTemplates();
  },

  async saveKopTemplate(data: Partial<LetterKopTemplate>): Promise<LetterKopTemplate> {
    const list = store.getKopTemplates();
    let saved: LetterKopTemplate;

    if (data.id) {
      const idx = list.findIndex(k => k.id === data.id);
      if (idx === -1) throw new Error('Template KOP tidak ditemukan');
      saved = { ...list[idx], ...data } as LetterKopTemplate;
      list[idx] = saved;
    } else {
      saved = {
        id: `kop-tpl-${Date.now()}`,
        name: data.name || 'Template KOP Baru',
        unit_id: data.unit_id,
        header_line1: data.header_line1 || 'YAYASAN PENDIDIKAN ISLAM',
        header_line2: data.header_line2 || "PONDOK PESANTREN AL-QUR'ANIYYAH",
        address: data.address || "Jl. Pesantren Al-Qur'aniyyah No. 12, Cipayung",
        contact: data.contact || "Telp: (021) 7458000 | Email: yayasan@alquraniyyah.sch.id",
        kop_image_url: data.kop_image_url || '',
        kop_image_mode: data.kop_image_mode || 'full_page',
        kop_top_padding_cm: data.kop_top_padding_cm ?? 4.2,
        print_top_margin_cm: data.print_top_margin_cm ?? 3.5,
        is_default: data.is_default ?? false,
        created_at: new Date().toISOString()
      };
      list.push(saved);
    }

    store.setKopTemplates(list);
    return saved;
  },

  async deleteKopTemplate(id: string): Promise<void> {
    const list = store.getKopTemplates().filter(k => k.id !== id);
    store.setKopTemplates(list);
  },

  // Delivery Logs
  async getDeliveryLogs(): Promise<LetterDeliveryLog[]> {
    return store.getDeliveryLogs();
  },

  async addDeliveryLogs(items: Partial<LetterDeliveryLog>[]): Promise<LetterDeliveryLog[]> {
    const list = store.getDeliveryLogs();
    const createdLogs: LetterDeliveryLog[] = [];
    const now = new Date().toISOString();

    items.forEach((item, index) => {
      const logItem: LetterDeliveryLog = {
        id: `log-del-${Date.now()}-${index}`,
        letter_id: item.letter_id || '',
        letter_number: item.letter_number || '',
        letter_title: item.letter_title || '',
        employee_id: item.employee_id || '',
        employee_name: item.employee_name || '',
        channel: item.channel || 'email',
        recipient_address: item.recipient_address || '',
        status: item.status || 'sent',
        sent_at: item.sent_at || now,
        error_message: item.error_message
      };
      list.unshift(logItem);
      createdLogs.push(logItem);
    });

    store.setDeliveryLogs(list);
    return createdLogs;
  },

  // Save Multiple Official Letters
  async saveMultipleLetters(items: Partial<OfficialLetter>[]): Promise<OfficialLetter[]> {
    const list = store.getOfficialLetters();
    const now = new Date().toISOString();
    const createdList: OfficialLetter[] = [];

    items.forEach((data, index) => {
      const saved: OfficialLetter = {
        id: `ltr-${Date.now()}-${index}`,
        letter_number: data.letter_number || `LTR-${Date.now()}-${index}`,
        template_id: data.template_id,
        type: data.type || 'sk_pengangkatan',
        title: data.title || 'Surat Resmi',
        employee_id: data.employee_id || '',
        employee_name: data.employee_name || '',
        employee_email: data.employee_email,
        employee_nik: data.employee_nik,
        employee_nirg_nirk: data.employee_nirg_nirk,
        employee_position: data.employee_position,
        employee_unit: data.employee_unit,
        employee_gender: data.employee_gender,
        employee_birth_info: data.employee_birth_info,
        employee_education_level: data.employee_education_level,
        subject: data.subject || '',
        header_title: data.header_title || "KEPUTUSAN KETUA UMUM YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR'ANIYYAH",
        considering: data.considering || [],
        in_view: data.in_view || [],
        observing: data.observing || [],
        deciding: data.deciding || {},
        effective_date: data.effective_date || new Date().toISOString().split('T')[0],
        end_date: data.end_date,
        issued_date: data.issued_date || new Date().toISOString().split('T')[0],
        issued_city: data.issued_city || 'Tangerang Selatan',
        signer_name: data.signer_name || 'Dr. KH. M. Sobron Zayyan, SQ., MA',
        signer_title: data.signer_title || 'Ketua Umum',
        status: data.status || 'diterbitkan',
        created_at: now
      };
      list.unshift(saved);
      createdList.push(saved);
    });

    store.setOfficialLetters(list);
    await auditService.log('CREATE', 'documents', `bulk-${Date.now()}`, { entity: 'OfficialLetter', count: createdList.length });
    return createdList;
  },

  async deleteMultipleLetters(ids: string[]): Promise<void> {
    const setIds = new Set(ids);
    const list = store.getOfficialLetters().filter(l => !setIds.has(l.id));
    store.setOfficialLetters(list);
    await auditService.log('DELETE', 'documents', `bulk-del-${Date.now()}`, { entity: 'OfficialLetter', count: ids.length });
  },

  // Prepare Gmail / Email Mailto Link
  sendViaGmail(letter: OfficialLetter): void {
    const to = letter.employee_email || '';
    const subject = encodeURIComponent(`[SIMKA YASPIQ] ${letter.title} - ${letter.letter_number}`);
    
    let bodyText = `Assalamu'alaikum Wr. Wb.\n\n`;
    bodyText += `Yth. Sdr/Sdri. ${letter.employee_name},\n\n`;
    bodyText += `Berikut disajikan dokumen resmi Surat Keputusan / Penyuratan Yayasan Pendidikan Islam Pondok Pesantren Al-Qur'aniyyah:\n\n`;
    bodyText += `Nomor Surat  : ${letter.letter_number}\n`;
    bodyText += `Perihal      : ${letter.title}\n`;
    bodyText += `Jabatan/Unit : ${letter.employee_position || '-'} (${letter.employee_unit || '-'})\n`;
    bodyText += `TMT Berlaku  : ${new Date(letter.effective_date).toLocaleDateString('id-ID', { dateStyle: 'long' })}\n\n`;
    bodyText += `Mohon untuk dapat mengunduh / mencetak berkas resmi ini melalui sistem SIMKA Al-Qur'aniyyah.\n\n`;
    bodyText += `Wassalamu'alaikum Wr. Wb.\n\n`;
    bodyText += `Hormat Kami,\nYayasan Pendidikan Islam Pondok Pesantren Al-Qur'aniyyah\n`;
    bodyText += `${letter.signer_name} (${letter.signer_title})`;

    const mailtoUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${subject}&body=${encodeURIComponent(bodyText)}`;
    window.open(mailtoUrl, '_blank');
  },

  // Send via WhatsApp Click-to-Chat Link
  sendViaWhatsApp(phone: string, letter: OfficialLetter): void {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

    let msg = `*Assalamu'alaikum Wr. Wb.*\n\n`;
    msg += `Yth. Bapak/Ibu *${letter.employee_name}*,\n\n`;
    msg += `Berikut disampaikan penerbitan dokumen resmi Yayasan Pendidikan Islam Pondok Pesantren Al-Qur'aniyyah:\n\n`;
    msg += `*Nomor Surat*: ${letter.letter_number}\n`;
    msg += `*Perihal*: ${letter.title}\n`;
    msg += `*Unit/Jabatan*: ${letter.employee_unit || '-'} (${letter.employee_position || '-'})\n`;
    msg += `*Tanggal*: ${new Date(letter.issued_date).toLocaleDateString('id-ID', { dateStyle: 'long' })}\n\n`;
    msg += `Mohon dapat memeriksa dokumen lengkap melalui Portal SIMKA Al-Qur'aniyyah.\n\n`;
    msg += `_Wassalamu'alaikum Wr. Wb._\n*Sekretariat Yayasan Al-Qur'aniyyah*`;

    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  },

  // Send Bulk Email via Gmail
  sendBulkViaGmail(letters: OfficialLetter[]): void {
    const emails = letters.map(l => l.employee_email).filter(Boolean);
    if (emails.length === 0) {
      alert('Tidak ada alamat email karyawan yang terdaftar dari surat terpilih.');
      return;
    }
    const bcc = encodeURIComponent(emails.join(','));
    const subject = encodeURIComponent(`[SIMKA YASPIQ] Surat Keputusan & Dokumen Penyuratan Resmi Yayasan`);
    let bodyText = `Assalamu'alaikum Wr. Wb.\n\n`;
    bodyText += `Kepada Yth. Bapak/Ibu Guru & Karyawan Terlampir,\n\n`;
    bodyText += `Dengan ini kami sampaikan penerbitan Surat Keputusan / Dokumen Penyuratan Resmi dari Yayasan Pendidikan Islam Pondok Pesantren Al-Qur'aniyyah.\n\n`;
    bodyText += `Rincian Surat Terbit:\n`;
    letters.forEach((l, idx) => {
      bodyText += `${idx + 1}. ${l.employee_name} - ${l.title} (${l.letter_number})\n`;
    });
    bodyText += `\nMohon untuk dapat memeriksa dan mengunduh berkas lengkap melalui portal SIMKA Al-Qur'aniyyah.\n\n`;
    bodyText += `Wassalamu'alaikum Wr. Wb.\n\n`;
    bodyText += `Hormat Kami,\nYayasan Pendidikan Islam Pondok Pesantren Al-Qur'aniyyah`;

    const mailtoUrl = `https://mail.google.com/mail/?view=cm&fs=1&bcc=${bcc}&su=${subject}&body=${encodeURIComponent(bodyText)}`;
    window.open(mailtoUrl, '_blank');
  }
};
