export const DEFAULT_CURRICULUM_URL =
  'https://mindxcom-my.sharepoint.com/:x:/r/personal/rdk12_drive_mindx_com_vn/_layouts/15/Doc.aspx?sourcedoc=%7B0B16E25A-AA34-4E96-96C9-447E81C6CF77%7D&file=%5BR%26D%20K12%20-%20CMS%5D%20T%E1%BB%95ng%20h%E1%BB%A3p%20file%20l%C6%B0u%20tr%E1%BB%AF%20h%E1%BB%8Dc%20li%E1%BB%87u.xlsx&action=default&mobileredirect=true';

export const CONTENT_STORAGE_KEY = 'coding_hcm1_content_settings';
export const CONTENT_SETTINGS_EVENT = 'coding-hcm1-content-updated';

export interface ContentSettings {
  curriculumUrl: string;
  zaloCommentsUrl: string;
}

export const DEFAULT_CONTENT_SETTINGS: ContentSettings = {
  curriculumUrl: DEFAULT_CURRICULUM_URL,
  zaloCommentsUrl: '',
};

export function getContentSettings(): ContentSettings {
  if (typeof window === 'undefined') return DEFAULT_CONTENT_SETTINGS;

  try {
    const stored = window.localStorage.getItem(CONTENT_STORAGE_KEY);
    if (!stored) return DEFAULT_CONTENT_SETTINGS;
    return { ...DEFAULT_CONTENT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_CONTENT_SETTINGS;
  }
}

export function saveContentSettings(settings: ContentSettings) {
  window.localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(CONTENT_SETTINGS_EVENT));
}
