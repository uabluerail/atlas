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
    avatarURI: string | undefined;
    setSearchParams: SetURLSearchParams;
    graph: MultiDirectedGraph | null;
    showHiddenClusters: boolean;
}

const buildClusters = (selectedNode, graph, currentLayoutName, currentLanguage, showHiddenClusters) => {
    const hiddenClusters: Map<string, boolean> = config.hiddenClusters.get(currentLayoutName) ?? new Map();
    const compiledClusters: any[] = [];
    const community: number = graph?.getNodeAttribute(selectedNode, "community");
    const clusterByCommunity = config.getClusterByCommunity(community);
    const clusterByCommunityLayout = config.getLayout(currentLayoutName).groups.main
        .filter(group => group.underlay && group.underlay.indexOf(clusterByCommunity.name) != -1)[0]
        || config.getLayout(currentLayoutName).groups.hidden?.filter(group => group.underlay && group.underlay.indexOf(clusterByCommunity.name) != -1)[0];
    const mainClusterByDetailedName = config.getLayout(currentLayoutName).groups.main
        .filter(group => group.overlay && group.overlay.indexOf(clusterByCommunity.name) != -1)[0]?.name
        || config.getLayout(currentLayoutName).groups.hidden?.filter(group => group.overlay && group.overlay.indexOf(clusterByCommunity.name) != -1)[0]?.name;
    const clusterByLayoutName = config.getLayout(currentLayoutName).groups.main
        .filter(group => group.name === clusterByCommunity.name)[0]?.name
        || config.getLayout(currentLayoutName).groups.hidden?.filter(group => group.name === clusterByCommunity.name)[0]?.name;
    const superClusterOnlyName = clusterByCommunityLayout?.underlay;
    const mainCluster = mainClusterByDetailedName ? config.getClusterByName(mainClusterByDetailedName)
        : superClusterOnlyName ? undefined
            : config.getClusterByName(clusterByLayoutName);
    const superClusterByMain = config.getLayout(currentLayoutName).groups.main
        .filter(group => group.underlay && group.name === mainCluster?.name)[0]?.underlay
        || config.getLayout(currentLayoutName).groups.hidden?.filter(group => group.underlay && group.name === mainCluster?.name)[0]?.underlay;
    const superCluster = superClusterOnlyName
        ? config.getClusterByName(superClusterOnlyName[0])
        : config.getClusterByName(superClusterByMain && superClusterByMain[0]);
    const detailedCluster = mainClusterByDetailedName !== undefined ? clusterByCommunity : undefined;
    if (detailedCluster && (!hiddenClusters.get(detailedCluster.name) || showHiddenClusters)) {
        compiledClusters.push(<p className="mt-2 text-xs">
            {getTranslation('community', currentLanguage)}{": "}
            <span className="px-2 inline-flex text-xs leading-5 font-bold rounded-full bg-black" style={{ color: detailedCluster?.color }}>
                {detailedCluster.label && getValueByLanguage(detailedCluster.label, currentLanguage)}
            </span> - {detailedCluster.legend && getValueByLanguage(detailedCluster.legend, currentLanguage).description}
        </p>)
    }
    if (mainCluster && (!hiddenClusters.get(mainCluster.name) || showHiddenClusters)) {
        compiledClusters.push(<p className="mt-2 text-xs">
            {getTranslation('cluster', currentLanguage)}{": "}
            <span className="px-2 inline-flex text-xs leading-5 font-bold rounded-full bg-black" style={{ color: mainCluster?.color }}>
                {mainCluster.label && getValueByLanguage(mainCluster.label, currentLanguage)}
            </span> - {mainCluster.legend && getValueByLanguage(mainCluster.legend, currentLanguage).description}
        </p>)
    }
    if (superCluster && (!hiddenClusters.get(superCluster.name) || showHiddenClusters)) {
        compiledClusters.push(<p className="mt-2 text-xs">
            {getTranslation('supercluster', currentLanguage)}{": "}
            <span className="px-2 inline-flex text-xs leading-5 font-bold rounded-full bg-black" style={{ color: superCluster?.color }}>
                {superCluster.label && getValueByLanguage(superCluster.label, currentLanguage)}
            </span> - {superCluster.legend && getValueByLanguage(superCluster.legend, currentLanguage).description}
        </p>)
    }
    return <div><p className="max-w-xl text-sm text-gray-500">
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
    avatarURI,
    setSearchParams,
    graph,
    showHiddenClusters
}) => {
    return (
        <div className="bg-white shadow rounded-md absolute
        mobile:overflow-scroll mobile:left-1/2 mobile:top-2 mobile:transform mobile:left-2 mobile:right-2 mobile:w-fit mobile:translate-x-0
        desktop:overflow-hidden desktop:left-1/2 desktop:top-5 desktop:transform desktop:w-1/3 desktop:left-5 desktop:translate-x-0
        mt-auto z-50">
            <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                <div className="-ml-4 -mt-2 flex flex-wrap items-center justify-between sm:flex-nowrap">
                    <div className="ml-4 mt-2">
                        <h3 className="text-base font-semibold leading-6 text-gray-900">
                            {getTranslation('info_top_moots', currentLanguage)}
                        </h3>
                    </div>
                    <div className="ml-4 mt-2 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => {
                                setShowMootList(!showMootList);
                                let newParams: { s?: string; ml?: string } = {
                                    s: `${graph?.getNodeAttribute(selectedNode, "label")}`,
                                };
                                if (!showMootList) {
                                    newParams.ml = `${!showMootList}`;
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
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>
                        {getTranslation('user', currentLanguage)}{" "}
                        {avatarURI && <img className="inline-block size-8 rounded-full" src={avatarURI} />}
                        {" "}
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

                    </p>
                </div>
                {buildClusters(selectedNode, graph, currentLayoutName, currentLanguage, showHiddenClusters)}
                {showMootList &&
                    (<div className="mt-2 max-w-xl text-sm text-gray-500">
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
                            {getTranslation('has_interacted_with', currentLanguage)}:
                        </p>
                    </div>)}
            </div>
            <ul
                role="list"
                className="divide-y divide-gray-200 mobile:max-h-40 desktop:max-h-96 md:max-h-screen overflow-auto"
            >
                {showMootList &&
                    mootList.slice(0, 10).map((moot) => (
                        <li key={moot.node} className="px-4 py-3 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                    <a
                                        href={`https://bsky.app/profile/${moot.did}`}
                                        target="_blank"
                                    >
                                        {moot.label}
                                    </a>
                                </div>
                                <div className="ml-2 flex-shrink-0 flex">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        {moot.weight}
                                    </span>
                                </div>
                            </div>
                        </li>
                    ))}
            </ul>
        </div>
    )
}

export default MootsMenu;