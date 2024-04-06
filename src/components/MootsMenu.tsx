import { FC, Dispatch, SetStateAction, useEffect, useState } from "react";
import { MultiDirectedGraph } from "graphology";
import { getTranslation, getValueByLanguage } from "../common/translation";
import { SetURLSearchParams } from "react-router-dom";
import { config } from '../common/visualConfig';
import { MootNode } from "../model";

interface MootsMenuProps {
    currentLayoutName: string;
    currentLanguage: string;
    selectedNode: string;
    showMootList: boolean;
    setShowMootList: Dispatch<SetStateAction<boolean>>;
    mootList: MootNode[];
    communityList: MootNode[];
    avatarURI: string | undefined;
    setSearchParams: SetURLSearchParams;
    graph: MultiDirectedGraph | null;
    showHiddenClusters: boolean;
    showCommunityList: boolean
    setShowCommunityList: Dispatch<SetStateAction<boolean>>;
}

const buildClusters = (
    selectedNode,
    graph,
    currentLayoutName,
    currentLanguage,
    showHiddenClusters,
    setShowMootList,
    showCommunityList,
    setShowCommunityList,
    setSearchParams
) => {
    const hiddenClusters: Map<string, boolean> = config.hiddenClusters.get(currentLayoutName) ?? new Map();
    const compiledClusters: any[] = [];
    const { detailedCluster, mainCluster, superCluster } = config.identifyClusters(graph?.getNodeAttribute(selectedNode, "community"), currentLayoutName);
    const hasCommunity = detailedCluster != undefined;
    if (superCluster && (!hiddenClusters.get(superCluster.name) || showHiddenClusters)) {
        compiledClusters.push(<p className="mt-2 text-xs">
            <span className="font-bold">
                {getTranslation('supercluster', currentLanguage)}{": "}
            </span>
            <span className="px-2 inline-flex text-xs leading-5 font-bold rounded-full bg-black" style={{ color: superCluster?.color }}>
                {superCluster.label && getValueByLanguage(superCluster.label, currentLanguage)}
            </span> - {superCluster.legend && getValueByLanguage(superCluster.legend, currentLanguage).description}
        </p>)
    }
    if (mainCluster && (!hiddenClusters.get(mainCluster.name) || showHiddenClusters)) {
        compiledClusters.push(<p className="mt-2 text-xs">
            <span className="font-bold">
                {getTranslation('cluster', currentLanguage)}{": "}
            </span>
            <span className="px-2 inline-flex text-xs leading-5 font-bold rounded-full bg-black" style={{ color: mainCluster?.color }}>
                {mainCluster.label && getValueByLanguage(mainCluster.label, currentLanguage)}
            </span> - {mainCluster.legend && getValueByLanguage(mainCluster.legend, currentLanguage).description}
        </p>)
    }
    if (detailedCluster && (!hiddenClusters.get(detailedCluster.name) || showHiddenClusters)) {
        compiledClusters.push(
            <div className="-ml-4 -mt-2 flex flex-wrap items-center justify-between">
                <div className="ml-4 mt-2">
                    <p className="mt-2 text-xs">
                        <span className="font-bold">
                            {getTranslation('community', currentLanguage)}{": "}
                        </span>
                        <span className="px-2 inline-flex text-xs leading-5 font-bold rounded-full bg-black" style={{ color: detailedCluster?.color }}>
                            {detailedCluster.label && getValueByLanguage(detailedCluster.label, currentLanguage)}
                        </span> - {detailedCluster.legend && getValueByLanguage(detailedCluster.legend, currentLanguage).description}
                    </p>
                </div>
                {hasCommunity && (
                    <div className="ml-4 mt-2 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => {
                                setShowCommunityList(!showCommunityList);
                                setShowMootList(false);
                                let newParams: { s?: string; ml?: string; cl?: string } = {
                                    s: `${graph?.getNodeAttribute(selectedNode, "label")}`,
                                };
                                if (!showCommunityList) {
                                    newParams.cl = `${!showCommunityList}`;
                                    newParams.ml = `${false}`;
                                }
                                setSearchParams(newParams);
                            }}
                            className={
                                `relative inline-flex items-center rounded-md  px-3 py-2 text-xs font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2` +
                                (showCommunityList
                                    ? " bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600"
                                    : " bg-orange-500 hover:bg-orange-600 focus-visible:ring-orange-500")
                            }
                        >
                            {showCommunityList ? getTranslation('hide_top', currentLanguage) : getTranslation('show_community', currentLanguage)}
                        </button>
                    </div>)
                }
            </div >

        )
    }
    return <div><p className="ml-2 max-w-xl text-xs text-gray-500">
        {compiledClusters.length > 0 && getTranslation('belongs_to', currentLanguage) + ": "}
    </p>{compiledClusters}</div>;
}

const MootsMenu: FC<MootsMenuProps> = ({
    currentLayoutName,
    currentLanguage,
    selectedNode,
    showMootList,
    setShowMootList,
    mootList,
    communityList,
    avatarURI,
    setSearchParams,
    graph,
    showHiddenClusters,
    showCommunityList,
    setShowCommunityList
}) => {

    let i = 0;
    const { detailedCluster } = config.identifyClusters(graph?.getNodeAttribute(selectedNode, "community"), currentLayoutName);
    return (
        <div className="bg-white shadow rounded-md absolute
        mobile:overflow-scroll mobile:left-1/2 mobile:top-2 mobile:transform mobile:left-2 mobile:right-2 mobile:w-fit mobile:translate-x-0
        desktop:overflow-hidden desktop:left-1/2 desktop:top-5 desktop:transform desktop:w-1/3 desktop:left-5 desktop:translate-x-0
        mt-auto z-50">
            <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                <div className="-mt-2">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                        {getTranslation('info_top_moots', currentLanguage)}
                    </h3>
                </div>
                <div className="ml-4 flex flex-nowrap items-center justify-between">
                    <div className="-ml-2 mt-2 max-w-xl text-xs text-gray-500">
                        <p>
                            {avatarURI && <img className="inline-block size-8 rounded-full" src={avatarURI} />}
                            {avatarURI && " "}
                            <a
                                className="font-bold underline-offset-1 underline break-all"
                                href={`https://bsky.app/profile/${graph?.getNodeAttribute(
                                    selectedNode,
                                    "did"
                                )}`}
                                target="_blank"
                            >
                                {graph?.getNodeAttribute(selectedNode, "label")}
                            </a>
                            <span className="px-2 ml-2 inline-flex text-xs leading-5 font-semibold rounded-full text-gray-900" style={{
                                backgroundColor: graph?.getNodeAttribute(
                                    selectedNode,
                                    "color"
                                )
                            }}>
                                {graph?.getNodeAttribute(selectedNode, "size")}
                            </span>
                        </p>
                    </div>
                    <div className="ml-4 mt-2 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => {
                                setShowMootList(!showMootList);
                                setShowCommunityList(false)
                                let newParams: { s?: string; ml?: string; cl?: string } = {
                                    s: `${graph?.getNodeAttribute(selectedNode, "label")}`,
                                };
                                if (!showMootList) {
                                    newParams.ml = `${!showMootList}`;
                                    newParams.cl = `${false}`;
                                }
                                setSearchParams(newParams);
                            }}
                            className={
                                `relative inline-flex items-center rounded-md  px-3 py-2 text-xs font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2` +
                                (showMootList
                                    ? " bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600"
                                    : " bg-green-500 hover:bg-green-600 focus-visible:ring-green-500")
                            }
                        >
                            {showMootList ? getTranslation('hide_top', currentLanguage) : getTranslation('show_top', currentLanguage)}
                        </button>
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
                    setShowCommunityList,
                    setSearchParams
                )}
                {showMootList &&
                    (<div className="z-50 mt-2 max-w-xl text-xs text-gray-500">
                        <p>
                            {getTranslation('these_are_top_moots_that', currentLanguage)}{" "}
                            <a
                                className="font-bold underline-offset-1 underline break-all"
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
                {showCommunityList &&
                    (<div className="z-50 mt-2 max-w-xl text-xs text-gray-500">
                        <p>
                            {getTranslation('these_are_top_community', currentLanguage)}{" "}
                            <span className="px-2 inline-flex text-xs leading-5 font-bold rounded-full bg-black" style={{ color: detailedCluster?.color }}>
                                {detailedCluster?.label && getValueByLanguage(detailedCluster?.label, currentLanguage)}
                            </span>{" :"}
                        </p>
                    </div>)}
            </div>
            <ul
                role="list"
                className="divide-y divide-gray-200 mobile:max-h-40 desktop:max-h-96 md:max-h-screen overflow-auto"
            >
                {showMootList && (
                    <div className="table text-xs ml-4 mr-4 mt-2 w-11/12 border-spacing-2">
                        <div className="table-header-group">
                            <div className="z-50 table-row flex items-center justify-between">
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
                                    {getTranslation('node_size', currentLanguage)}
                                </div>
                            </div>
                        </div>
                        {mootList.slice(0, 10).map((moot) => (
                            <div className="table-row-group">
                                <div className="z-50 table-row flex items-center justify-between">
                                    <div className="table-cell font-medium text-gray-900 truncate">
                                        {++i}
                                    </div>
                                    <div className="table-cell font-medium text-gray-900 truncate">
                                        {moot.avatarUrl && <img className="inline-block size-6 rounded-full" src={moot.avatarUrl} />}
                                        {moot.avatarUrl && " "}
                                        <a
                                            href={`https://bsky.app/profile/${moot.did}`}
                                            target="_blank"
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
                                        <span className="px-2 inline-flex leading-5 font-semibold rounded-full text-gray-900" style={{ backgroundColor: config.getClusterByCommunity(moot.community).color }}>
                                            {moot.size}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {showCommunityList && (
                    <div className="table text-xs  ml-4 mr-4 mt-2 w-11/12 border-spacing-2">
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
                            <div className="table-row-group">
                                <div className="z-50 table-row flex items-center justify-between">
                                    <div className="table-cell font-medium text-gray-900 truncate">
                                        {++i}
                                    </div>
                                    <div className="table-cell font-medium text-gray-900 truncate">
                                        {moot.avatarUrl && <img className="inline-block size-6 rounded-full" src={moot.avatarUrl} />}
                                        {moot.avatarUrl && " "}
                                        <a
                                            href={`https://bsky.app/profile/${moot.did}`}
                                            target="_blank"
                                        >
                                            {moot.label}
                                        </a>
                                    </div>
                                    <div className="table-cell ml-2 flex-shrink-0 flex">
                                        <span className="px-2 inline-flex leading-5 font-semibold rounded-full text-gray-900" style={{ backgroundColor: config.getClusterByCommunity(moot.community).color }}>
                                            {moot.weight}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ul>

        </div >
    )
}

export default MootsMenu;