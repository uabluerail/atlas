import { MultiDirectedGraph } from "graphology";
import { Cluster } from "../common/model"
import { legacyClusterConfig } from "../common/legacyClusterConfig";

const communityClusters: { [key: string]: Cluster } = {};

function log(msg: string) {
    console.log(`${new Date().toLocaleString()}: ${msg}`);
}

function initializeClusters(version: number | undefined, graph: MultiDirectedGraph) {
    // initialize clusters from graph data

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

        //assign representatives through clusterConfig (legacy generation)
        if (version === -1) {
            const repClusterPrio = legacyClusterConfig.clusterRepresentatives.get(atts.label);
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
        }
    });
}

function assignClusterPositions(graph: MultiDirectedGraph) {
    graph.forEachNode((_, atts) => {
        if (atts.community === undefined || atts.community === null) return;
        const cluster = communityClusters[atts.community];
        if (cluster === undefined) return;
        cluster.positions.push({ x: atts.x, y: atts.y });
    });

    // Filter positions that are 2 standard deviations away from the mean and compute the barycenter of each cluster
    for (const community in communityClusters) {
        let x_positions = communityClusters[community].positions.map((p) => p.x);
        let y_positions = communityClusters[community].positions.map((p) => p.y);

        log(`Processing community ${communityClusters[community].label}...`);

        if (x_positions.length === 0 || y_positions.length === 0) {
            log(`Skipping community ${communityClusters[community].label}...`);
            continue; // Skip this community if it has no positions
        }

        const mean_x =
            x_positions.reduce((acc, x) => acc + x, 0) / x_positions.length;
        const mean_y =
            y_positions.reduce((acc, y) => acc + y, 0) / y_positions.length;

        const std_x = Math.sqrt(
            x_positions
                .map((x) => Math.pow(x - mean_x, 2))
                .reduce((a, b) => a + b, 0) / x_positions.length
        );
        const std_y = Math.sqrt(
            y_positions
                .map((y) => Math.pow(y - mean_y, 2))
                .reduce((a, b) => a + b, 0) / y_positions.length
        );

        log(
            `Community ${communityClusters[community].label} mean: (${mean_x}, ${mean_y}) std: (${std_x}, ${std_y})`
        );

        log(
            `Community ${communityClusters[community].label} positions: ${communityClusters[community].positions.length}`
        );

        const filtered_positions = communityClusters[community].positions.filter(
            (p) =>
                Math.abs(p.x - mean_x) <= 2 * std_x &&
                Math.abs(p.y - mean_y) <= 2 * std_y
        );

        log(
            `Community ${communityClusters[community].label} filtered positions: ${filtered_positions.length}`
        );

        if (filtered_positions.length === 0) {
            log(`Skipping community ${communityClusters[community].label}...`);
            continue; // Skip this community if there are no positions within 2 standard deviations
        }

        communityClusters[community].x = parseFloat(
            (
                filtered_positions.reduce((acc, p) => acc + p.x, 0) /
                filtered_positions.length
            ).toFixed(2)
        );
        communityClusters[community].y = parseFloat(
            (
                filtered_positions.reduce((acc, p) => acc + p.y, 0) /
                filtered_positions.length
            ).toFixed(2)
        );

        log(
            `Community ${communityClusters[community].label} barycenter: (${communityClusters[community].x}, ${communityClusters[community].y})`
        );
    }

    // Strip the positions from the cluster objects
    for (const community in communityClusters) {
        communityClusters[community].positions = [];
    }

    graph.setAttribute("clusters", communityClusters);

    log(`Number of clusters: ${Object.keys(communityClusters).length}`);
    for (const communityIdx in communityClusters) {
        const community = communityClusters[communityIdx];
        log(
            `Cluster ${community.label || community.idx
            }, size: ${community.size.toLocaleString()}, representative: ${community.representative || "N/A"
            }`
        );
    }
}

export { initializeClusters as assignClusters, assignClusterPositions as processCommunities }