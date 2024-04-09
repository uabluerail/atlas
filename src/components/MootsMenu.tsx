import { FC, Dispatch, SetStateAction } from "react";
import { MultiDirectedGraph } from "graphology";
import { getTranslation, getValueByLanguage } from "../common/translation";
import { SetURLSearchParams } from "react-router-dom";
import { config } from '../common/visualConfig';
import { MootNode } from "../model";

interface MootsMenuProps {
    currentLayoutName: string;
    currentLanguage: string;
    selectedNode: string;
    setSelectedNode: Dispatch<React.SetStateAction<string | null>>;
    showMootList: boolean;
    setShowMootList: Dispatch<SetStateAction<boolean>>;
    mootList: MootNode[];
    communityList: MootNode[];
    avatarURI: string | undefined;
    searchParams: URLSearchParams;
    setSearchParams: SetURLSearchParams;
    graph: MultiDirectedGraph | null;
    showHiddenClusters: boolean;
    showCommunityList: boolean
    setShowCommunityList: Dispatch<SetStateAction<boolean>>;
    useSubclusterOverlay: boolean;
}



const buildClusters = (
    selectedNode,
    graph,
    currentLayoutName,
    currentLanguage,
    showHiddenClusters,
    setShowMootList,
    showCommunityList,
    communityList,
    setShowCommunityList,
    searchParams,
    setSearchParams
) => {
    const hiddenClusters: Map<string, boolean> = config.hiddenClusters.get(currentLayoutName) ?? new Map();
    const compiledClusters: any[] = [];
    const { detailedCluster, mainCluster, superCluster } = config.identifyClusters(graph?.getNodeAttribute(selectedNode, "community"), currentLayoutName);
    const hasCommunity = detailedCluster != undefined;
    if (superCluster && (!hiddenClusters.get(superCluster.name) || showHiddenClusters)) {
        compiledClusters.push(
            <div className="ml-0 mt-0" key={superCluster.name}>
                <p className="mt-1 text-xs">
                    <span className="font-bold">
                        {getTranslation('supercluster', currentLanguage)}{": "}
                    </span>
                    <span className="px-2 inline-flex text-xs leading-5 font-bold rounded-full"
                        style={{
                            backgroundColor: superCluster?.color,
                            color: config.getContrastColor(superCluster?.color)
                        }}>
                        {superCluster.label && getValueByLanguage(superCluster.label, currentLanguage)}
                    </span>
                    <span className="xs:hidden"> - {superCluster.legend && getValueByLanguage(superCluster.legend, currentLanguage).description}</span>
                </p>
            </div>)
    }
    if (mainCluster && (!hiddenClusters.get(mainCluster.name) || showHiddenClusters)) {
        compiledClusters.push(
            <div className="ml-0 mt-0" key={mainCluster.name}>
                <p className="mt-1 text-xs">
                    <span className="font-bold">
                        {getTranslation('cluster', currentLanguage)}{": "}
                    </span>
                    <span className="px-2 inline-flex text-xs leading-5 font-bold rounded-full"
                        style={{
                            backgroundColor: mainCluster?.color,
                            color: config.getContrastColor(mainCluster?.color)
                        }}>
                        {mainCluster.label && getValueByLanguage(mainCluster.label, currentLanguage)}
                    </span>
                    <span className="xs:hidden"> - {mainCluster.legend && getValueByLanguage(mainCluster.legend, currentLanguage).description}</span>
                </p>
            </div>)
    }
    if (detailedCluster && (!hiddenClusters.get(detailedCluster.name) || showHiddenClusters)) {
        compiledClusters.push(
            <div className="-ml-4 mt-2" key={detailedCluster.name}>
                <div className="ml-4 mt-2">
                    <p className="mt-1 text-xs">
                        <span className="font-bold">
                            {getTranslation('community', currentLanguage)}{": "}
                        </span>
                        <span className="px-2 inline-flex text-xs leading-5 font-bold rounded-full"
                            style={{
                                backgroundColor: detailedCluster?.color,
                                color: config.getContrastColor(detailedCluster?.color)
                            }}>
                            {detailedCluster.label && getValueByLanguage(detailedCluster.label, currentLanguage)}
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                setShowCommunityList(!showCommunityList);
                                setShowMootList(false);
                                searchParams.set('s', `${graph?.getNodeAttribute(selectedNode, "label")}`);
                                if (!showCommunityList) {
                                    searchParams.set('cl', `${!showCommunityList}`);
                                    searchParams.set('ml', `${false}`);
                                }
                                setSearchParams(searchParams);
                            }}
                            className={
                                `relative ml-1 inline-flex items-center rounded-sm px-1 py-0 text-xs font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2` +
                                (showCommunityList
                                    ? " bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600"
                                    : " bg-orange-500 hover:bg-orange-600 focus-visible:ring-orange-500")
                            }
                        >
                            {showCommunityList ? getTranslation('hide_community', currentLanguage) : getTranslation('show_community', currentLanguage)}
                        </button>
                        <span className="xs:hidden"> - {detailedCluster.legend && getValueByLanguage(detailedCluster.legend, currentLanguage).description}</span>
                    </p>
                </div>
            </div >

        )
    }
    return <div><p className="ml-0 -mt-1 max-w-xl text-xs text-gray-500">
        {compiledClusters.length > 0 && getTranslation('belongs_to', currentLanguage) + ": "}
    </p>{compiledClusters}</div>;
}

const MootsMenu: FC<MootsMenuProps> = ({
    currentLayoutName,
    currentLanguage,
    selectedNode,
    setSelectedNode,
    showMootList,
    setShowMootList,
    mootList,
    communityList,
    avatarURI,
    searchParams,
    setSearchParams,
    graph,
    showHiddenClusters,
    showCommunityList,
    setShowCommunityList,
    useSubclusterOverlay
}) => {

    let i = 0;
    const { detailedCluster } = config.identifyClusters(graph?.getNodeAttribute(selectedNode, "community"), currentLayoutName);
    return (
        <div className="bg-white shadow rounded-md absolute overflow-hidden
        mobile:top-0 mobile:transform mobile:w-full mobile:translate-x-0
        desktop:top-2 desktop:transform desktop:w-5/12 desktop:left-2 desktop:translate-x-0
        z-50">
            <div className="border-b border-gray-200 bg-white px-4 py-5 -mr-2 desktop:px-6">
                <div className="ml-0 flex flex-nowrap items-center justify-between">
                    {/* <div className="-mt-4">
                        <h3 className="text-base font-semibold leading-6 text-gray-900">
                            {getTranslation('info_top_moots', currentLanguage)}
                        </h3>
                    </div> */}
                    <div className="-ml-1 -mt-3 desktop:-mt-1 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => {
                                setShowMootList(!showMootList);
                                setShowCommunityList(false)
                                searchParams.set('s', `${graph?.getNodeAttribute(selectedNode, "label")}`);
                                if (!showMootList) {
                                    searchParams.set('ml', `${!showMootList}`);
                                    searchParams.set('cl', `${false}`);
                                }
                                setSearchParams(searchParams);
                            }}
                            className={
                                `relative inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2` +
                                (showMootList
                                    ? " bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600"
                                    : " bg-green-500 hover:bg-green-600 focus-visible:ring-green-500")
                            }
                        >
                            {showMootList ? getTranslation('hide_top', currentLanguage) : getTranslation('show_top', currentLanguage)}
                        </button>
                    </div>
                    <div className="-mt-4 desktop:-mt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setShowMootList(!showMootList);
                                setShowCommunityList(false)
                                searchParams.delete('s');
                                setSearchParams(searchParams);
                            }}
                            className={
                                `relative inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2` +

                                " bg-gray-400 hover:bg-gray-500 focus-visible:ring-green-500"
                            }
                        >
                            x
                        </button>
                    </div>
                </div>
                <div className="ml-4 flex flex-nowrap items-center justify-between">
                    <div className="-ml-4 -mr-2 mt-1 max-w-xl text-xs text-gray-500">
                        <p>
                            {avatarURI && <img className="inline-block size-8 rounded-full" src={avatarURI} />}
                            {avatarURI && " "}
                            <a
                                className="font-bold underline text-xs underline-offset-1 underline break-all"
                                href={`https://bsky.app/profile/${graph?.getNodeAttribute(
                                    selectedNode,
                                    "did"
                                )}`}
                                target="_blank"
                            >
                                {graph?.getNodeAttribute(selectedNode, "label")}
                            </a>
                            <span className="px-2 -mr-2 ml-1 inline-flex text-xs leading-5 font-semibold rounded-full text-gray-900" style={{
                                backgroundColor: graph?.getNodeAttribute(
                                    selectedNode,
                                    "color"
                                ),
                                color: config.getContrastColor(graph?.getNodeAttribute(
                                    selectedNode,
                                    "color"
                                ))
                            }}>
                                {graph?.getNodeAttribute(selectedNode, "size")}
                            </span>
                        </p>
                    </div>
                </div>
                {buildClusters(
                    selectedNode,
                    graph,
                    currentLayoutName,
                    currentLanguage,
                    showHiddenClusters,
                    setShowMootList,
                    showCommunityList,
                    communityList,
                    setShowCommunityList,
                    searchParams,
                    setSearchParams
                )}
                <div className="-mb-3">
                    {showMootList &&
                        (<div className="z-50 mt-1 xs:hidden max-w-xl text-xs text-gray-500">
                            <p>
                                {getTranslation('these_are_top_moots_that', currentLanguage)}{" "}
                                <a
                                    className="font-bold underline text-xs underline-offset-1 underline break-all"
                                    href={`https://bsky.app/profile/${graph?.getNodeAttribute(
                                        selectedNode,
                                        "did"
                                    )}`}
                                    target="_blank"
                                >
                                    {graph?.getNodeAttribute(selectedNode, "label")}
                                </a>{" "}
                                {getTranslation('has_interacted_with', currentLanguage)}{":"}
                            </p>
                        </div>)}
                    {showCommunityList && communityList.length > 0 &&
                        (<div className="z-50 mt-1 xs:hidden max-w-xl text-xs text-gray-500">
                            <p>
                                {getTranslation('these_are_top_community', currentLanguage)}{" "}
                                <span className="px-2 inline-flex text-xs leading-5 font-bold rounded-full"
                                    style={{
                                        backgroundColor: detailedCluster?.color,
                                        color: config.getContrastColor(detailedCluster?.color)
                                    }}>
                                    {detailedCluster?.label && getValueByLanguage(detailedCluster?.label, currentLanguage)}
                                </span>{" :"}
                            </p>
                        </div>)}
                </div>
            </div>
            <div
                role="list"
                className="z-50 divide-y divide-gray-200 mobile:max-h-36 desktop:max-h-96 md:max-h-screen overflow-auto"
            >
                {showMootList && (
                    <div className="table text-xs ml-4 mr-4 mt-0 w-11/12 border-spacing-2 xs:border-spacing-1">
                        <div className="table-header-group">
                            <div className="table-row flex items-center justify-between">
                                <div className="table-cell font-medium text-gray-900 truncate">
                                    {"#"}
                                </div>
                                <div className="table-cell font-medium text-gray-900 truncate">
                                    {getTranslation('user', currentLanguage)}
                                </div>
                                <div className="table-cell ml-2 flex-shrink-0 flex">
                                    {getTranslation('interactions_weight', currentLanguage)}
                                </div>
                                <div className="table-cell ml-2 flex-shrink-0 flex">
                                    {getTranslation('node', currentLanguage)}<span className="xs:hidden">{' '}{getTranslation('size', currentLanguage)}</span>
                                </div>
                            </div>
                        </div>
                        {mootList.slice(0, 10).map((moot) => (
                            <div className="table-row-group" key={moot.node}>
                                <div className="z-50 table-row flex items-center justify-between">
                                    <div className="table-cell font-medium text-gray-900 truncate">
                                        {++i}
                                    </div>
                                    <div className="table-cell underline font-medium text-gray-900 truncate">
                                        {moot.avatarUrl && <img className="inline-block size-6 rounded-full" src={moot.avatarUrl} />}
                                        {moot.avatarUrl && " "}
                                        <a
                                            href="#"
                                            onClick={() => {
                                                searchParams.set('s', `${moot.label}`);
                                                setSearchParams(searchParams);
                                                setSelectedNode(moot.node)
                                            }}
                                        >
                                            {moot.label}
                                        </a>
                                    </div>
                                    <div className="table-cell ml-2 flex-shrink-0 flex">
                                        <span className="px-2 inline-flex leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {moot.weight}
                                        </span>
                                    </div>
                                    <div className="table-cell ml-2 flex-shrink-0 flex">
                                        <span className="px-2 inline-flex leading-5 font-semibold rounded-full text-gray-900"
                                            style={{
                                                backgroundColor: config.getNodeColor(moot.community, currentLayoutName, useSubclusterOverlay),
                                                color: config.getContrastColor(config.getNodeColor(moot.community, currentLayoutName, useSubclusterOverlay))
                                            }}>
                                            {moot.size}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {showCommunityList && communityList.length > 0 && (
                    <div className="table text-xs ml-4 mr-4 mt-0 w-11/12 border-spacing-2 xs:border-spacing-1">
                        <div className="table-header-group">
                            <div className="z-50 table-row flex items-center justify-between">
                                <div className="table-cell font-medium text-gray-900 truncate">
                                    {"#"}
                                </div>
                                <div className="table-cell font-medium text-gray-900 truncate">
                                    {getTranslation('user', currentLanguage)}
                                </div>
                                <div className="table-cell ml-2 flex-shrink-0 flex">
                                    {getTranslation('node_size', currentLanguage)}
                                </div>
                            </div>
                        </div>
                        {communityList.slice(0, 10).map((moot) => (
                            <div className="table-row-group" key={moot.node}>
                                <div className="z-50 table-row flex items-center justify-between">
                                    <div className="table-cell font-medium text-gray-900 truncate">
                                        {++i}
                                    </div>
                                    <div className="table-cell font-medium text-gray-900 truncate">
                                        {moot.avatarUrl && <img className="inline-block size-6 rounded-full" src={moot.avatarUrl} />}
                                        {moot.avatarUrl && " "}
                                        <a
                                            href="#"
                                            onClick={() => {
                                                searchParams.set('s', `${moot.label}`);
                                                setSearchParams(searchParams);
                                                setSelectedNode(moot.node)
                                            }}
                                        >
                                            {moot.label}
                                        </a>
                                    </div>
                                    <div className="table-cell ml-2 flex-shrink-0 flex">
                                        <span className="px-2 inline-flex leading-5 font-semibold rounded-full text-gray-900" style={{
                                            backgroundColor: config.getNodeColor(moot.community, currentLayoutName, useSubclusterOverlay),
                                            color: config.getContrastColor(config.getNodeColor(moot.community, currentLayoutName, useSubclusterOverlay))
                                        }}>
                                            {moot.weight}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div >
    )
}

export default MootsMenu;