import { MultiDirectedGraph } from "graphology";
import { config } from "../common/config";
import { Node, IndexNode, AtlasLayout } from "../common/model"
import { size } from "lodash";

function addNodes(
    log: (msg: string) => void,
    layout: AtlasLayout,
    ctx: {
        totalNodes: number;
        nodes: Node[];
        indexNodes: Map<string, IndexNode>;
        hiddenNodes: Map<string, boolean>;
    },
    graph: MultiDirectedGraph
) {
    log("Adding nodes...");

    const excludedCommunities = config.toBeExcludedCommunities.get(layout.name);

    if (layout.nodeMapping?.community?.type !== "none")
        log(`Communities to be skipped: ${excludedCommunities && Array.from(excludedCommunities.keys())}`);

    for (let i = 0; i < ctx.totalNodes; i++) {
        if (i % 10000 === 0) {
            log(`Adding node ${i} of ${ctx.totalNodes - 1} `);
        }
        const node: any = ctx.nodes[i];
        const indexNode = {
            key: i,
            did: node.did,
            label: node.handle,
            community: node.community,
            size: node.size,
            cType: node.cType
        };
        const graphNode = {
            key: i,
            label: node.handle,
            did: node.did,
            community: node.community,
            size: node.size,
            cType: node.cType
        };
        if (excludedCommunities && excludedCommunities.get(node.community)
            && layout.nodeMapping?.community?.type !== "none") {
            ctx.hiddenNodes.set(node.did, true);
        } else {
            graph.addNode(i, graphNode);
            ctx.indexNodes.set(node.did, indexNode);
        }
    }
    log("Done adding nodes");
}

export { addNodes }