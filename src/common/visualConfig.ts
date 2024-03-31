import { config } from '../../exporter/src/common/config';
import { Layout, ClusterConfig } from "../../exporter/src/common/model";

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

function getAllLayouts(): Layout[] {
    var defaultLayout: Layout = config.layout.default;
    var allLayouts: Layout[] = [defaultLayout];
    if (config.layout.layouts) allLayouts = allLayouts.concat(config.layout.layouts);
    return allLayouts;
}


function getLayout(layoutName: string | null): Layout {
    var searchForLayout = getAllLayouts().filter(layout => layout.name === layoutName)[0];
    return searchForLayout || config.layout.default;;
}

function getLayoutName(layoutName: string | null): string {
    return getLayout(layoutName).name;
}

function getCluster(clusterName: string): ClusterConfig {
    return config.clusters.filter(cluster => cluster.name === clusterName)[0];
}

const clusterVisualConfig = {
    ...config,
    getAllLayouts,
    getLayout,
    getLayoutName,
    getCluster,
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