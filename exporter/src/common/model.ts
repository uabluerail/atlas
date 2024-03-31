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

interface ClusterGroup {
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

interface Layout {
    name: string;
    label: string;
    groups: {
        main: ClusterGroup[],
        hidden?: ClusterGroup[],
        dot?: ClusterGroup[]
    };
    legend?: GroupLegend[]
}

interface AtlasSettings {
    rotate: boolean,
    angle: number,
    globus: boolean,
    maxHistoricWeightSum: number,
    iterationCount: number,
    blackHoleGravity: number,
    topNonRemovableEdges: number,
    maxEdgesEveryone: number,
    maxEdgesForFocusCluster: number
}

interface ClusterRepPrio {
    label: string;
    prio: number;
    displayName?: string;
    dbIndex?: number;
}

export { InputGraphData, InputCommunitiesData, Layout, GroupLegend, ClusterConfig, ClusterGroup, Edge, Node, IndexNode, Cluster, AtlasSettings, ClusterRepPrio };