import { FC, Dispatch, useState, useEffect, SetStateAction } from "react";
import { MultiDirectedGraph } from "graphology";
import { getTranslation, truncateText, getValueByLanguage, getTranslationWithOverride } from "../common/translation";
import { SetURLSearchParams } from "react-router-dom";
import { config } from '../common/visualConfig';
import { MootNode } from "../model";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestion, faCaretLeft, faCaretRight, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import {
    Popover,
    PopoverHandler,
    PopoverContent,
    Button,
} from "@material-tailwind/react";

interface MootsMenuProps {
    hideMenu: boolean;
    currentLayoutName: string;
    currentLanguage: string;
    selectedNode: string;
    previousSelectedNode: string | null;
    setSelectedNode: Dispatch<React.SetStateAction<string | null>>;
    showMootList: boolean;
    setShowMootList: Dispatch<SetStateAction<boolean>>;
    mootList: MootNode[];
    communityList: MootNode[];
    clusterList: MootNode[];
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
    showClusterList,
    setShowClusterList,
    setShowCommunityList,
    searchParams,
    setSearchParams
) => {
    const hiddenClusters: Map<string, boolean> = config.hiddenClusters.get(currentLayoutName) ?? new Map();
    const compiledClusters: any[] = [];
    const { detailedCluster, mainCluster, superCluster } = config.identifyClusters(graph?.getNodeAttribute(selectedNode, "community"), currentLayoutName);
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
                    <button
                        type="button"
                        onClick={() => {
                            setShowClusterList(!showClusterList);
                            setShowMootList(false);
                            setShowCommunityList(false);
                            if (!showClusterList) {
                                searchParams.set('sl', `${!showClusterList}`);
                                searchParams.set('ml', `${false}`);
                                searchParams.set('cl', `${false}`);
                            }
                            setSearchParams(searchParams);
                        }}
                        className={
                            `relative ml-1 inline-flex items-center rounded-sm px-1 py-0 text-xs font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2` +
                            (showClusterList
                                ? " bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600"
                                : " bg-orange-500 hover:bg-orange-600 focus-visible:ring-orange-500")
                        }
                    >
                        {showClusterList ? getTranslationWithOverride({ key: 'hide_community', language: currentLanguage, currentLayoutName }) : getTranslationWithOverride({ key: 'show_community', language: currentLanguage, currentLayoutName })}
                    </button>
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
                                setShowClusterList(false);
                                if (!showCommunityList) {
                                    searchParams.set('cl', `${!showCommunityList}`);
                                    searchParams.set('ml', `${false}`);
                                    searchParams.set('sl', `${false}`);
                                }
                                setSearchParams(searchParams);
                            }}
                            className={
                                `relative ml-1 inline-flex items-center rounded-sm px-1 py-0 text-xs font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2` +
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
    hideMenu,
    currentLayoutName,
    currentLanguage,
    selectedNode,
    previousSelectedNode,
    setSelectedNode,
    showMootList,
    setShowMootList,
    mootList,
    communityList,
    clusterList,
    avatarURI,
    searchParams,
    setSearchParams,
    graph,
    showHiddenClusters,
    showCommunityList,
    setShowCommunityList,
    useSubclusterOverlay
}) => {

    const [hideNodeInfo, setNodeInfo] = useState<boolean>(searchParams.get("hi") === "true");
    const [showClusterList, setShowClusterList] = useState<boolean>(searchParams.get("sl") === "true");
    useEffect(() => {
        if (graph !== null
            && selectedNode !== null
            && selectedNode !== previousSelectedNode) {
            setNodeInfo(false)
            searchParams.set('hi', `${false}`);
            setSearchParams(searchParams);
        }
    }, [selectedNode]);

    let i = 0;
    const { detailedCluster, mainCluster } = config.identifyClusters(graph?.getNodeAttribute(selectedNode, "community"), currentLayoutName);
    const community = graph?.getNodeAttribute(
        selectedNode,
        "community"
    );
    const currentLayoutDidType = config.getLayout(currentLayoutName)?.nodeMapping?.id?.type;
    const selectedDid = graph?.getNodeAttribute(
        selectedNode,
        "did"
    );
    const layout = config.getLayout(currentLayoutName);
    const currentLayoutLegend = config.legend.legends.filter(legend => legend.name === layout.legend)[0];
    const selectedNodeColor = config.getNodeColor(community, currentLayoutName, useSubclusterOverlay)
    return (
        <div className="fixed bg-white shadow rounded-md absolute
        mobile:top-0 mobile:w-full
        desktop:top-2 desktop:transform desktop:left-2 desktop:max-w-md desktop:translate-x-0 desktop:w-full
        z-50">
            <div className={`fixed absolute mt-2 ml-2 ${hideNodeInfo ? 'left-1' : 'right-3'} `}>
                <button
                    type="button"
                    onClick={() => {
                        setNodeInfo(!hideNodeInfo);
                        if (!hideNodeInfo) {
                            searchParams.set('hi', `${!hideNodeInfo}`);
                            setSearchParams(searchParams);
                        }
                    }}
                    className={
                        `relative inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2` +

                        " bg-gray-400 hover:bg-gray-500 focus-visible:ring-green-500"
                    }
                >
                    {hideNodeInfo ? <FontAwesomeIcon icon={faCaretRight} /> : <FontAwesomeIcon icon={faCaretLeft} />}
                </button>
            </div>
            {!hideNodeInfo && (<div>
                <div className="border-b border-gray-200 bg-white px-4 py-5 mr-0 desktop:px-6">
                    <div className="ml-4 flex flex-nowrap items-center justify-between">
                        <div className="-ml-4 -mr-2 -mt-2 max-w-xl text-xs text-gray-500">
                            <p>
                                {avatarURI && <img className="inline-block size-8 rounded-full" src={avatarURI} />}
                                {avatarURI && " "}
                                <a
                                    className="font-bold underline text-xs underline-offset-1 underline break-all"
                                    href={`https://bsky.app/profile/${currentLayoutDidType === "concatUnderscore" ? selectedDid.split("_").pop() : selectedDid}`}
                                    target="_blank"
                                >
                                    {truncateText(graph?.getNodeAttribute(selectedNode, "label"), 30)}
                                    {" "}
                                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                                </a>
                                <span className="px-2 -mr-2 ml-1 inline-flex text-xs leading-5 font-semibold rounded-full text-gray-900" style={{
                                    backgroundColor: selectedNodeColor,
                                    color: config.getContrastColor(selectedNodeColor)
                                }}>
                                    {graph?.getNodeAttribute(selectedNode, layout.nodeMapping?.score?.property || "size")}
                                </span>
                                {currentLayoutLegend.overview && getValueByLanguage(currentLayoutLegend.overview, currentLanguage).nodeWeight && (
                                    <Popover
                                        animate={{
                                            mount: { scale: 1, y: 0 },
                                            unmount: { scale: 0, y: 25 },
                                        }}
                                    >
                                        <PopoverHandler>
                                            <Button placeholder={""} className="-mt-1 ml-1 bg-gray-500 px-1"><FontAwesomeIcon icon={faQuestion} /></Button>
                                        </PopoverHandler>
                                        <PopoverContent placeholder={""} className="z-50 p-1 text-xs w-40">
                                            {getValueByLanguage(currentLayoutLegend.overview, currentLanguage).nodeWeight}
                                        </PopoverContent>
                                    </Popover>
                                )}
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
                        showClusterList,
                        setShowClusterList,
                        setShowCommunityList,
                        searchParams,
                        setSearchParams
                    )}
                    <div className="ml-0 flex flex-nowrap items-center justify-between">
                        {/* <div className="-mt-4">
                        <h3 className="text-base font-semibold leading-6 text-gray-900">
                            {getTranslation('info_top_moots', currentLanguage)}
                        </h3>
                    </div> */}
                        <div className="-ml-1 mt-1 desktop:mt-2 flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowMootList(!showMootList);
                                    setShowCommunityList(false);
                                    setShowClusterList(false);
                                    if (!showMootList) {
                                        searchParams.set('ml', `${!showMootList}`);
                                        searchParams.set('cl', `${false}`);
                                        searchParams.set('sl', `${false}`);
                                    }
                                    setSearchParams(searchParams);
                                }}
                                className={
                                    `relative inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2` +
                                    (showMootList
                                        ? " bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600"
                                        : " bg-green-500 hover:bg-green-600 focus-visible:ring-green-500")
                                }
                            >
                                {showMootList ? getTranslation('hide_top', currentLanguage, undefined, currentLayoutName) : getTranslation('show_top', currentLanguage, undefined, currentLayoutName)}
                            </button>
                        </div>
                    </div>
                    <div className="-mb-3">
                        {showMootList &&
                            (<div className="z-50 mt-2 desktop:mt-4 xs:hidden max-w-xl text-xs text-gray-500">
                                <p>
                                    {getTranslationWithOverride({ key: 'these_are_top_moots_that', language: currentLanguage, currentLayoutName })}{" "}
                                    <a
                                        className="font-bold underline text-xs underline-offset-1 underline break-all"
                                        href={`https://bsky.app/profile/${currentLayoutDidType === "concatUnderscore" ? graph?.getNodeAttribute(
                                            selectedNode,
                                            "did"
                                        ).split("_").pop() : graph?.getNodeAttribute(
                                            selectedNode,
                                            "did"
                                        )}`}
                                        target="_blank"
                                    >
                                        {graph?.getNodeAttribute(selectedNode, "label")}
                                    </a>{" "}
                                    {getTranslationWithOverride({ key: 'has_interacted_with', language: currentLanguage, currentLayoutName })}{":"}
                                </p>
                            </div>)}
                        {showCommunityList && communityList.length > 0 &&
                            (<div className="z-50 mt-2 desktop:mt-4 xs:hidden max-w-xl text-xs text-gray-500">
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
                        {showClusterList && clusterList.length > 0 &&
                            (<div className="z-50 mt-2 desktop:mt-4 xs:hidden max-w-xl text-xs text-gray-500">
                                <p>
                                    {getTranslation('these_are_top_cluster', currentLanguage)}{" "}
                                    <span className="px-2 inline-flex text-xs leading-5 font-bold rounded-full"
                                        style={{
                                            backgroundColor: mainCluster?.color,
                                            color: config.getContrastColor(mainCluster?.color)
                                        }}>
                                        {mainCluster?.label && getValueByLanguage(mainCluster?.label, currentLanguage)}
                                    </span>{" :"}
                                </p>
                            </div>)}
                    </div>
                </div>
                {(showMootList || showCommunityList || showClusterList) && (
                    <div className={`z-50 divide-y divide-gray-200
                ${hideMenu ? 'xs:max-h-[47lvh]' : 'xs:max-h-[28lvh]'}
                ${hideMenu ? 'mobile:max-h-[45lvh]' : 'mobile:max-h-[25lvh]'}
                desktop:max-h-[40lvh] overflow-auto`}>
                        {showMootList && (
                            <div className="table text-xs ml-4 mr-4 mt-0 w-11/12 border-spacing-2 xs:border-spacing-1">
                                <div className="table-header-group">
                                    <div className="table-row flex items-center justify-between">
                                        <div className="table-cell font-medium text-gray-900 truncate">
                                            {"#"}
                                        </div>
                                        <div className="table-cell font-medium text-gray-900 truncate">
                                            {getTranslationWithOverride({ key: 'user', language: currentLanguage, currentLayoutName })}
                                            {currentLayoutLegend.overview && getValueByLanguage(currentLayoutLegend.overview, currentLanguage).nodeWeight && (
                                                <Popover
                                                    animate={{
                                                        mount: { scale: 1, y: 0 },
                                                        unmount: { scale: 0, y: 25 },
                                                    }}
                                                >
                                                    <PopoverHandler>
                                                        <Button placeholder={""} className="-mt-1 ml-1 bg-gray-500 px-1"><FontAwesomeIcon icon={faQuestion} /></Button>
                                                    </PopoverHandler>
                                                    <PopoverContent placeholder={""} className="z-50 p-1 text-xs w-40">
                                                        {getValueByLanguage(currentLayoutLegend.overview, currentLanguage).nodes}
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        </div>
                                        <div className="table-cell ml-2 flex-shrink-0 flex">
                                            {getTranslation('interactions_weight', currentLanguage)}
                                            {currentLayoutLegend.overview && getValueByLanguage(currentLayoutLegend.overview, currentLanguage).relationshipWeight && (
                                                <Popover
                                                    animate={{
                                                        mount: { scale: 1, y: 0 },
                                                        unmount: { scale: 0, y: 25 },
                                                    }}
                                                >
                                                    <PopoverHandler>
                                                        <Button placeholder={""} className="-mt-1 ml-1 bg-gray-500 px-1"><FontAwesomeIcon icon={faQuestion} /></Button>
                                                    </PopoverHandler>
                                                    <PopoverContent placeholder={""} className="z-50 p-1 text-xs w-40">
                                                        <p>
                                                            {getValueByLanguage(currentLayoutLegend.overview, currentLanguage).relationships}
                                                        </p>
                                                        <p>
                                                            {getValueByLanguage(currentLayoutLegend.overview, currentLanguage).relationshipWeight}
                                                        </p>
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        </div>
                                        <div className="table-cell ml-2 flex-shrink-0 flex">
                                            {getTranslation('node', currentLanguage)}<span className="xs:hidden">{' '}{getTranslation('size', currentLanguage)}</span>
                                            {currentLayoutLegend.overview && getValueByLanguage(currentLayoutLegend.overview, currentLanguage).nodeWeight && (
                                                <Popover
                                                    animate={{
                                                        mount: { scale: 1, y: 0 },
                                                        unmount: { scale: 0, y: 25 },
                                                    }}
                                                >
                                                    <PopoverHandler>
                                                        <Button placeholder={""} className="-mt-1 ml-1 bg-gray-500 px-1"><FontAwesomeIcon icon={faQuestion} /></Button>
                                                    </PopoverHandler>
                                                    <PopoverContent placeholder={""} className="z-50 p-1 text-xs w-40">
                                                        {getValueByLanguage(currentLayoutLegend.overview, currentLanguage).nodeWeight}
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {mootList.slice(0, 10).map((moot) => (
                                    <div className="table-row-group" key={moot.node}>
                                        <div className="z-50 table-row flex items-center justify-between">
                                            <div className="table-cell font-medium text-gray-900 truncate">
                                                {++i}
                                            </div>
                                            <div className={`table-cell underline font-bold ${moot.direction ? 'text-red-700' : 'text-blue-700'} truncate`}>
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
                                                    {truncateText(moot.label, 25)}
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
                                                    {moot[layout.nodeMapping?.score?.property || "size"]}
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
                                            {getTranslation('node', currentLanguage)}<span className="xs:hidden">{' '}{getTranslation('size', currentLanguage)}</span>
                                        </div>
                                    </div>
                                </div>
                                {communityList.slice(0, 10).map((moot) => (
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
                                                    {truncateText(moot.label, 25)}
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
                        {showClusterList && clusterList.length > 0 && (
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
                                            {getTranslation('node', currentLanguage)}<span className="xs:hidden">{' '}{getTranslation('size', currentLanguage)}</span>
                                        </div>
                                    </div>
                                </div>
                                {clusterList.slice(0, 10).map((moot) => (
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
                                                    {truncateText(moot.label, 25)}
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
                )}
            </div>
            )
            }
        </div >
    )
}

export default MootsMenu;