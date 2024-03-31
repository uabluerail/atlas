import { MultiDirectedGraph } from "graphology";
import { config } from "../common/config";
import forceAtlas2 from "../graphology-layout-forceatlas2/index";
import circular from "graphology-layout/circular";
import rotation from 'graphology-layout/rotation';
import { globusForceCoordinates } from "./util/globus"

function generateLayout(
    log: (msg: string) => void,
    graph: MultiDirectedGraph,
    communitiesGraph: MultiDirectedGraph
) {
    log("Assigning layout...");

    circular.assign(graph);

    if (config.settings.globus) {
        globusForceCoordinates(communitiesGraph, graph);
    }

    const settings = forceAtlas2.inferSettings(graph);
    const iterationCount = config.settings.iterationCount;

    // about these settings:
    // https://observablehq.com/@mef/forceatlas2-layout-settings-visualized

    // -------------barnesHutOptimize----------------
    // reduces exponential to nlogn complexity
    // under 5 minutes generation vs. 10+ minutes

    settings.barnesHutOptimize = config.settings.blackHoleGravity > 0;

    // -------------barnesHutOptimize----------------


    // -------------barnesHutTheta----------------
    // controls centrifugal force


    // for harmonic atlas
    settings.barnesHutTheta = config.settings.blackHoleGravity;

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

    log(`Running ${iterationCount} Force Atlas simulations...`);
    forceAtlas2.assign(graph, { settings, iterations: iterationCount });
    log("Done running Force Atlas");

    if (config.settings.rotate) {
        log(`Rotating Force Atlas...`);
        rotation.assign(graph, config.settings.angle * Math.PI);
        log("Successfully rotated Atlas");
    }
}

export { generateLayout }