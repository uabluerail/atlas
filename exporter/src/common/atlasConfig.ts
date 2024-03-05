
//for maxHistoricWeightSum it is recommended to monitor logs and adjust to an appropriate value with every significant change
import { AtlasSettings as AtlasConfig } from "./model"

const commonSettings = {
    topNonRemovableEdges: 3,
    maxEdgesEveryone: 5,
    maxEdgesForFocusCluster: 10
}

const layoutSettings = {
    classic: {
        ...commonSettings,
        ...{
            rotate: false,
            angle: 12 * Math.PI / 7,
            globusUkrajiny: true,
            maxHistoricWeightSum: 1000,
            iterationCount: 600,
            blackHoleGravity: 0.5,
        }
    },
    harmonic: {
        ...commonSettings,
        ...{
            rotate: false,
            angle: 12 * Math.PI / 7,
            globusUkrajiny: true,
            maxHistoricWeightSum: 20000,
            iterationCount: 800,
            blackHoleGravity: 1.5
        }
    },
    dual: {
        ...commonSettings,
        ...{
            rotate: true,
            angle: 8 * Math.PI / 7,
            globusUkrajiny: false,
            maxHistoricWeightSum: 20000,
            iterationCount: 800,
            blackHoleGravity: 1.5
        }
    }
};

//based on the algorithm used in input graph.json - choose the mode to run the Atlas on
//switch the mode here with optimal settings for each mode
const atlasConfig: AtlasConfig = layoutSettings.dual;

export { atlasConfig }