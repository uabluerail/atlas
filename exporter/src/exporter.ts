import { MultiDirectedGraph } from "graphology";
import { Node, IndexNode, Edge, AtlasLayout } from "./common/model"
import { config } from "./common/config";
import path from "node:path";
import * as fs from "fs";
import { SemVer, parse } from "semver";

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
import { writeSearch } from "./generation/9_writeSearch";

// log logs a message with a timestamp in human-readale format
function log(msg: string) {
  console.log(`${new Date().toLocaleString()}: ${msg}`);
}

async function generateLayouts() {
  log("Starting exporter...");

  const outputPath = "./out/"

  function exportLayout(
    graphData: { graphVersion: number, edges: Edge[]; nodes: Node[], timestamp?: string },
    layout: AtlasLayout
  ) {

    const outputPathEnriched = path.join(outputPath, `${layout.name + "_" ?? ""}layout.json`);
    const versionPath = path.join(outputPath, `${layout.name + "_" ?? ""}layout_version.json`);
    const configPath = path.join(outputPath, `${config.configVersion}_config.json`);

    var layoutVersion;
    try {
      layoutVersion = JSON.parse(fs.readFileSync(versionPath, "utf8")) as {
        configVersion: string;
        graphVersion: number;
      };
    } catch (err) {
    }

    function writeLayoutVersion() {
      fs.writeFileSync(versionPath, JSON.stringify({
        configVersion: config.configVersion.raw,
        graphVersion: config.settings.graphVersion
      }));
      fs.writeFileSync(configPath, JSON.stringify(config.json));
    }

    const layoutFileExists = fs.existsSync(outputPathEnriched);

    const layoutConfigVersion: SemVer | null = parse(layoutVersion?.configVersion);

    if (layoutVersion && layoutConfigVersion && layoutFileExists
      && config.settings.graphVersion <= layoutVersion.graphVersion
      && config.configVersion.major <= layoutConfigVersion.major
      && config.configVersion.minor <= layoutConfigVersion.minor) {
      log(`No changes requiring layout ${layout.name} re-gen.`);
      if (config.configVersion.patch > layoutConfigVersion.patch) {
        log(`Updating version: ${config.configVersion}.`);
      }
      log("Skipping export.");
      writeSearch(log, layout, outputPath);
      writeLayoutVersion();
      return;
    }

    log(`Generating layout ${layout.name} on config version: ${config.configVersion}`);

    const { edges, nodes } = graphData;
    // Create the graph
    const graph = new MultiDirectedGraph();
    const totalEdges = edges.length;
    const totalNodes = nodes.length;
    const indexNodes: Map<string, IndexNode> = new Map();
    const hiddenNodes: Map<string, boolean> = new Map();

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
    assignNodeSizeAndColor(log, layout, totalWeight, graph);

    //Step 4 run Force Atlas 2 iterations
    generateLayout(log, graph, layout, communitiesGraph);

    //Step 5 write cluster labels
    const communityClusters = initializeClusters(log, layout, graph);

    //Step 6 filter out edges (optimization)
    filterEdges(log, graph);

    //Step 7 assign cluster positions
    assignClusterPositions(log, layout, communityClusters, graph);

    //Step 8 export layout file
    writeFiles(log, { graphData, outputPathEnriched }, graph);

    //Step 9 export search file
    writeSearch(log, layout, outputPath);

    writeLayoutVersion();
  }

  //Step 0
  if (config.layout.layouts && config.layout.layouts.length > 0) {
    const graphDatum: Map<string, { graphVersion: number, edges: Edge[]; nodes: Node[], timestamp?: string }> = new Map();
    const fileNames = new Set(config.layout.layouts.map(layout => layout.fileName));

    await fileNames.forEach(async fileName => {
      log(`Loading ${fileName}`);
      const graphData = await fetchGraph(log, fileName);
      graphDatum.set(fileName, graphData);
      log(`Loaded ${graphData?.nodes?.length} nodes and ${graphData?.edges?.length} edges.`);
    })

    config.layout.layouts.forEach(layout => {
      log(`Processing layout ${layout.name}`);

      const graphData = graphDatum.get(layout.fileName);
      if (graphData) {
        exportLayout(graphData, layout);
      }
    });
  }
}

generateLayouts();

export { generateLayouts }