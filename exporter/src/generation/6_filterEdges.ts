import { MultiDirectedGraph } from "graphology";
import { config } from "../common/config";
import { AtlasLayout } from "../common/model";

function filterEdges(
    log: (msg: string) => void,
    graph: MultiDirectedGraph
) {
    log("Filtering edges...");
    // Mark top n edges as non-removable.
    graph.forEachNode((node, attrs) => {
        const edges = graph.edges(node);
        const sortedEdges = edges.sort((a, b) => {
            return (
                graph.getEdgeAttribute(b, "weight") -
                graph.getEdgeAttribute(a, "weight")
            );
        });
        const topEdges = sortedEdges.slice(0, config.settings.topNonRemovableEdges);
        topEdges.forEach((edge) => {
            graph.setEdgeAttribute(edge, 'stay', true);
        });
    });
    // Reduce all edges to the top n outbound edges for each node
    graph.forEachNode((node, attrs) => {
        const edges = graph.outEdges(node);
        const sortedEdges = edges.sort((a, b) => {
            return (
                graph.getEdgeAttribute(b, "weight") -
                graph.getEdgeAttribute(a, "weight")
            );
        });
        const topEdges = config.maxEdgesOverrides.get(attrs.label)
            ? sortedEdges.slice(0, config.maxEdgesOverrides.get(attrs.label))  // apply override
            : sortedEdges.slice(0, config.settings.maxEdges); // default
        const topEdgeSet = new Set(topEdges);
        edges.forEach((edge) => {
            if (graph.hasEdgeAttribute(edge, 'stay')) return;
            if (topEdgeSet.has(edge)) return;

            graph.dropEdge(edge);
        });
    });

    log(`Graph has ${graph.order} nodes and ${graph.size} edges.`);
}

export { filterEdges }