const hideClusterLabels: string[] = [

    // extended clusters
    'ru-extended',
    'be-extended',
    'ua-other-extended',
    'ua-other-extended',
    'nafo-extended',

    //ua harmonic subclusters
    'ua-yellow',
    'ua-blue',

    //ua detail subclusters
    'ua-church',
    'ua-fun',
    'ua-art',
    'ua-lgbtqa',
    'ua-write', //+фандоми
    'ua-gaming',
    'ua-tech',
    'ua-kpop',

    //ua detail fixes
    'ua-1',
    'ua-2',
    'ua-3',
    'ua-4',
];

const knownClusterColorMappings: Map<string, string> = new Map();
const knownClusterNames: Map<string, string> = new Map();
const moderationClusters: Map<string, boolean> = new Map();

knownClusterNames.set("ua-extended", "🇺🇦🐝🍯 Український Вулик");
knownClusterColorMappings.set("ua-yellow", "#ffd500");
knownClusterColorMappings.set("ua-blue", "#005bbb");
knownClusterColorMappings.set("ua-extended", "#ffe975");

knownClusterNames.set("ua-boroshno", "🇺🇦👁️‍🗨️ Публіцист & Co.");
knownClusterColorMappings.set("ua-boroshno", "#85B53C");
knownClusterColorMappings.set("ua-boroshno-extended", "#ff336d");
moderationClusters.set("ua-boroshno", false);
moderationClusters.set("ua-boroshno-extended", false);

knownClusterNames.set("ru-other", "🇷🇺⚒️ Дружби Народів");
knownClusterColorMappings.set("ru-other", "#c70202");
knownClusterColorMappings.set("ru-other-extended", "#ff336d");
moderationClusters.set("ru-other", true);
moderationClusters.set("ru-other-extended", true);

knownClusterNames.set("be", "🇧🇾 Бєларускій Мір");
knownClusterColorMappings.set("be", "darkred");
knownClusterColorMappings.set("be-extended", "#d1606f");
moderationClusters.set("be", true);
moderationClusters.set("be-extended", true);

knownClusterNames.set("ru", "🇷🇺 Рускій Мір");
knownClusterColorMappings.set("ru", "#57372c");
knownClusterColorMappings.set("ru-extended", "#876255");
moderationClusters.set("ru", true);
moderationClusters.set("ru-extended", true);

knownClusterNames.set("nafo", "🌍👩‍🚀👨‍🚀 NAFO");
knownClusterColorMappings.set("nafo", "#47044a");
knownClusterColorMappings.set("nafo-extended", "#7e5080");

knownClusterNames.set("artists", "🌍🖌️🎨 Художники");
knownClusterColorMappings.set("artists", "#ff4902");

knownClusterNames.set("furry", "🌍🦊🐺 Фурі");
knownClusterColorMappings.set("furry", "#ea02de");

knownClusterNames.set("writers", "🌍✍️📖 Письменники");
knownClusterColorMappings.set("writers", "#02cbea");

knownClusterNames.set("gamers", "🌍👾🎮 Ігророби");
knownClusterColorMappings.set("gamers", "#02e6a1");

knownClusterNames.set("infosec", "🌍🔐👩‍💻 Злі ITвці");
knownClusterColorMappings.set("infosec", "#8b0fff");

knownClusterNames.set("startup", "🌍💡💻 Стартапери");
knownClusterColorMappings.set("startup", "#9175ff");

knownClusterNames.set("tech", "🌍🚢🖥️ ITвці");
knownClusterColorMappings.set("tech", "#bf75ff");

knownClusterNames.set("web3", "🌍🤖🛸 Футуризм");
knownClusterColorMappings.set("web3", "#759cff");

const knownOverlayClusterColorMappings: Map<string, string> = new Map();

//overlay subclusters when on
knownOverlayClusterColorMappings.set("ua-church", "#ffd500");
knownOverlayClusterColorMappings.set("ua-fun", "#005bbb");
knownOverlayClusterColorMappings.set("ua-art", "#ff8000");
knownOverlayClusterColorMappings.set("ua-lgbtqa", "#7306c2");
knownOverlayClusterColorMappings.set("ua-write", "#00fbff");
knownOverlayClusterColorMappings.set("ua-gaming", "#1eff00");
knownOverlayClusterColorMappings.set("ua-tech", "#ff54f9");
//not detected anymore
knownOverlayClusterColorMappings.set("ua-kpop", "#600075");

//overlay subclusters when hidden
const knownOverlayClusterHideCustomColorMappings: Map<string, string> = new Map();

knownOverlayClusterHideCustomColorMappings.set("ua-church", "#ffd500");
knownOverlayClusterHideCustomColorMappings.set("ua-fun", "#005bbb");
knownOverlayClusterHideCustomColorMappings.set("ua-art", "#ffd500");
knownOverlayClusterHideCustomColorMappings.set("ua-lgbtqa", "#005bbb");
knownOverlayClusterHideCustomColorMappings.set("ua-write", "#005bbb");
knownOverlayClusterHideCustomColorMappings.set("ua-gaming", "#005bbb");
knownOverlayClusterHideCustomColorMappings.set("ua-tech", "#005bbb");
//not detected anymore
knownOverlayClusterHideCustomColorMappings.set("ua-kpop", "#005bbb");

//fix overlay (small subclusters not included in overlay, but affecting the visuals)
knownOverlayClusterColorMappings.set("ua-1", "#ffd500");
knownOverlayClusterColorMappings.set("ua-2", "#ffd500");
knownOverlayClusterColorMappings.set("ua-3", "#ffd500");
knownOverlayClusterColorMappings.set("ua-4", "#ffd500");
knownOverlayClusterHideCustomColorMappings.set("ua-1", "#ffd500");
knownOverlayClusterHideCustomColorMappings.set("ua-2", "#ffd500");
knownOverlayClusterHideCustomColorMappings.set("ua-3", "#ffd500");
knownOverlayClusterHideCustomColorMappings.set("ua-4", "#ffd500");

const clusterVisualConfig = {
    hideClusterLabels: hideClusterLabels,
    knownClusterNames: knownClusterNames,
    moderationClusters: moderationClusters,
    knownClusterColorMappings: knownClusterColorMappings,
    knownOverlayClusterColorMappings: knownOverlayClusterColorMappings,
    knownOverlayClusterHideCustomColorMappings: knownOverlayClusterHideCustomColorMappings

}

export {
    clusterVisualConfig,
    hideClusterLabels,
    knownClusterNames,
    moderationClusters,
    knownClusterColorMappings,
    knownOverlayClusterColorMappings,
    knownOverlayClusterHideCustomColorMappings
}