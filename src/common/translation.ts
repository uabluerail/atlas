import translation_uk from "../../translation_uk.csv";
import translation_pl from "../../translation_pl.csv";
import translation_en from "../../translation_en.csv";
import { config } from '../../exporter/src/common/config';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const translationMap = {
    "pl": { lang2: "pl", translation: translation_pl, name: "Polski 🇵🇱", picker: true },
    "uk": { lang2: "uk", translation: translation_uk, name: "Українська 🇺🇦", picker: true },
    "en": { lang2: "en", translation: translation_en, name: "English 🇬🇧", picker: false },
    "en-GB": { lang2: "en", translation: translation_en, name: "English 🇬🇧", picker: true },
    "en-US": { lang2: "en", translation: translation_en, name: "English 🇺🇸", picker: true }
}

i18next.use(LanguageDetector).init();

const fallbackLanguage = "en";
const fallbackLanguageMap = {
    "uk": "en",
    "pl": "en"
}

const getFallbackLanguage = (language: string) => {
    return fallbackLanguageMap[language] ?? fallbackLanguage;
}

const languages = i18next.languages;

const autoPickLanguage = () => {
    //if contains Ukrainian, resolve Ukrainian
    console.log(languages && languages.toString());
    return (languages && languages.filter(lang => lang === 'uk')[0])
        ?? config.settings.languages[0] //fallback to language of legend
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
            return { lang2: translationMap[key].lang2, lang: key, name: translationMap[key].name }
        })
}

const getLanguageName = (name: string) => {
    return translationMap[name] && translationMap[name].name;
}

const getLanguageByName = (name: string | null) => {
    return name && translationMap[name] && name;
}

const getLanguageOrDefault = (name: string | null) => {
    return getLanguageByName(name) ?? autoPickLanguage();
}

const getLang2 = (language: string | null) => {
    return language && translationMap[language].lang2;
}

const getValueByLanguage = (translation: { [key: string]: any }, language: string) => {
    return translation[language]
        ?? translation[getLang2(language)]
        ?? translation[getFallbackLanguage(language)];
}

const getValueByLanguageFromMap = (translation: Map<string, Map<string, string>>, language: string) => {
    return translation.get(language)
        ?? translation.get(getLang2(language))
        ?? translation.get(getFallbackLanguage(language));
}

const lang2ToNames = (lang2: string[] | null) => {
    return (lang2 && lang2.map(lang2 => translationMap[lang2].name ?? lang2).toString());
}

export { getTranslation, getPickerLanguages, getLanguageName, getLanguageOrDefault, getLanguageByName, getValueByLanguage, lang2ToNames, getValueByLanguageFromMap }
