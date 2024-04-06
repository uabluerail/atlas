interface Edge {
    source: string;
    target: string;
    weight: number;
    ogWeight: number;
}

interface Node {
    key: number;
    size: number;
    label: string;
    did: string;
}

interface MootNode {
    node: string;
    size: number;
    community: number;
    avatarUrl?: string;
    label: string;
    did: string;
    weight: number;
}

interface Cluster {
    label?: string;
    displayName?: string;
    idx: string;
    x?: number;
    y?: number;
    color?: string;
    size: number;
    positions: { x: number; y: number }[];
}

export type { Edge, Node, MootNode, Cluster };