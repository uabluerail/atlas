interface InputData {
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

enum Layer {
    MAIN, MODERATION, NONE
}

interface AtlasSettings {
    rotate: boolean,
    angle: number,
    globusUkrajiny: boolean,
    maxHistoricWeightSum: number,
    iterationCount: number,
    blackHoleGravity: number,
    topNonRemovableEdges: number,
    maxEdgesEveryone: number,
    maxEdgesForFocusCluster: number
}

interface ClusterRepPrio {
    label: string;
    layer: Layer;
    prio: number;
    displayName?: string;
    dbIndex?: number;
}

export { InputData, Edge, Node, IndexNode, Cluster, Layer, AtlasSettings, ClusterRepPrio };