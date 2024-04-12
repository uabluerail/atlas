import { config } from "./common/config";
import { InputGraphData } from "./common/model";
import * as fs from "fs";

let graph: InputGraphData | undefined;

if (fs.existsSync("../graph.json")) {
    graph = JSON.parse(fs.readFileSync("../graph.json", "utf8")) as InputGraphData;
}

if (!graph?.graphVersion
    || graph.graphVersion === config.settings.graphVersion) {
    console.log("graphVersion:" + config.settings.graphVersion);
}