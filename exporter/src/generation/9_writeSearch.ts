import * as fs from "fs";
import { AtlasLayout } from "../common/model";
import path from "node:path";


async function writeSearch(
    log: (msg: string) => void,
    layout: AtlasLayout,
    outputPath: string
) {

    if (layout.searchFileName) {
        log("Exporting search...");
        fs.copyFileSync("../" + layout.searchFileName, path.join(outputPath, layout.searchFileName));
        log("Done exporting search");
    }

}

export { writeSearch }