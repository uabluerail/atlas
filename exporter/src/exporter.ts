import { MultiDirectedGraph } from "graphology";
import { Node, IndexNode, Edge, AtlasLayout } from "./common/model"
import { config } from "./common/config";
import path from "node:path";

import { nailGlobus } from "./generation/util/globus.js"
import { fetchGraph } from "./generation/0_fetchGraph";
import { addNodes } from "./generation/1_addNodes.js";
import { addEdges } from "./generation/2_addEdges.js";
import { assignNodeSizeAndColor } from "./generation/3_assignNodeSizesAndColor";
import { generateLayout } from "./generation/4_generateLayout";
import { initializeClusters } from "./generation/5_initializeClusters";
import { filterEdges } from "./generation/6_filterEdges.js";
import { assignClusterPositions } from "./generation/7_assignClusterPositions";
import { writeFiles } from "./generation/8_writeFiles";

// log logs a message with a timestamp in human-readale format
function log(msg: string) {
  console.log(`${new Date().toLocaleString()}: ${msg}`);
}

log("Starting exporter...");

const outputPath = "./out/"

function exportLayout(
  graphData: { graphVersion: number, edges: Edge[]; nodes: Node[], timestamp?: string },
  layout: AtlasLayout
) {

  const outputPathEnriched = path.join(outputPath, `${layout.name + "_" ?? ""}layout.json`);

  const { edges, nodes } = graphData;
  // Create the graph
  const graph = new MultiDirectedGraph();
  const totalEdges = edges.length;
  const totalNodes = nodes.length;
  const indexNodes: Map<string, IndexNode> = new Map();
  const hiddenNodes: Map<string, boolean> = new Map();

  // config.hiddenCommunities.forEach((community, value) => log("" + community + ":" + value));

  //Step 1 add nodes
  addNodes(log, layout, { totalNodes, nodes, indexNodes, hiddenNodes }, graph);

  //Step 2 add edges
  const totalWeight = addEdges(log, { totalEdges, edges, indexNodes, hiddenNodes }, graph);

  const communitiesGraph = new MultiDirectedGraph();

  // optional
  if (config.settings.globus) {
    nailGlobus(totalNodes, nodes, totalEdges, edges, indexNodes);
  }

  //Step 3 calculate weights and assign sizes and colors
  assignNodeSizeAndColor(log, totalWeight, graph);

  //Step 4 run Force Atlas 2 iterations
  generateLayout(log, graph, communitiesGraph);

  //Step 5 write cluster labels
  const communityClusters = initializeClusters(log, graph);

  //Step 6 filter out edges (optimization)
  filterEdges(log, graph);

  //Step 7 assign cluster positions
  assignClusterPositions(log, communityClusters, graph);

  //Step 8 export layout file
  writeFiles(log, { graphData, outputPathEnriched }, graph);
}

//Step 0
fetchGraph(log).then((graphData: { graphVersion: number, edges: Edge[]; nodes: Node[], timestamp?: string }) => {
  if (config.layout.layouts && config.layout.layouts.length > 0) {
    config.layout.layouts.forEach(layout => {
      log("Exporting " + layout.name + " layout...");
      exportLayout(graphData, layout);
    });
  }
});
