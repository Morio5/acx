export type SourceLanguage = 'chinese' | 'korean' | 'japanese' | 'english';

export type KhmerFont = 'noto-sans-khmer' | 'battambang' | 'nimbus-mono-khmer';

export interface Profile {
  id: string;
  display_name: string;
  default_source_language: SourceLanguage;
  preferred_khmer_font: KhmerFont;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  display_name?: string;
  default_source_language?: SourceLanguage;
  preferred_khmer_font?: KhmerFont;
  avatar_url?: string | null;
}

export const SOURCE_LANGUAGES: { value: SourceLanguage; label: string; nativeLabel: string }[] = [
  { value: 'chinese', label: 'Chinese', nativeLabel: 'Manhua' },
  { value: 'korean', label: 'Korean', nativeLabel: 'Manhwa' },
  { value: 'japanese', label: 'Japanese', nativeLabel: 'Manga' },
  { value: 'english', label: 'English', nativeLabel: 'Comics' },
];

export const KHMER_FONTS: { value: KhmerFont; label: string }[] = [
  { value: 'noto-sans-khmer', label: 'Noto Sans Khmer' },
  { value: 'battambang', label: 'Battambang' },
  { value: 'nimbus-mono-khmer', label: 'Nimbus Mono Khmer' },
];
