import { MultiDirectedGraph } from "graphology";
import { config } from "../../common/config";
import { IndexNode, ClusterRepPrio } from "../../common/model";
import forceAtlas2 from "../../graphology-layout-forceatlas2/index";
import circular from "graphology-layout/circular";
import * as fs from "fs";

function nailGlobus(
  totalNodes: number,
  nodes: {
    did: string;
    handle: string;
    community: number;
  }[],
  totalEdges: number,
  edges: {
    source: string;
    target: string;
    weight: number;
  }[],
  indexNodes: Map<string, IndexNode>
) {
  const communitiesGraph = new MultiDirectedGraph();
  const communities: Map<number, ClusterRepPrio> = new Map();

  for (let i = 0; i < totalNodes; i++) {
    const node = nodes[i];
    if (!communities.has(node.community)) {
      communities.set(node.community, { label: "", prio: 0 });
    }
    const rep = config.clusterRepresentatives.get(node.handle);
    if (rep !== undefined) {
      if (!communities.has(node.community) || communities.get(node.community)!.prio < rep.prio) {
        communities.set(node.community, rep)
      }
    }
  }

  for (const [community, rep] of communities) {
    communitiesGraph.addNode(community, {
      key: community,
      label: rep.label,
      community: community,
      size: 25,
    });
  }

  for (let i = 0; i < totalEdges; i++) {
    const edge = edges[i];
    const source = indexNodes.get(edge.source)?.community!;
    const target = indexNodes.get(edge.target)?.community!;
    if (source == target) continue;
    const graphEdge = communitiesGraph.findEdge(source, target, () => true);
    if (graphEdge) {
      communitiesGraph.updateEdgeAttribute(graphEdge, 'weight', v => v + edge.weight);
    } else {
      communitiesGraph.addEdge(source, target, { weight: edge.weight });
    }
  }

  communitiesGraph.forEachEdge((edge, attrs) => communitiesGraph.updateEdgeAttribute(edge, 'weight', v => Math.log(v)));

  circular.assign(communitiesGraph);
  const uaNode = communitiesGraph.findNode((node, attrs) => attrs.label == "ua");
  communitiesGraph.updateNode(uaNode, (attrs) => ({
    ...attrs,
    fixed: true,
    x: 0,
    y: 0,
  }));
  communitiesGraph.forEachNode((node, attrs) => {
    switch (attrs.label) {
      case "ua":
        communitiesGraph.updateNode(node, (attrs) => ({
          ...attrs,
          fixed: true,
          x: 0, y: 0,
        }));
        break;
      case "ru":
        communitiesGraph.updateNode(node, (attrs) => ({
          ...attrs,
          fixed: true,
          x: 100, y: 0,
        }));
        break;
      case "nafo":
        communitiesGraph.updateNode(node, (attrs) => ({
          ...attrs,
          fixed: true,
          x: -100, y: 0,
        }));
        break;
    }
  });

  forceAtlas2.assign(communitiesGraph, {
    settings: {
      ...forceAtlas2.inferSettings(communitiesGraph),
      outboundAttractionDistribution: true,
      edgeWeightInfluence: 2,
    },
    iterations: 1000,
  });

  // Flip to true to export communities layout
  if (false) {
    communitiesGraph.setAttribute("clusters", Array.from(communities.keys()).map((c) => ({
      label: communities.get(c)!.label,
      idx: c,
      size: 1,
    })));
    communitiesGraph.setAttribute("lastUpdated", new Date().toISOString());

    fs.writeFileSync("./out/exported_graph_enriched.json", JSON.stringify(communitiesGraph.export()));
    return;
  }
}

function globusForceCoordinates(communitiesGraph: MultiDirectedGraph, graph: MultiDirectedGraph) {
  const communityLocation: Map<number, { x: number, y: number }> = new Map();
  communitiesGraph.forEachNode((_, attrs) => {
    communityLocation.set(attrs.key, { x: attrs.x, y: attrs.y });
  });

  graph.forEachNode((n, { community }) => {
    if (community !== undefined) {
      const loc = communityLocation.get(community);
      if (loc) {
        // Scale down and shift to cluster location.
        // `circular` generates coords in [-1, 1] range.
        graph.updateNodeAttribute(n, 'x', x => x * 2 + loc.x / 10);
        graph.updateNodeAttribute(n, 'y', y => y * 2 + loc.y / 10);
      }
    }
  });

}
export { nailGlobus, globusForceCoordinates };