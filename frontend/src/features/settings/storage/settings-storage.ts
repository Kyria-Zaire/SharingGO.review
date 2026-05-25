const GENERAL_KEY = "sharinggo.settings.general";
const COMPANY_KEY = "sharinggo.settings.company";

export interface GeneralSettings {
  compactMode: boolean;
  relativeTimestamps: boolean;
  autoRefreshEnabled: boolean;
  defaultPageSize: number;
}

export interface CompanySettings {
  companyName: string;
  contactEmail: string;
  phone: string;
  address: string;
  logoUrl: string;
}

export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  compactMode: false,
  relativeTimestamps: true,
  autoRefreshEnabled: true,
  defaultPageSize: 20,
};

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: "",
  contactEmail: "",
  phone: "",
  address: "",
  logoUrl: "",
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadGeneralSettings(): GeneralSettings {
  return readJson(GENERAL_KEY, DEFAULT_GENERAL_SETTINGS);
}

export function saveGeneralSettings(settings: GeneralSettings): void {
  writeJson(GENERAL_KEY, settings);
}

export function loadCompanySettings(): CompanySettings {
  return readJson(COMPANY_KEY, DEFAULT_COMPANY_SETTINGS);
}

export function saveCompanySettings(settings: CompanySettings): void {
  writeJson(COMPANY_KEY, settings);
}
