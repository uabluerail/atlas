import { FC, Dispatch, SetStateAction } from "react";
import { MultiDirectedGraph } from "graphology";
import { getTranslation } from "../common/translation";
import { config } from '../common/visualConfig';
import { CustomSearch } from "./CustomSearch";
import { SetURLSearchParams } from "react-router-dom";
import LayoutMenu from "./LayoutMenu"

interface MenuProps {
    selectedNodeCount: number;
    userCount: number;
    selectedNodeEdges: string[] | null;
    edgeCount: number;
    graph: MultiDirectedGraph | null;
    showMootList: boolean;
    currentLayoutName: string;
    currentLanguage: string;
    setSearchParams: SetURLSearchParams;
    setLoading: Dispatch<SetStateAction<boolean>>;
    useSubclusterOverlay: boolean;
    setUseSubclusterOverlay: Dispatch<SetStateAction<boolean>>;
    setGraphShouldUpdate: Dispatch<SetStateAction<boolean>>;
    showHiddenClusters: boolean;
    setShowHiddenClusters: Dispatch<SetStateAction<boolean>>;
    showSecondDegreeNeighbors: boolean;
    setShowSecondDegreeNeighbors: Dispatch<SetStateAction<boolean>>;
    showClusterLabels: boolean;
    setShowClusterLabels: Dispatch<SetStateAction<boolean>>;
    legend: boolean;
    setLegend: Dispatch<SetStateAction<boolean>>;
    moderator: boolean
}

const Menu: FC<MenuProps> = ({
    selectedNodeCount,
    userCount,
    selectedNodeEdges,
    edgeCount,
    graph,
    showMootList,
    currentLayoutName,
    currentLanguage,
    setSearchParams,
    setLoading,
    useSubclusterOverlay,
    setUseSubclusterOverlay,
    setGraphShouldUpdate,
    showHiddenClusters,
    setShowHiddenClusters,
    showSecondDegreeNeighbors,
    setShowSecondDegreeNeighbors,
    showClusterLabels,
    setShowClusterLabels,
    legend,
    setLegend,
    moderator
}) => {
    const hiddenClusters = config.hiddenClusters.get(currentLayoutName);
    return (
        <div className="
        mobile:bottom-12 mobile:left-0 mobile:right-0 mobile:w-fit mobile:h-3/7 mobile:transform mobile:translate-x-0
        desktop:left-1/2 desktop:bottom-12 desktop:transform desktop:-translate-x-1/2 desktop:w-fit
         z-40 fixed">
            <div className="bg-white shadow sm:rounded-lg py-1">
                <dl className="mx-auto grid gap-px bg-gray-900/5 grid-cols-2">
                    <div className="flex flex-col items-baseline bg-white text-center">
                        <dt className="text-sm font-medium leading-6 text-gray-500 ml-auto mr-auto mt-2">
                            <span className="hidden lg:inline-block">{getTranslation('represented', currentLanguage)}{" "}</span>{" "}{getTranslation('users', currentLanguage)}
                        </dt>
                        <dd className="lg:text-3xl mr-auto ml-auto text-lg font-medium leading-10 tracking-tight text-gray-900">
                            {selectedNodeCount >= 0
                                ? selectedNodeCount.toLocaleString()
                                : userCount.toLocaleString()}
                        </dd>
                    </div>
                    <div className="flex flex-col items-baseline bg-white text-center">
                        <dt className="text-sm font-medium leading-6 text-gray-500 ml-auto mr-auto mt-2">
                            <span className="hidden lg:inline-block">{getTranslation('represented', currentLanguage)}{" "}</span>{" "}{getTranslation('interactions', currentLanguage)}
                        </dt>
                        <dd className="lg:text-3xl mr-auto ml-auto text-lg font-medium leading-10 tracking-tight text-gray-900">
                            {selectedNodeEdges
                                ? selectedNodeEdges.length.toLocaleString()
                                : edgeCount.toLocaleString()}
                        </dd>
                    </div>
                </dl>
                <div className="px-2 py-2 sm:p-2 w-fit ml-auto mr-auto mt-0 grid grid-flow-row-dense grid-cols-3 ">
                    <div className="col-span-2 mt-auto mb-auto ">
                        <CustomSearch
                            currentLanguage={currentLanguage}
                            onLocate={(node) => {
                                const nodeLabel = graph?.getNodeAttribute(node, "label");
                                let newParams: { s?: string; ml?: string } = {
                                    s: `${nodeLabel}`,
                                };
                                if (showMootList) {
                                    newParams.ml = `${showMootList}`;
                                }
                                setSearchParams(newParams);
                            }}
                        />
                        {config.overlayLayouts.get(currentLayoutName) && <div className="flex flex-row mt-1">
                            <div className="flex h-6 items-center">
                                <input
                                    id="clusterLabels"
                                    name="clusterLabels"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    checked={useSubclusterOverlay}
                                    onChange={() => { setLoading(true); setUseSubclusterOverlay(!useSubclusterOverlay); setGraphShouldUpdate(true); }}
                                />
                            </div>
                            <div className="flex md:text-sm text-xs leading-6 pl-1 md:pl-3 mb-auto mt-auto">
                                <label
                                    htmlFor="clusterLabels"
                                    className="font-medium text-gray-900"
                                >
                                    {getTranslation('show_communities', currentLanguage)}{" "}<span className="hidden md:inline">{getTranslation('graph_will_refresh', currentLanguage)}</span>
                                    <span className="md:hidden">{getTranslation('graph_will_refresh', currentLanguage)}</span>
                                </label>
                            </div>
                        </div>}
                        {/* <div className="flex flex-row">
                  <div className="flex h-6 items-center">
                    <input
                      id="clusterLabels"
                      name="clusterLabels"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      checked={showExperimental}
                      onChange={() => { setShowExperimental(!showExperimental); if (showExperimental && showHiddenClusters) { setLoading(true); setShowHiddenClusters(false); setGraphShouldUpdate(true); } }}
                    />
                  </div>
                  <div className="flex md:text-sm text-xs leading-6 pl-1 md:pl-3 mb-auto mt-auto">
                    <label
                      htmlFor="clusterLabels"
                      className="font-medium text-gray-500"
                    >{getTranslation('experimental_options')}
                    </label>
                  </div>
                </div> */}
                        {hiddenClusters && hiddenClusters.size > 0 && <div>
                            <div className="flex flex-row">
                                <div className="flex h-6 items-center">
                                    <input
                                        id="clusterLabels"
                                        name="clusterLabels"
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                        checked={showHiddenClusters}
                                        onChange={() => { setLoading(true); setShowHiddenClusters(!showHiddenClusters); setGraphShouldUpdate(true); }}
                                    />
                                </div>
                                <div className="flex md:text-sm text-xs leading-6 pl-1 md:pl-3 mb-auto mt-auto">
                                    <label
                                        htmlFor="clusterLabels"
                                        className="font-medium text-gray-900"
                                    >
                                        {getTranslation('show_hidden_clusters', currentLanguage)}{" "}<span className="hidden md:inline">{getTranslation('graph_will_refresh', currentLanguage)}</span>
                                        <span className="md:hidden">{getTranslation('graph_will_refresh', currentLanguage)}</span>
                                    </label>
                                </div>
                            </div>
                        </div>}
                    </div>
                    <div className="relative flex gap-x-3 ml-4 w-full flex-col">
                        <div className="flex flex-row">
                            <div className="flex h-6 items-center mt-auto mb-auto">
                                <input
                                    id="neighbors"
                                    name="neighbors"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    checked={showSecondDegreeNeighbors}
                                    onChange={() =>
                                        setShowSecondDegreeNeighbors(!showSecondDegreeNeighbors)
                                    }
                                />
                            </div>
                            <div className="flex md:text-sm text-xs leading-6 pl-1 md:pl-3 mb-auto mt-auto mr-2">
                                <label
                                    htmlFor="neighbors"
                                    className="font-medium text-gray-900"
                                >
                                    {getTranslation('interactions', currentLanguage)}{" "}<span className="hidden md:inline">{getTranslation('of_friends', currentLanguage)}</span>
                                    <span className="md:hidden">{getTranslation('of_friends', currentLanguage)}</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex flex-row">
                            <div className="flex h-6 items-center">
                                <input
                                    id="clusterLabels"
                                    name="clusterLabels"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    checked={showClusterLabels}
                                    onChange={() => setShowClusterLabels(!showClusterLabels)}
                                />
                            </div>
                            <div className="flex md:text-sm text-xs leading-6 pl-1 md:pl-3 mb-auto mt-auto mr-2">
                                <label
                                    htmlFor="clusterLabels"
                                    className="font-medium text-gray-900"
                                >
                                    {getTranslation('labels', currentLanguage)}{" "}<span className="hidden md:inline">{getTranslation('of_clusters', currentLanguage)}</span>
                                    <span className="md:hidden">{getTranslation('of_clusters', currentLanguage)}</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex flex-row">
                            <div className="flex h-6 items-center">
                                <input
                                    id="clusterLabels"
                                    name="clusterLabels"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    checked={legend}
                                    onChange={() => setLegend(!legend)}
                                />
                            </div>
                            <div className="flex md:text-sm text-xs leading-6 pl-1 md:pl-3 mb-auto mt-auto mr-2">
                                <label
                                    htmlFor="clusterLabels"
                                    className="font-medium text-gray-900"
                                >
                                    {getTranslation('more_details', currentLanguage)}{" "}<span className="hidden md:inline">{getTranslation('on_clusters', currentLanguage)}</span>
                                    <span className="md:hidden">{getTranslation('on_clusters', currentLanguage)}</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex flex-row">
                            <LayoutMenu moderator={moderator} currentLanguage={currentLanguage} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Menu;