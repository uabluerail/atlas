interface InputGraphData {
    graphVersion?: number;
    nodes: {
        did: string;
        handle?: string;
        community: number;
    }[];
    rels: {
        source: string;
        target: string;
        weight: number;
    }[];
    timestamp?: string;
}

interface InputCommunitiesData {
    graphVersion?: number;
    timestamp?: string;
    weakCommunities: {
        leader: string;
        name?: string;
        id: number;
    }[];
    harmonicCommunities: {
        leader: string;
        name?: string;
        id: number;
    }[];
    detailCommunities: {
        leader: string;
        name?: string;
        id: number;
    }[];
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
    name: string;
    label?: string;
    leader?: string;
    hide?: boolean;
    "hide-label"?: boolean;
    color: string;
    type: string;
    group?: string;
    legend?: {
        description: string;
        extra?: string;
        links?: {
            title: string;
            url: string;
        }[]
    }
}

interface AtlasSettings {
    settings: {
        graphVersion: number;
        configVersion: string;
        topNonRemovableEdges: number;
        maxEdges: number;
        lang: string;
        rotate: boolean;
        angle: number;
        globus: boolean;
        maxHistoricWeightSum: number;
        iterationCount: number;
        blackHoleGravity: number;
        hiddenClusterColor: string;
    }
    legend: AtlasLegend;
    layout: AtlasLayoutSettings;
    clusters: ClusterConfig[];
}

interface AtlasLegend {
    author: {
        name: string;
        url: string
    },
    arrows: string;
    algo: string;
    legends: {
        name: string;
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
    label: string;
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
    overlay?: string[],
    underlay?: string[]
}

interface GroupLegend {
    label: string;
    hide?: boolean;
    description: string;
    clusters: string[],
    extras?: string[],
    links?: {
        title: string;
        url: string;
    }[]
}

interface ClusterRepPrio {
    label: string;
    prio: number;
    displayName?: string;
    dbIndex?: number;
}

export { InputGraphData, InputCommunitiesData, AtlasLayout, GroupLegend, ClusterConfig, LayoutClusterGroup, Edge, Node, IndexNode, Cluster, AtlasSettings, ClusterRepPrio };