import { Layer, ClusterRepPrio } from "./model";

const clusterRepresentatives: Map<string, ClusterRepPrio> = new Map();

//more edges will be shown for focus clusters
const focusClusterLabels = [
    "ua-yellow",
    "ua-blue",

    "ua-extended",

    "ua-church",
    "ua-fun",
    "ua-art",
    "ua-lgbtqa",
    "ua-write",
    "ua-gaming",
    "ua-tech",
    "ua-kpop"
];

//weak (underlay)
//check representative every time
clusterRepresentatives.set("hto-ya.bsky.social", {
    label: "ua-extended",
    layer: Layer.MAIN,
    prio: 5,
});

//harmonic (big subclusters)
clusterRepresentatives.set("uabluerail.org", {
    label: "ua-yellow",
    layer: Layer.MAIN,
    prio: 5,
});
clusterRepresentatives.set("wormwoodstar.bsky.social", {
    label: "ua-blue",
    layer: Layer.MAIN,
    prio: 4,
});

//friends
clusterRepresentatives.set("hardrockfella.bsky.social", {
    label: "nafo",
    layer: Layer.MAIN,
    prio: 3,
});
//check representative every time
clusterRepresentatives.set("kyrylowozniak.bsky.social", {
    label: "nafo-extended",
    layer: Layer.HIDDEN,
    prio: 3,
});

//detail
//check representative every time
clusterRepresentatives.set("bsky.church", {
    label: "ua-church",
    layer: Layer.MAIN,
    prio: 6,
});
clusterRepresentatives.set("mohican.tech", {
    label: "ua-fun",
    layer: Layer.MAIN,
    prio: 6,
});
clusterRepresentatives.set("gniv.bsky.social", {
    label: "ua-art",
    layer: Layer.MAIN,
    prio: 6,
});
clusterRepresentatives.set("takeawaynoise.bsky.social", {
    label: "ua-lgbtqa",
    layer: Layer.MAIN,
    prio: 6,
});
clusterRepresentatives.set("kanadenka.bsky.social", {
    label: "ua-write",
    layer: Layer.MAIN,
    prio: 6,
});
clusterRepresentatives.set("holyagnostic.bsky.social", {
    label: "ua-gaming",
    layer: Layer.MAIN,
    prio: 6,
});
clusterRepresentatives.set("isimon.bsky.social", {
    label: "ua-tech",
    layer: Layer.MAIN,
    prio: 6,
});
clusterRepresentatives.set("paperpllant.bsky.social", {
    label: "ua-kpop",
    layer: Layer.MAIN,
    prio: 6,
});

//detail fixes (those that got their own detail clusters outside of ukrainian ones)
clusterRepresentatives.set("oyin.bo", {
    label: "ua-1",
    layer: Layer.MAIN,
    prio: 6,
});
clusterRepresentatives.set("tyrrrz.me", {
    label: "ua-2",
    layer: Layer.MAIN,
    prio: 6,
});

//hidden clusters
clusterRepresentatives.set("publeecist.bsky.social", {
    label: "ua-boroshno",
    layer: Layer.HIDDEN,
    prio: 3,
});
//check representative every time
clusterRepresentatives.set("larsen256.bsky.social", {
    label: "ua-boroshno-extended",
    layer: Layer.HIDDEN,
    prio: 3,
});
clusterRepresentatives.set("metronom.bsky.social", {
    label: "be",
    layer: Layer.HIDDEN,
    prio: 3,
});
clusterRepresentatives.set("tinaarishina.bsky.social", {
    label: "ru-other",
    layer: Layer.HIDDEN,
    prio: 4,
});
clusterRepresentatives.set("alphyna.bsky.social", {
    label: "ru",
    layer: Layer.HIDDEN,
    prio: 4,
});

//underlay clusters
//check representative every time
clusterRepresentatives.set("ffuuugor.bsky.social", {
    label: "ru-extended",
    layer: Layer.HIDDEN,
    prio: 4,
});
//check representative every time
clusterRepresentatives.set("shurikidze.bsky.social", {
    label: "be-extended",
    layer: Layer.HIDDEN,
    prio: 3,
});

//control clusters
clusterRepresentatives.set("killustration.bsky.social", {
    label: "artists",
    layer: Layer.MAIN,
    prio: 3,
});
clusterRepresentatives.set("jalpari.bsky.social", {
    label: "writers",
    layer: Layer.MAIN,
    prio: 3,
});
clusterRepresentatives.set("cactimutt.bsky.social", {
    label: "furry",
    layer: Layer.MAIN,
    prio: 3,
});
clusterRepresentatives.set("malwarejake.bsky.social", {
    label: "infosec",
    layer: Layer.MAIN,
    prio: 3,
});
clusterRepresentatives.set("lookitup.baby", {
    label: "tech",
    layer: Layer.MAIN,
    prio: 4,
});
clusterRepresentatives.set("pfrazee.com", {
    label: "startup",
    layer: Layer.MAIN,
    prio: 5,
});
clusterRepresentatives.set("gamedevlist.bsky.social", {
    label: "gamers",
    layer: Layer.MAIN,
    prio: 3,
});
clusterRepresentatives.set("onsu.re", {
    label: "web3",
    layer: Layer.MAIN,
    prio: 3,
});

const legacyClusterConfig = {
    focusClusters: focusClusterLabels,
    clusterRepresentatives: clusterRepresentatives,
}

export { legacyClusterConfig, Layer, ClusterRepPrio }