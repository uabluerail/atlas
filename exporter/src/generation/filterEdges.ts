import { MultiDirectedGraph } from "graphology";
import { atlasConfig } from "../common/atlasConfig"
import { legacyClusterConfig } from "../common/legacyClusterConfig";

function filterEdges(graph: MultiDirectedGraph) {

    // Mark top n edges as non-removable.
    graph.forEachNode((node, attrs) => {
        const edges = graph.edges(node);
        const sortedEdges = edges.sort((a, b) => {
            return (
                graph.getEdgeAttribute(b, "weight") -
                graph.getEdgeAttribute(a, "weight")
            );
        });
        const topEdges = sortedEdges.slice(0, atlasConfig.topNonRemovableEdges);
        topEdges.forEach((edge) => {
            graph.setEdgeAttribute(edge, 'stay', true);
        });
    });
    // Reduce all edges to the top n outbound edges for each node (m for Ukrainians)
    graph.forEachNode((node, attrs) => {
        const edges = graph.outEdges(node);
        const sortedEdges = edges.sort((a, b) => {
            return (
                graph.getEdgeAttribute(b, "weight") -
                graph.getEdgeAttribute(a, "weight")
            );
        });
        const topEdges = legacyClusterConfig.focusClusters.indexOf(attrs.label) > -1
            ? sortedEdges.slice(0, atlasConfig.maxEdgesForFocusCluster)  // max edges for ukrainians
            : sortedEdges.slice(0, atlasConfig.maxEdgesEveryone); // max edges for everyone else
        const topEdgeSet = new Set(topEdges);
        edges.forEach((edge) => {
            if (graph.hasEdgeAttribute(edge, 'stay')) return;
            if (topEdgeSet.has(edge)) return;

            graph.dropEdge(edge);
        });
    });

}

export { filterEdges }