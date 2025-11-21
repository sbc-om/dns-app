import { getDatabase } from '../lmdb';

export interface AdminSettings {
  id: string; // Will be "admin_settings" (singleton)
  fullName: string;
  email: string;
  phoneNumber: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  iban?: string;
  swiftCode?: string;
  paymentInstructions?: string;
  paymentInstructionsAr?: string;
  updatedAt: string;
}

export interface UpdateAdminSettingsInput {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  iban?: string;
  swiftCode?: string;
  paymentInstructions?: string;
  paymentInstructionsAr?: string;
}

const SETTINGS_KEY = 'admin_settings';

// Get admin settings
export async function getAdminSettings(): Promise<AdminSettings | null> {
  const db = getDatabase();
  const settings = db.get(SETTINGS_KEY);
  return settings ? (settings as AdminSettings) : null;
}

// Update or create admin settings
export async function updateAdminSettings(input: UpdateAdminSettingsInput): Promise<AdminSettings> {
  const db = getDatabase();
  const existing = await getAdminSettings();
  
  const settings: AdminSettings = {
    id: SETTINGS_KEY,
    fullName: input.fullName || existing?.fullName || '',
    email: input.email || existing?.email || '',
    phoneNumber: input.phoneNumber || existing?.phoneNumber || '',
    bankName: input.bankName || existing?.bankName,
    bankAccountNumber: input.bankAccountNumber || existing?.bankAccountNumber,
    bankAccountHolder: input.bankAccountHolder || existing?.bankAccountHolder,
    iban: input.iban || existing?.iban,
    swiftCode: input.swiftCode || existing?.swiftCode,
    paymentInstructions: input.paymentInstructions || existing?.paymentInstructions,
    paymentInstructionsAr: input.paymentInstructionsAr || existing?.paymentInstructionsAr,
    updatedAt: new Date().toISOString(),
  };
  
  db.put(SETTINGS_KEY, settings);
  
  return settings;
}
