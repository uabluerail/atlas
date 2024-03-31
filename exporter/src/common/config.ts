import { ClusterRepPrio } from "./model";
import configJson from "../../../config.json"
import { Layout, ClusterGroup } from "../common/model"

const clusterRepresentatives: Map<string, ClusterRepPrio> = new Map();

//more edges will be shown for focus clusters
var groupMaxEdgeOverrides: Map<string, number> = new Map();
var maxEdgesOverrides: Map<string, number> = new Map();
const toBeExcludedCommunities: Map<string, Map<number, boolean>> = new Map();
const includedClusters: Map<string, Map<string, boolean>> = new Map();
const hiddenClusters: Map<string, Map<string, boolean>> = new Map();
const overlayLayouts: Map<string, boolean> = new Map();

var allLayouts: Layout[] = [configJson.layout.default];
if (configJson.layout.layouts) allLayouts = allLayouts.concat(configJson.layout.layouts);

for (var layout of allLayouts) {
    var includedInLayers: Map<string, boolean> = new Map();
    var layoutToBeExcludedCommunities: Map<number, boolean> = new Map();
    var layoutHiddenClusters: Map<string, boolean> = new Map();
    var allClusterGroups: ClusterGroup[] = layout.groups.main;
    toBeExcludedCommunities.set(layout.name, layoutToBeExcludedCommunities)
    includedClusters.set(layout.name, includedInLayers)
    hiddenClusters.set(layout.name, layoutHiddenClusters);

    if (layout.groups.hidden) {
        allClusterGroups = allClusterGroups.concat(layout.groups.hidden);
        for (var clusterInHiddenGroup of layout.groups.hidden) {
            layoutHiddenClusters.set(clusterInHiddenGroup.name, true);
            if (clusterInHiddenGroup.underlay) {
                for (var clusterInHiddenUnderlay of clusterInHiddenGroup.underlay) {
                    layoutHiddenClusters.set(clusterInHiddenUnderlay, true);
                }
            }
        }
    }
    if (layout.groups.dot) allClusterGroups = allClusterGroups.concat(layout.groups.dot);

    for (var clusterInGroup of allClusterGroups) {
        includedInLayers.set(clusterInGroup.name, true);
        if (clusterInGroup.overlay) {
            overlayLayouts.set(layout.name, true);
            for (var clusterNameInOverlay of clusterInGroup.overlay) {
                includedInLayers.set(clusterNameInOverlay, true);
            }
        }
        if (clusterInGroup.underlay) {
            for (var clusterNameInUnderlay of clusterInGroup.underlay) {
                includedInLayers.set(clusterNameInUnderlay, true);
            }
        }
    }

    for (var cluster of configJson.clusters) {
        const shouldBeRemoved = !includedInLayers.get(cluster.name);
        if (shouldBeRemoved && cluster.community !== -1) {
            layoutToBeExcludedCommunities.set(cluster.community, true)
        }
    }
}

for (var cluster of configJson.clusters) {
    const maxEdgesOverride = cluster.group && groupMaxEdgeOverrides.get(cluster.group);
    if (maxEdgesOverride) {
        maxEdgesOverrides.set(cluster.name, maxEdgesOverride)
    }

    if (cluster.leader) {
        clusterRepresentatives.set(cluster.leader, {
            label: cluster.name,
            prio: cluster.prio ?? 0
        });
    }
}

const config = {
    ...configJson,
    includedClusters: includedClusters,
    overlayLayouts: overlayLayouts,
    maxEdgesOverrides: maxEdgesOverrides,
    toBeExcludedCommunities: toBeExcludedCommunities,
    hiddenClusters: hiddenClusters,
    clusterRepresentatives: clusterRepresentatives,
}

export { config }