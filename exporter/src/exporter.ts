import { MultiDirectedGraph } from "graphology";
import forceAtlas2 from "./graphology-layout-forceatlas2/index.js";
import circular from "graphology-layout/circular";
import rotation from 'graphology-layout/rotation';
import * as fs from "fs";

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

interface ClusterRepPrio {
  label: string;
  prio: number;
  displayName?: string;
  dbIndex?: number;
}

const clusterRepresentatives: Map<string, ClusterRepPrio> = new Map();

//more edges will be shown for focus clusters
const focusClusterLabels = [
  "ua-yellow",
  "ua-blue",

  "ua-extended",

  "ua-church",
  "ua-fun",
  "ua-art",
  "ua-lgbtqa",
  "ua-write",
  "ua-gaming",
  "ua-tech",
  "ua-kpop"
];

const topNonRemovableEdges = 3;
const maxEdgesForFocusCluster = 10;
const maxEdgesEveryone = 5;

//for maxHistoricWeightSum it is recommended to monitor logs and adjust to an appropriate value with every significant change
const layoutSettings = {
  classic: {
    rotate: false,
    angle: 12 * Math.PI / 7,
    globusUkrajiny: true,
    maxHistoricWeightSum: 1000,
    iterationCount: 600,
    blackHoleGravity: 0.5
  },
  harmonic: {
    rotate: false,
    angle: 12 * Math.PI / 7,
    globusUkrajiny: true,
    maxHistoricWeightSum: 20000,
    iterationCount: 800,
    blackHoleGravity: 1.5
  },
  dual: {
    rotate: true,
    angle: 8 * Math.PI / 7,
    globusUkrajiny: false,
    maxHistoricWeightSum: 20000,
    iterationCount: 800,
    blackHoleGravity: 1.5
  }
};

//based on the algorithm used in input graph.json - choose the mode to run the Atlas on
//switch the mode here with optimal settings for each mode
const atlasLayout = layoutSettings.dual;

clusterRepresentatives.set("uabluerail.org", {
  label: "ua-yellow",
  displayName: "🇺🇦🟡 Жовті",
  prio: 5,
});
clusterRepresentatives.set("wormwoodstar.bsky.social", {
  label: "ua-blue",
  displayName: "🇺🇦📘 Сині",
  prio: 4,
});

//underlay
//check representative every time
clusterRepresentatives.set("hto-ya.bsky.social", {
  label: "ua-extended",
  displayName: "🇺🇦🐝🍯 Український Вулик",
  prio: 5,
});

//overlay
//check representative every time
clusterRepresentatives.set("bsky.church", {
  label: "ua-church",
  prio: 6,
});
clusterRepresentatives.set("mohican.tech", {
  label: "ua-fun",
  prio: 6,
});
clusterRepresentatives.set("gniv.bsky.social", {
  label: "ua-art",
  prio: 6,
});
clusterRepresentatives.set("takeawaynoise.bsky.social", {
  label: "ua-lgbtqa",
  prio: 6,
});
clusterRepresentatives.set("kanadenka.bsky.social", {
  label: "ua-write",
  prio: 6,
});
clusterRepresentatives.set("holyagnostic.bsky.social", {
  label: "ua-gaming",
  prio: 6,
});
clusterRepresentatives.set("isimon.bsky.social", {
  label: "ua-tech",
  prio: 6,
});
clusterRepresentatives.set("paperpllant.bsky.social", {
  label: "ua-kpop",
  prio: 6,
});

//fixes
clusterRepresentatives.set("oyin.bo", {
  label: "ua-1",
  prio: 6,
});
clusterRepresentatives.set("tyrrrz.me", {
  label: "ua-2",
  prio: 6,
});

clusterRepresentatives.set("publeecist.bsky.social", {
  label: "ua-other",
  displayName: "🇺🇦👁️‍🗨️👽 ім. П. Борошна",
  prio: 3,
});
clusterRepresentatives.set("metronom.bsky.social", {
  label: "be",
  displayName: "🇧🇾 Бєларускій мір",
  prio: 3,
});
clusterRepresentatives.set("tinaarishina.bsky.social", {
  label: "ru-other",
  displayName: "⚒️🇷🇺🇧🇾+ Дружби народів",
  prio: 4,
});
clusterRepresentatives.set("alphyna.bsky.social", {
  label: "ru",
  displayName: "🇷🇺 Рускій мір",
  prio: 4,
});
//check representative every time
clusterRepresentatives.set("ffuuugor.bsky.social", {
  label: "ru-extended",
  displayName: "ру-розширений",
  prio: 4,
});
//check representative every time
clusterRepresentatives.set("shurikidze.bsky.social", {
  label: "be-extended",
  displayName: "🇧🇾 Бєларускій мір",
  prio: 3,
});
//check representative every time
clusterRepresentatives.set("larsen256.bsky.social", {
  label: "ua-other-extended",
  displayName: "дн-розширений",
  prio: 3,
});
//check representative every time
clusterRepresentatives.set("kyrylowozniak.bsky.social", {
  label: "nafo-extended",
  displayName: "нафо-розширений",
  prio: 3,
});
clusterRepresentatives.set("hardrockfella.bsky.social", {
  label: "nafo",
  displayName: "🌍👩‍🚀👨‍🚀 NAFO",
  prio: 3,
});
clusterRepresentatives.set("killustration.bsky.social", {
  label: "artists",
  displayName: "🌍🖌️🎨 Художники",
  prio: 3,
});
clusterRepresentatives.set("jalpari.bsky.social", {
  label: "writers",
  displayName: "🌍✍️📖 Письменники",
  prio: 3,
});
clusterRepresentatives.set("cactimutt.bsky.social", {
  label: "furry",
  displayName: "🌍🦊🐺 Фурі",
  prio: 3,
});
clusterRepresentatives.set("malwarejake.bsky.social", {
  label: "infosec",
  displayName: "🌍🔐👩‍💻 Злі ITвці",
  prio: 3,
});
clusterRepresentatives.set("lookitup.baby", {
  label: "it",
  displayName: "🌍🚢🖥️ ITвці",
  prio: 4,
});
clusterRepresentatives.set("pfrazee.com", {
  label: "frontend",
  displayName: "🌍💡💻 Стартапери",
  prio: 5,
});
clusterRepresentatives.set("gamedevlist.bsky.social", {
  label: "gamers",
  displayName: "🌍👾🎮 Ігророби",
  prio: 3,
});
clusterRepresentatives.set("onsu.re", {
  label: "web3",
  displayName: "🌍🤖🛸 Футуризм",
  prio: 3,
});

// log logs a message with a timestamp in human-readale format
function log(msg: string) {
  console.log(`${new Date().toLocaleString()}: ${msg}`);
}

async function fetchGraph(filename?: string) {
  log("Loading graph...");
  const data = JSON.parse(fs.readFileSync(filename || "graph.json", "utf8")) as InputData;

  log("Parsing graph file...");
  // Sort the nodes by did so that the order is consistent
  const nodes = data.nodes.map((node): Node => {
    return { ...node, handle: node.handle || node.did };
  }).sort((a, b) => {
    if (a.did < b.did) {
      return -1;
    } else if (a.did > b.did) {
      return 1;
    } else {
      return 0;
    }
  });

  const edges = data.rels.map((rel): Edge => {
    return { ...rel, };
  });

  log("Done parsing graph response");
  return { edges, nodes, timestamp: data.timestamp };
}

// If "enriched" is set, leave DIDs in the node data

log("Starting exporter...");

fetchGraph(process.argv[2]).then((graphData: { edges: Edge[]; nodes: Node[], timestamp?: string }) => {
  const { edges, nodes } = graphData;
  // Create the graph
  const graph = new MultiDirectedGraph();
  const totalEdges = edges.length;
  const totalNodes = nodes.length;
  const indexNodes: Map<string, IndexNode> = new Map();

  log("Adding nodes...");
  for (let i = 0; i < totalNodes; i++) {
    if (i % 10000 === 0) {
      log(`Adding node ${i} of ${totalNodes - 1}`);
    }
    const node = nodes[i];
    const indexNode = {
      key: i,
      did: node.did,
      label: node.handle,
      community: node.community,
    };
    const graphNode = {
      key: i,
      label: node.handle,
      did: node.did,
      community: node.community,
    };
    graph.addNode(i, graphNode);
    indexNodes.set(node.did, indexNode);
  }

  log("Done adding nodes");

  // Create a map of edges for quick reverse lookups
  const edgeMap: Map<string, Edge> = new Map();
  for (let i = 0; i < totalEdges; i++) {
    const edge = edges[i];
    edgeMap.set(`${edge.source}-${edge.target}`, edge);
  }

  // First, find the minimum and maximum weights in the graph
  let minWeight = Infinity;
  let maxWeight = -Infinity;
  let totalWeight = 0;

  for (let i = 0; i < totalEdges; i++) {
    const edge = edges[i];
    minWeight = Math.min(minWeight, edge.weight);
    maxWeight = Math.max(maxWeight, edge.weight);
    totalWeight += edge.weight;
  }

  const logMinWeight = Math.log(minWeight);
  const logMaxWeight = Math.log(maxWeight);
  const minEdgeSize = 0.2;
  const maxEdgeSize = 4;

  log("Adding edges...");
  // Then, set the size of each edge based on its weight relative to the min and max weights
  for (let i = 0; i < totalEdges; i++) {
    if (i % 100000 === 0) {
      log(`Adding edge ${i} of ${totalEdges - 1}`);
    }
    const edge = edges[i];

    let weight = edge.weight;
    const partnerEdge = edgeMap.get(`${edge.target}-${edge.source}`);
    if (partnerEdge !== undefined) {
      const bothEdgeWeight = edge.weight + partnerEdge.weight;
      const mutualityFactor =
        (edge.weight / bothEdgeWeight) * (partnerEdge.weight / bothEdgeWeight);
      weight =
        mutualityFactor * bothEdgeWeight * (1 + Math.log(bothEdgeWeight));
    }

    // Calculate the size based on the logarithm of the edge weight relative to the range of weights
    const size =
      minEdgeSize +
      ((Math.log(weight) - logMinWeight) / (logMaxWeight - logMinWeight)) *
      (maxEdgeSize - minEdgeSize);

    graph.addEdge(
      indexNodes.get(edge.source)?.key,
      indexNodes.get(edge.target)?.key,
      {
        ogWeight: edge.weight,
        weight: parseFloat(weight.toFixed(2)),
        size: parseFloat(size.toFixed(2)),
      }
    );
  }

  log("Done adding edges");

  const communitiesGraph = new MultiDirectedGraph();
  if (atlasLayout.globusUkrajiny) {
    const communities: Map<number, ClusterRepPrio> = new Map();

    for (let i = 0; i < totalNodes; i++) {
      const node = nodes[i];
      if (!communities.has(node.community)) {
        communities.set(node.community, { label: "", prio: 0 });
      }
      const rep = clusterRepresentatives.get(node.handle);
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

  // const degrees = graph.nodes().map((node) => graph.degree(node));
  // const minDegree = degrees.reduce((a, b) => Math.min(a, b));
  // const maxDegree = degrees.reduce((a, b) => Math.max(a, b));
  const skyBluePalette = [
    "#009ACD", // DeepSkyBlue3
    "#5B9BD5", // CornflowerBlue
    "#7EC0EE", // SkyBlue2
    "#87CEFA", // LightSkyBlue1
    "#4A708B", // SkyBlue4
    "#1E90FF", // DodgerBlue
    "#00BFFF", // DeepSkyBlue
    "#3CB371", // MediumSeaGreen
    "#FF7F50", // Coral
    "#FF4500", // OrangeRed
  ];
  const minSize = 1.5,
    maxSize = 15;
  log("Assigning attributes...");

  let minHarmonicWeightSum = Infinity;
  let maxHarmonicWeightSum = -Infinity;

  graph.forEachNode((node) => {

    const harmonicWeightMap = new Map<string, number>();

    const inWeightMap = graph?.reduceInEdges<any>(
      node,
      (acc, _, edgeAttrs, source, target) => {
        const inWeight = edgeAttrs.weight;
        const existingMootEntry = acc.get(source);
        if (existingMootEntry === undefined && source !== target) {
          acc.set(source, inWeight);
        }
        return acc;
      },
      new Map()
    );

    const outWeightMap = graph?.reduceOutEdges<any>(
      node,
      (acc, _, edgeAttrs, source, target) => {
        const outWeight = edgeAttrs.weight;
        if (acc.get(target) === undefined && source !== target) {
          acc.set(target, outWeight);
          const inWeight = inWeightMap.get(target);
          if (inWeight !== undefined && harmonicWeightMap.get(target) === undefined) {
            const harmonicWeight = inWeight + outWeight > 0 ? 2 * inWeight * outWeight / (inWeight + outWeight) : 0;
            harmonicWeightMap.set(target, harmonicWeight);
          }
        }
        return acc;
      },
      new Map()
    );

    const sortedHarmonicMap: number[] = Array.from(harmonicWeightMap.values());

    let harmonicWeightLogSum = 0;

    sortedHarmonicMap
      // .sort((a, b) => b - a)
      // .slice(0, 100) //count only top 100 moots
      .forEach((harmonicWeight) => {
        harmonicWeightLogSum += Math.log(1 + harmonicWeight);
      });

    minHarmonicWeightSum = Math.min(minHarmonicWeightSum, harmonicWeightLogSum);
    maxHarmonicWeightSum = Math.max(maxHarmonicWeightSum, harmonicWeightLogSum);

    let newNodeSize =
      minSize +
      Math.sqrt(harmonicWeightLogSum / atlasLayout.maxHistoricWeightSum) * //range from 0 to 1
      (maxSize - minSize);

    // const inDegree = graph.inDegreeWithoutSelfLoops(node);
    // const outDegree = graph.outDegreeWithoutSelfLoops(node);

    // harmonic average of in and out edges
    // the bigger mutual edges you have - the bigger your circle is
    // const degree = inDegree + outDegree > 0 ? 2 * inDegree * outDegree / (inDegree + outDegree) : 0;
    // Set the size based on the degree of the node relative to the min and max degrees
    // let newNodeSize =
    //   minSize +
    //   Math.sqrt((degree - minDegree) / (maxDegree - minDegree)) *
    //   (maxSize - minSize);

    // Calculate the radius of the circle based on the size
    let radius = newNodeSize / 2;

    // Calculate the area of the circle based on the radius
    let area = Math.PI * radius * radius;

    // Round to 2 decimal places to conserve bits in the exported graph
    newNodeSize = parseFloat(newNodeSize.toFixed(2));
    area = parseFloat(area.toFixed(2));

    graph.setNodeAttribute(node, "size", newNodeSize);
    graph.setNodeAttribute(node, "area", area);

    // Set a random color
    graph.setNodeAttribute(
      node,
      "color",
      skyBluePalette[Math.floor(Math.random() * 10)]
    );
  });

  log(`Min harmonic weight sum is ...${minHarmonicWeightSum}`);
  log(`Max harmonic weight sum is ...${maxHarmonicWeightSum}`);

  // Log total number of nodes, edges, and graph weight
  log(
    `Users: ${graph.order.toLocaleString()} Connections: ${graph.size.toLocaleString()} Interactions: ${totalWeight.toLocaleString()}`
  );

  log("Assigning layout...");


  circular.assign(graph);

  if (atlasLayout.globusUkrajiny) {
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

  const settings = forceAtlas2.inferSettings(graph);
  const iterationCount = atlasLayout.iterationCount;

  // about these settings:
  // https://observablehq.com/@mef/forceatlas2-layout-settings-visualized

  // -------------barnesHutOptimize----------------
  // reduces exponential to nlogn complexity
  // under 5 minutes generation vs. 10+ minutes

  settings.barnesHutOptimize = atlasLayout.blackHoleGravity > 0;

  // -------------barnesHutOptimize----------------


  // -------------barnesHutTheta----------------
  // controls centrifugal force


  // for harmonic atlas
  settings.barnesHutTheta = atlasLayout.blackHoleGravity;

  // examples for harmonic atlas

  // beautiful circular layout, more centrifugal force, recommended
  // settings.barnesHutTheta = 1.5;

  // clusters will be more round than with 1.5, but with less centrigugal force
  // settings.barnesHutTheta = 1;

  // more centrifugal force, clusters may get squished
  // settings.barnesHutTheta = 2;

  // -------------barnesHutOptimize----------------

  // try these later
  // settings.outboundAttractionDistribution = true;
  // settings.strongGravityMode = true;
  // settings.gravity = 0;
  // settings.scalingRatio = 1;

  // no idea what it does
  settings.deltaThreshold = graph.order * 0.001;

  // const uablurailNode = graph.findNode((n) => (graph.getNodeAttribute(n, "label") == "uabluerail.org"));
  // graph.setNodeAttribute(uablurailNode, "fixed", true);
  // log(`Uabluerail node fixed in place.`);

  log(`Running ${iterationCount} Force Atlas simulations...`);
  forceAtlas2.assign(graph, { settings, iterations: iterationCount });
  log("Done running Force Atlas");

  if (atlasLayout.rotate) {
    log(`Rotating Force Atlas...`);
    rotation.assign(graph, atlasLayout.angle);
    log("Successfully rotated Atlas");
  }

  // initialize clusters from graph data
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
    const repClusterPrio = clusterRepresentatives.get(atts.label);
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
    const topEdges = sortedEdges.slice(0, topNonRemovableEdges);
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
    const topEdges = focusClusterLabels.indexOf(attrs.label) > -1
      ? sortedEdges.slice(0, maxEdgesForFocusCluster)  // max edges for ukrainians
      : sortedEdges.slice(0, maxEdgesEveryone); // max edges for everyone else
    const topEdgeSet = new Set(topEdges);
    edges.forEach((edge) => {
      if (graph.hasEdgeAttribute(edge, 'stay')) return;
      if (topEdgeSet.has(edge)) return;

      graph.dropEdge(edge);
    });
  });
  log(`Graph has ${graph.order} nodes and ${graph.size} edges.`);


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

  graph.setAttribute("lastUpdated", graphData.timestamp || new Date().toISOString());

  log("Exporting enriched graph...");
  let outputPath = "./out/exported_graph_enriched.json";
  fs.writeFileSync(outputPath, JSON.stringify(graph.export()));
  log("Done exporting enriched graph");

  log("Minifying graph...");
  // Remove DIDs from nodes if not enriched
  graph.updateEachNodeAttributes((_, atts) => {
    if (atts.did !== undefined) {
      delete atts.did;
    }
    return atts;
  });
  log("Done minifying graph");

  log("Exporting minified graph...");
  outputPath = "./out/exported_graph_minified.json";
  fs.writeFileSync(outputPath, JSON.stringify(graph.export()));
  log("Done exporting minified graph");
});
