import translation_uk from "../../translation_uk.csv";
import translation_en from "../../translation_en.csv";
import config from "../../config.json";

const translationMap = {
    "uk": translation_uk,
    "en": translation_en
}

const getTranslation = (key: string) => {
    const defaultTranslation = translation_uk;
    const translation: { key: string, value: string }[] = translationMap[config.settings.lang] ?? defaultTranslation;
    const translationEntry = translation.filter(entry => entry.key === key)[0]
        ?? defaultTranslation.filter(entry => entry.key === key)[0];
    return translationEntry ? translationEntry.value : key;
}

export { getTranslation }
