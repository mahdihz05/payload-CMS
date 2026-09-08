const DIACRITICS = /[\u064b-\u065f\u0670]/g;
const WHITESPACE = /\s+/g;
const ARABIC_CHARACTERS: Record<string, string> = { "ي": "ی", "ى": "ی", "ك": "ک", "ة": "ه", "ؤ": "و", "إ": "ا", "أ": "ا" };
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[يىكةؤإأ]/g, (character) => ARABIC_CHARACTERS[character] ?? character)
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(DIACRITICS, "")
    .replace(/\u200c/g, " ")
    .replace(WHITESPACE, " ")
    .trim()
    .toLocaleLowerCase();
}
