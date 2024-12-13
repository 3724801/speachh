import { LANGUAGES } from '../constants.js';

export function getLanguageLabel(languageCode) {
    return Object.values(LANGUAGES).find(lang => lang.code === languageCode)?.label || languageCode;
}

export function toggleLanguage(currentLanguage) {
    return currentLanguage === LANGUAGES.ENGLISH.code ? LANGUAGES.ARABIC.code : LANGUAGES.ENGLISH.code;
}