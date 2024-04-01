import { config } from '../../exporter/src/common/config';

var hideClusterLabels: string[] = [];

const knownClusterColorMappings: Map<string, string> = new Map();
const knownOverlayClusterColorMappings: Map<string, string> = new Map();
const knownOverlayClusterHideCustomColorMappings: Map<string, string> = new Map();
const knownClusterNames: Map<string, string> = new Map();

for (var cluster of config.clusters) {
    if (!cluster.name) {
        //err
    }

    if (cluster.label) {
        knownClusterNames.set(cluster.name, cluster.label);
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