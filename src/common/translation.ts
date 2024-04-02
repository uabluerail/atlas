import translation_uk from "../../translation_uk.csv";
import translation_en from "../../translation_en.csv";
import { config } from '../../exporter/src/common/config';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const translationMap = {
    "uk": { translation: translation_uk, name: "Українська 🇺🇦", picker: true },
    "en": { translation: translation_en, name: "English 🇬🇧" },
    "en-GB": { translation: translation_en, name: "English 🇬🇧", picker: true },
    "en-US": { translation: translation_en, name: "English 🇺🇸", picker: true }
}

i18next.use(LanguageDetector).init();

const fallbackLanguage = "en";
const languages = i18next.languages;

const autoPickLanguage = () => {
    //if contains Ukrainian, resolve Ukrainian
    return (languages && languages.filter(lang => lang === 'uk')[0])
        ?? config.settings.lang //fallback to language of legend
        ?? fallbackLanguage; //fallback to default
}

const resolvedLanguage = autoPickLanguage();

const getTranslation = (key: string, language: string) => {
    language = language ?? resolvedLanguage;
    const translation: { key: string, value: string }[] = translationMap[language].translation;
    const translationEntry = translation.filter(entry => entry.key === key)[0]
        ?? translationMap[fallbackLanguage].translation.filter(entry => entry.key === key)[0];
    return translationEntry ? translationEntry.value : key;
}

const getPickerLanguages = () => {
    return Object.keys(translationMap)
        .filter(key => translationMap[key].name !== undefined && translationMap[key].picker)
        .map(key => {
            return { lang: key, name: translationMap[key].name }
        })
}

const getLanguageName = (name: string) => {
    return translationMap[name] && translationMap[name].name;
}

const getLanguageByName = (name: string | null) => {
    return (name && translationMap[name] && name) ?? autoPickLanguage();
}

export { getTranslation, getPickerLanguages, getLanguageName, getLanguageByName }
