import { config } from '../../exporter/src/common/config';

let hideClusterLabels: string[] = [];

const knownClusterColorMappings: Map<string, string> = new Map();
const knownOverlayClusterColorMappings: Map<string, string> = new Map();
const knownOverlayClusterHideCustomColorMappings: Map<string, string> = new Map();
const knownClusterNames: Map<string, Map<string, string>> = new Map();

for (let lang of config.settings.languages) {
    knownClusterNames.set(lang, new Map())
}

for (var cluster of config.clusters) {
    if (!cluster.name) {
        //err
    }

    if (cluster.label) {
        for (let lang of config.settings.languages) {
            const translation = knownClusterNames.get(lang)
            if (translation) translation.set(cluster.name, cluster.label[lang]);
        }
    }
    if (cluster.color) {
        knownClusterColorMappings.set(cluster.name, cluster.color);
    }
    if (cluster['overlay-off-color']) {
        knownOverlayClusterColorMappings.set(cluster.name, cluster.color)
        knownOverlayClusterHideCustomColorMappings.set(cluster.name, cluster['overlay-off-color']);
    }
    if (cluster['hide-label']) {
        hideClusterLabels.push(cluster.name);
    }
}

const clusterVisualConfig = {
    ...config,
    hideClusterLabels: hideClusterLabels,
    hiddenClusters: config.hiddenClusters,
    knownClusterNames: knownClusterNames,
    knownClusterColorMappings: knownClusterColorMappings,
    knownOverlayClusterColorMappings: knownOverlayClusterColorMappings,
    knownOverlayClusterHideCustomColorMappings: knownOverlayClusterHideCustomColorMappings
}

export {
    clusterVisualConfig as config
}