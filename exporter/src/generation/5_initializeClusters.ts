import { MultiDirectedGraph } from "graphology";
import { Cluster } from "../common/model"
import { config } from "../common/config";

function initializeClusters(
    log: (msg: string) => void,
    graph: MultiDirectedGraph
) {
    // initialize clusters from graph data
    log("Initializing clusters...");

    const communityClusters: { [key: string]: Cluster } = {};

    graph.forEachNode((_, atts) => {
        const idx = atts.community;
        // If this node is in a community that hasn't been seen yet, create a new cluster
        if (!communityClusters[idx]) {
            communityClusters[idx] = {
                idx: idx,
                positions: [],
                size: 1,
            };
        } else {
            // Otherwise, increment the size of the cluster
            communityClusters[idx].size++;
        }

        const repClusterPrio = config.clusterRepresentatives.get(atts.label);
        // If this node is the representative of its cluster, set the cluster representative
        if (repClusterPrio !== undefined) {
            // If the cluster already has a representative, check if this rep's cluster has a higher priority
            const currentPrio = communityClusters[idx].prio;
            if (currentPrio === undefined || repClusterPrio.prio > currentPrio) {
                communityClusters[idx].representative = atts.label;
                communityClusters[idx].prio = repClusterPrio.prio;
                communityClusters[idx].label = repClusterPrio.label;
                communityClusters[idx].dbIndex = repClusterPrio.dbIndex;
                communityClusters[idx].displayName = repClusterPrio.displayName;
            }
        }
    });

    log("Truncating node position assignments...");
    // Reduce precision on node x and y coordinates to conserve bits in the exported graph
    graph.updateEachNodeAttributes((_, attrs) => {
        attrs.x = parseFloat(attrs.x.toFixed(2));
        attrs.y = parseFloat(attrs.y.toFixed(2));
        return attrs;
    });
    log("Done truncating node position assignments");

    return communityClusters;
}

export { initializeClusters }