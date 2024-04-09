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
    searchParams: URLSearchParams;
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
    moderator: boolean;
    hideMenu: boolean;
    setHideMenu: Dispatch<SetStateAction<boolean>>;
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
    searchParams,
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
    moderator,
    hideMenu,
    setHideMenu
}) => {
    const hiddenClusters = config.hiddenClusters.get(currentLayoutName);
    return (
        <div className="
        xs:bottom-5 mobile:bottom-14 mobile:left-0 mobile:right-0 mobile:w-full mobile:h-3/7 mobile:transform mobile:translate-x-0
        desktop:left-1/2 desktop:bottom-14 desktop:transform desktop:-translate-x-1/2 desktop:w-3/4
         z-40 fixed">
            <div className={`${hideMenu ? 'xs:-mt-8 mobile:-mt-6 desktop:-mt-4' : 'mt-1'} fixed right-2 left:1/2`}>
                <button
                    type="button"
                    onClick={() => {
                        setHideMenu(!hideMenu);
                        searchParams.set('hm', `${!hideMenu}`);
                        setSearchParams(searchParams);
                    }}
                    className={
                        `relative inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2` +
                        " bg-gray-400 hover:bg-gray-500 focus-visible:ring-green-500"
                    }
                >
                    {hideMenu ? "^" : "x"}
                </button>
            </div>
            {!hideMenu && (
                <div className="bg-white shadow desktop:rounded-lg py-1">
                    <dl className="mx-auto grid gap-px bg-gray-900/5 grid-cols-2">
                        <div className="flex flex-col items-baseline bg-white text-center">
                            <dt className="desktop:text-sm text-xs font-medium leading-6 text-gray-500 ml-auto mr-auto mt-1">
                                <span className="hidden desktop:inline-block">{getTranslation('represented', currentLanguage)}{" "}</span>{" "}{getTranslation('users', currentLanguage)}
                            </dt>
                            <dd className="desktop:text-3xl xs:-mt-2 mr-auto ml-auto text-lg font-medium leading-10 tracking-tight text-gray-900">
                                {selectedNodeCount >= 0
                                    ? selectedNodeCount.toLocaleString()
                                    : userCount.toLocaleString()}
                            </dd>
                        </div>
                        <div className="flex flex-col items-baseline bg-white text-center">
                            <dt className="desktop:text-sm text-xs font-medium leading-6 text-gray-500 ml-auto mr-auto mt-1">
                                <span className="hidden desktop:inline-block">{getTranslation('represented', currentLanguage)}{" "}</span>{" "}{getTranslation('interactions', currentLanguage)}
                            </dt>
                            <dd className="desktop:text-3xl xs:-mt-2 mr-auto ml-auto text-lg font-medium leading-10 tracking-tight text-gray-900">
                                {selectedNodeEdges
                                    ? selectedNodeEdges.length.toLocaleString()
                                    : edgeCount.toLocaleString()}
                            </dd>
                        </div>
                    </dl>
                    <div className="px-2 py-2 desktop:p-2 w-fit ml-auto mr-auto mt-0 grid grid-flow-row-dense grid-cols-3 ">
                        <div className="col-span-2 xs:-mt-3 xs:-ml-1 mb-auto ">
                            <CustomSearch
                                currentLanguage={currentLanguage}
                                onLocate={(node) => {
                                    const nodeLabel = graph?.getNodeAttribute(node, "label");
                                    searchParams.set('s', `${nodeLabel}`)
                                    if (showMootList) {
                                        searchParams.set('ml', `${showMootList}`);
                                    }
                                    setSearchParams(searchParams);
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
                                        onChange={() => {
                                            searchParams.set('sc', !useSubclusterOverlay ? "true" : "false")
                                            setSearchParams(searchParams);
                                            setUseSubclusterOverlay(!useSubclusterOverlay);
                                            setLoading(true);
                                            setGraphShouldUpdate(true);
                                        }}
                                    />
                                </div>
                                <div className="desktop:text-sm flex text-xs leading-6 pl-1 desktop:pl-3 mb-auto mt-auto">
                                    <label
                                        htmlFor="clusterLabels"
                                        className="font-medium text-gray-900"
                                    >
                                        {getTranslation('show_communities', currentLanguage)}{" "}<span className="hidden desktop:inline">{getTranslation('graph_will_refresh', currentLanguage)}</span>
                                        <span className="desktop:hidden">{getTranslation('graph_will_refresh', currentLanguage)}</span>
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
                  <div className="flex desktop:text-sm text-xs leading-6 pl-1 desktop:pl-3 mb-auto mt-auto">
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
                                    <div className="flex desktop:text-sm text-xs leading-6 pl-1 desktop:pl-3 mb-auto mt-auto">
                                        <label
                                            htmlFor="clusterLabels"
                                            className="font-medium text-gray-900"
                                        >
                                            {getTranslation('show_hidden_clusters', currentLanguage)}{" "}<span className="hidden desktop:inline">{getTranslation('graph_will_refresh', currentLanguage)}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>}
                        </div>
                        <div className="relative flex gap-x-3 ml-4 xs:-mt-4 xs:-ml-2 w-full flex-col">
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
                                <div className="flex desktop:text-sm text-xs leading-6 pl-1 desktop:pl-3 mb-auto mt-auto mr-2">
                                    <label
                                        htmlFor="neighbors"
                                        className="font-medium text-gray-900"
                                    >
                                        {getTranslation('interactions', currentLanguage)}{" "}<span className="hidden desktop:inline">{getTranslation('of_friends', currentLanguage)}</span>
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
                                <div className="flex desktop:text-sm text-xs leading-6 pl-1 desktop:pl-3 mb-auto mt-auto mr-2">
                                    <label
                                        htmlFor="clusterLabels"
                                        className="font-medium text-gray-900"
                                    >
                                        {getTranslation('labels', currentLanguage)}{" "}<span className="hidden desktop:inline">{getTranslation('of_clusters', currentLanguage)}</span>
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
                                <div className="flex desktop:text-sm text-xs leading-6 pl-1 desktop:pl-3 mb-auto mt-auto mr-2">
                                    <label
                                        htmlFor="clusterLabels"
                                        className="font-medium text-gray-900"
                                    >
                                        {getTranslation('more_details', currentLanguage)}{" "}<span className="hidden desktop:inline">{getTranslation('on_clusters', currentLanguage)}</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex flex-row">
                                <LayoutMenu
                                    setLoading={setLoading}
                                    setGraphShouldUpdate={setGraphShouldUpdate}
                                    searchParams={searchParams}
                                    setSearchParams={setSearchParams}
                                    moderator={moderator}
                                    currentLanguage={currentLanguage} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Menu;