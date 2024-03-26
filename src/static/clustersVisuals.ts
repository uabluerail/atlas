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
const hiddenClusters: Map<string, boolean> = new Map();

knownClusterNames.set("ua-extended", "🇺🇦🐝🍯 Вулик");
knownClusterColorMappings.set("ua-yellow", "#ffd500");
knownClusterColorMappings.set("ua-blue", "#005bbb");
knownClusterColorMappings.set("ua-extended", "#fae996");
hiddenClusters.set("ua-yellow", false);
hiddenClusters.set("ua-blue", false);
hiddenClusters.set("ua-extended", false);

knownClusterNames.set("ua-boroshno", "🇺🇦👁️‍🗨️ Публіцист & Co.");
knownClusterColorMappings.set("ua-boroshno", "#85B53C");
knownClusterColorMappings.set("ua-boroshno-extended", "#ff336d");
hiddenClusters.set("ua-boroshno", false);
hiddenClusters.set("ua-boroshno-extended", false);

knownClusterNames.set("ua-buffer", "🇺🇦🕊️ Дружби Народів");
knownClusterColorMappings.set("ua-buffer", "#ff646e");
hiddenClusters.set("ua-buffer", true);

knownClusterNames.set("ru-other", "🇷🇺🌎⚒️ рускій мір");
knownClusterColorMappings.set("ru-other", "#c70202");
knownClusterColorMappings.set("ru-other-extended", "#ff336d");
hiddenClusters.set("ru-other", true);
hiddenClusters.set("ru-other-extended", true);

knownClusterNames.set("be", "🇧🇾 білоруси");
knownClusterColorMappings.set("be", "darkred");
knownClusterColorMappings.set("be-extended", "#d1606f");
hiddenClusters.set("be", true);
hiddenClusters.set("be-extended", true);

knownClusterNames.set("ru", "🇷🇺 росіяни");
knownClusterColorMappings.set("ru", "#57372c");
knownClusterColorMappings.set("ru-extended", "#876255");
hiddenClusters.set("ru", true);
hiddenClusters.set("ru-extended", true);

knownClusterNames.set("nafo", "🇺🇦🌍🚀 NAFO");
knownClusterColorMappings.set("nafo", "#47044a");
knownClusterColorMappings.set("nafo-extended", "#7e5080");
hiddenClusters.set("nafo", false);
hiddenClusters.set("nafo-extended", false);

knownClusterNames.set("artists", "🌍🖌️🎨 Художники");
knownClusterColorMappings.set("artists", "#ff4902");
hiddenClusters.set("artists", false);

knownClusterNames.set("furry", "🌍🦊🐺 Фурі");
knownClusterColorMappings.set("furry", "#ea02de");
hiddenClusters.set("furry", false);

knownClusterNames.set("writers", "🌍✍️📖 Письменники");
knownClusterColorMappings.set("writers", "#02cbea");
hiddenClusters.set("writers", false);

knownClusterNames.set("gamers", "🌍👾🎮 Ігророби");
knownClusterColorMappings.set("gamers", "#02e6a1");
hiddenClusters.set("gamers", false);

knownClusterNames.set("infosec", "🌍🔐👩‍💻 Злі ITвці");
knownClusterColorMappings.set("infosec", "#8b0fff");
hiddenClusters.set("infosec", false);

knownClusterNames.set("startup", "🌍💡💻 Стартапери");
knownClusterColorMappings.set("startup", "#9175ff");
hiddenClusters.set("startup", false);

knownClusterNames.set("tech", "🌍🚢🖥️ ITвці");
knownClusterColorMappings.set("tech", "#bf75ff");
hiddenClusters.set("tech", false);

knownClusterNames.set("web3", "🌍🤖🛸 Футуризм");
knownClusterColorMappings.set("web3", "#759cff");
hiddenClusters.set("web3", false);

const knownOverlayClusterColorMappings: Map<string, string> = new Map();

//overlay subclusters when on
knownOverlayClusterColorMappings.set("ua-church", "#ffd500");
hiddenClusters.set("ua-church", false);
knownOverlayClusterColorMappings.set("ua-fun", "#005bbb");
hiddenClusters.set("ua-fun", false);
knownOverlayClusterColorMappings.set("ua-art", "#ff8000");
hiddenClusters.set("ua-art", false);
knownOverlayClusterColorMappings.set("ua-lgbtqa", "#7306c2");
hiddenClusters.set("ua-lgbtqa", false);
knownOverlayClusterColorMappings.set("ua-write", "#00fbff");
hiddenClusters.set("ua-write", false);
knownOverlayClusterColorMappings.set("ua-gaming", "#1eff00");
hiddenClusters.set("ua-gaming", false);
knownOverlayClusterColorMappings.set("ua-tech", "#ff54f9");
hiddenClusters.set("ua-tech", false);
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
    hiddenClusters: hiddenClusters,
    hiddenClusterColor: "#efefef",
    knownClusterColorMappings: knownClusterColorMappings,
    knownOverlayClusterColorMappings: knownOverlayClusterColorMappings,
    knownOverlayClusterHideCustomColorMappings: knownOverlayClusterHideCustomColorMappings
}

export {
    clusterVisualConfig,
    hideClusterLabels,
    knownClusterNames,
    hiddenClusters,
    knownClusterColorMappings,
    knownOverlayClusterColorMappings,
    knownOverlayClusterHideCustomColorMappings
}