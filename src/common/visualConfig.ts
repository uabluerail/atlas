import { config } from '../../exporter/src/common/config';
import xolor from 'xolor';

let hideClusterLabels: Map<string, Map<string, boolean>> = new Map();

const overlayClusterParents: Map<string, string> = new Map();
const knownClusterColorMappings: Map<string, string> = new Map();
const knownOverlayClusterColorMappings: Map<string, string> = new Map();
const knownClusterNames: Map<string, Map<string, string>> = new Map();

for (let lang of config.settings.languages) {
    knownClusterNames.set(lang, new Map())
}

for (let layout of config.layout.layouts) {
    let hideClusterLabelsPerLayout: Map<string, boolean> = new Map();
    hideClusterLabels.set(layout.name, hideClusterLabelsPerLayout);
    let allLayoutGroups = layout.groups.hidden ? layout.groups.main.concat(layout.groups.hidden) : layout.groups.main;
    for (let group of allLayoutGroups) {
        if (group['hide-label']) {
            hideClusterLabelsPerLayout.set(group.name, true);
        }
        if (group.overlay) {
            const parentCluster = group.name;
            for (let overlayCluster of group.overlay) {
                if (group['hide-overlay-labels'] !== false) {
                    hideClusterLabelsPerLayout.set(overlayCluster, true);
                }
                overlayClusterParents.set(overlayCluster, parentCluster);
            }
        }
        if (group.underlay) {
            for (let underlayCluster of group.underlay) {
                if (group['hide-underlay-labels'] !== false) {
                    hideClusterLabelsPerLayout.set(underlayCluster, true);
                }
            }
        }
    }
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
        const parentClusterName = overlayClusterParents.get(cluster.name);
        if (parentClusterName) {
            //get main color from parent cluster, will be shown by default
            knownClusterColorMappings.set(cluster.name, config.getClusterByName(parentClusterName).color);
            //get overlay color from itself, will be shown when overlays are on
            knownOverlayClusterColorMappings.set(cluster.name, cluster.color)
        } else {
            knownClusterColorMappings.set(cluster.name, cluster.color);
        }
    }
    // if (cluster['hide-label']) {
    //     hideClusterLabels.set(cluster.name, true);
    // }
}

const getContrastColor = (color: string | undefined): string => {
    if (!color) {
        return "#000000";
    }

    const c = xolor(color);
    const brightness = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
    return brightness >= 128 ? "#000000" : "#ffffff";
}

const truncateText = (text: string, size: number): string => {
    return text.length > size ? text?.substring(0, size) + "..." : text;
}

const clusterVisualConfig = {
    ...config,
    getContrastColor,
    truncateText,
    hideClusterLabels: hideClusterLabels,
    hiddenClusters: config.hiddenClusters,
    knownClusterNames: knownClusterNames,
    knownClusterColorMappings: knownClusterColorMappings,
    knownOverlayClusterColorMappings: knownOverlayClusterColorMappings
}

export {
    clusterVisualConfig as config
}