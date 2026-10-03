import { OfficialLetter, LetterTemplate, LetterKopSettings, LetterType } from '../types';
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

  // Kop Settings Management
  async getKopSettings(): Promise<LetterKopSettings> {
    return store.getLetterKopSettings();
  },

  async saveKopSettings(data: LetterKopSettings): Promise<LetterKopSettings> {
    store.setLetterKopSettings(data);
    return data;
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
  }
};
