interface InputGraphData {
    graphVersion?: number;
    nodes: {
        did: string;
        handle?: string;
        community: number;
        size?: number;
        cType?: string
    }[];
    rels: {
        source: string;
        target: string;
        weight: number;
    }[];
    timestamp?: string;
}

interface Edge {
    source: string;
    target: string;
    weight: number;
}

interface Node {
    did: string;
    handle: string;
    community: number;
    size?: number;
    cType?: string;
}

interface IndexNode {
    key: number;
    did: string;
    label: string;
    community: number;
}

interface Cluster {
    label?: string;
    displayName?: string;
    idx: string;
    dbIndex?: number;
    x?: number;
    y?: number;
    color?: string;
    prio?: number;
    size: number;
    representative?: string;
    positions: { x: number; y: number }[];
}

interface ClusterConfig {
    community: number;
    name: string;
    label?: { [language: string]: string; }
    leader?: string;
    hide?: boolean;
    "hide-label"?: boolean;
    color: string;
    type: string;
    prio?: number;
    group?: string;
    legend?: {
        [language: string]: {
            description: string;
            extra?: string;
            links?: {
                title: string;
                url: string;
            }[]
        }
    }
}

interface ClusterTemplateConfig {
    community: string;
    name: string;
}

interface AtlasSettings {
    settings: {
        graphVersion: number;
        configVersion: string;
        topNonRemovableEdges: number;
        maxEdges: number;
        languages: string[];
        rotate: boolean;
        angle: number;
        globus: boolean;
        iterationCount: number;
        blackHoleGravity: number;
        hiddenClusterColor: string;
    }
    legend: AtlasLegend;
    layout: AtlasLayoutSettings;
    clusters: ClusterConfig[];
    cluster_templates: ClusterTemplateConfig[];
}

interface AtlasLegend {
    author: {
        name: string;
        url: string
    },
    legends: {
        name: string;
        overview?: {
            [language: string]: {
                summary: string,
                nodes: string,
                nodeWeight: string,
                relationships: string,
                relationshipWeight: string,
                algo: string,
                overview_red_arrows: string,
                overview_blue_arrows: string
            }
        },
        translation_overrides?: {
            [language: string]: { key: string, value: string }[]
        }
        groups: GroupLegend[]
    }[];
}

interface AtlasLayoutSettings {
    modes: {
        default: string[],
        moderator: string[]
    },
    layouts: AtlasLayout[];
}

interface AtlasLayout {
    name: string;
    fileName: string;
    searchFileName?: string;
    angle?: number;
    minSize?: number;
    maxSize?: number;
    maxHistoricWeightSum: number;
    blackHoleGravity?: number;
    label: { [key: string]: string };
    nodeMapping?: {
        id: {
            type: "concatUnderscore" | string
            nodeProperty: string,
        }
        community: {
            type: "none" | "fromProperty" | string
            nodeProperty?: string
        }
        weight: {
            type: "harmonicFromEdges" | "fromProperty" | string
            nodeProperty?: string
        }
        label: {
            nodeProperty?: string
        }
        color: {
            type: "fromColorMapByPropertyType" | "fromClusters" | string
            nodeProperty?: string
            colorMap?: { [key: string]: string }
        }
        score: {
            property?: string
        }
    }
    isMobile?: boolean;
    groups: {
        main: LayoutClusterGroup[],
        hidden?: LayoutClusterGroup[]
    };
    legend?: string;
}

interface LayoutClusterGroup {
    name: string;
    maxEdges?: number;
    "hide-label"?: boolean; //default false
    "hide-overlay-labels"?: boolean; //default true
    "hide-underlay-labels"?: boolean; //default true
    overlay?: string[],
    underlay?: string[]
}

interface GroupLegend {
    name: string;
    hide?: boolean;
    clusters?: string[],
    cluster_templates?: string[],
    legend: {
        [language: string]: {
            label: string;
            description: string;
            extras?: string[],
            links?: {
                title: string;
                url: string;
            }[]
        }
    }

}

interface ClusterRepPrio {
    label: string;
    prio: number;
    displayName?: string;
    dbIndex?: number;
}

export { InputGraphData, AtlasLayout, GroupLegend, ClusterConfig, LayoutClusterGroup, Edge, Node, IndexNode, Cluster, AtlasSettings, ClusterRepPrio };