import { AtlasSettings, ClusterRepPrio, ClusterConfig } from "./model";
import importedJson from "../../../config.json"
import { AtlasLayout, LayoutClusterGroup } from "../common/model"
import { parse } from "semver";

const clusterRepresentatives: Map<string, ClusterRepPrio> = new Map();

//more edges will be shown for focus clusters
var groupMaxEdgeOverrides: Map<string, number> = new Map();
var maxEdgesOverrides: Map<string, number> = new Map();
const toBeExcludedCommunities: Map<string, Map<number, boolean>> = new Map();
const includedClusters: Map<string, Map<string, boolean>> = new Map();
const hiddenClusters: Map<string, Map<string, boolean>> = new Map();
const overlayLayouts: Map<string, boolean> = new Map();

//important for type check
const configJson: AtlasSettings = importedJson;

var configVersion = parse(configJson.settings.configVersion);

if (configVersion == null) {
    throw new Error('Could not parse config version');
}

var allLayouts: AtlasLayout[] = configJson.layout.layouts;

for (var layout of allLayouts) {
    var includedInLayers: Map<string, boolean> = new Map();
    var layoutToBeExcludedCommunities: Map<number, boolean> = new Map();
    var layoutHiddenClusters: Map<string, boolean> = new Map();
    var allClusterGroups: LayoutClusterGroup[] = layout.groups.main;
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

    for (var cluster of importedJson.clusters) {
        const shouldBeRemoved = !includedInLayers.get(cluster.name);
        if (shouldBeRemoved && cluster.community !== -1) {
            layoutToBeExcludedCommunities.set(cluster.community, true)
        }
    }
}

for (var cluster of importedJson.clusters) {
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

function getAllLayoutsByMode(moderator: boolean): AtlasLayout[] {
    return moderator
        ? config.layout.layouts.filter(layout => config.layout.modes.moderator.indexOf(layout.name) !== -1)
        : config.layout.layouts.filter(layout => config.layout.modes.default.indexOf(layout.name) !== -1)
}

function getAllLayouts(): AtlasLayout[] {
    return config.layout.layouts;
}

function getDefaultLayout(moderator: boolean, isMobile?: boolean): string {
    var searchForLayout = getAllLayoutsByMode(moderator).filter(layout => isMobile === layout.isMobile || (!isMobile && !layout.isMobile))[0];
    return searchForLayout.name;
}

function getLayout(layoutName: string | null): AtlasLayout {
    return getAllLayouts().filter(layout => (!layoutName || layout.name === layoutName))[0];
}

function getLayoutByName(layoutName: string | null): AtlasLayout {
    return getAllLayouts().filter(layout => (!layoutName || layout.name === layoutName))[0];
}

function getLayoutName(layoutName: string | null): string {
    return getLayout(layoutName).name;
}

function getClusterByName(clusterName: string | undefined): ClusterConfig {
    return config.clusters.filter(cluster => cluster.name === clusterName)[0];
}

function getClusterByCommunity(community: number): ClusterConfig {
    return config.clusters.filter(cluster => cluster.community === community)[0];
}

const config = {
    ...importedJson,
    configVersion,
    json: importedJson,
    getAllLayouts: getAllLayoutsByMode,
    getDefaultLayout,
    getLayout,
    getLayoutName,
    getClusterByName,
    getClusterByCommunity,
    includedClusters: includedClusters,
    overlayLayouts: overlayLayouts,
    maxEdgesOverrides: maxEdgesOverrides,
    toBeExcludedCommunities: toBeExcludedCommunities,
    hiddenClusters: hiddenClusters,
    clusterRepresentatives: clusterRepresentatives,
}

export { config }