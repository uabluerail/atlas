import { MultiDirectedGraph } from "graphology";
import forceAtlas2 from "./graphology-layout-forceatlas2/index.js";
import circular from "graphology-layout/circular";
import rotation from 'graphology-layout/rotation';
import { Node, IndexNode, Edge, InputData, Cluster } from "./common/model"
import { nailGlobus, globusForceCoordinates } from "./generation/globus"
import { atlasConfig } from "./common/atlasConfig"
import * as fs from "fs";
import { filterEdges } from "./generation/filterEdges";
import { assignClusters, processCommunities } from "./generation/processClusters.js";

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
  if (atlasConfig.globusUkrajiny) {
    nailGlobus(communitiesGraph, totalNodes, nodes, totalEdges, edges, indexNodes);
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
      Math.sqrt(harmonicWeightLogSum / atlasConfig.maxHistoricWeightSum) * //range from 0 to 1
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

  if (atlasConfig.globusUkrajiny) {
    globusForceCoordinates(communitiesGraph, graph);
  }

  const settings = forceAtlas2.inferSettings(graph);
  const iterationCount = atlasConfig.iterationCount;

  // about these settings:
  // https://observablehq.com/@mef/forceatlas2-layout-settings-visualized

  // -------------barnesHutOptimize----------------
  // reduces exponential to nlogn complexity
  // under 5 minutes generation vs. 10+ minutes

  settings.barnesHutOptimize = atlasConfig.blackHoleGravity > 0;

  // -------------barnesHutOptimize----------------


  // -------------barnesHutTheta----------------
  // controls centrifugal force


  // for harmonic atlas
  settings.barnesHutTheta = atlasConfig.blackHoleGravity;

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

  if (atlasConfig.rotate) {
    log(`Rotating Force Atlas...`);
    rotation.assign(graph, atlasConfig.angle);
    log("Successfully rotated Atlas");
  }

  assignClusters(graph);

  log("Truncating node position assignments...");
  // Reduce precision on node x and y coordinates to conserve bits in the exported graph
  graph.updateEachNodeAttributes((_, attrs) => {
    attrs.x = parseFloat(attrs.x.toFixed(2));
    attrs.y = parseFloat(attrs.y.toFixed(2));
    return attrs;
  });
  log("Done truncating node position assignments");

  log("Filtering edges...");
  filterEdges(graph);
  log(`Graph has ${graph.order} nodes and ${graph.size} edges.`);

  log("Assigning communities...");
  processCommunities(graph);
  log("Communities processed...");

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
