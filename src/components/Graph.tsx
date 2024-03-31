import React, { useState, FC, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { MultiDirectedGraph } from "graphology";
import { formatDistanceToNow, parseISO } from "date-fns";
import LayoutMenu from "./LayoutMenu";
import getNodeProgramImage from "sigma/rendering/programs/node-image";
import {
  SigmaContainer,
  useRegisterEvents,
  useLoadGraph,
  useSigmaContext,
} from "@react-sigma/core";
import { Coordinates } from "sigma/types";
import "@react-sigma/core/lib/react-sigma.min.css";

import { CustomSearch } from "./CustomSearch";
import iwanthue from "iwanthue";
import Loading from "./Loading";
import Legend from "./Legend";
import { config } from "../common/visualConfig"
import { getTranslation } from "../common/translation";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

// Hook
function usePrevious<T>(value: T): T {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref: any = useRef<T>();
  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

interface Edge {
  source: string;
  target: string;
  weight: number;
  ogWeight: number;
}

interface Node {
  key: number;
  size: number;
  label: string;
  did: string;
}

interface MootNode {
  node: string;
  label: string;
  did: string;
  weight: number;
}

interface Cluster {
  label?: string;
  displayName?: string;
  idx: string;
  x?: number;
  y?: number;
  color?: string;
  size: number;
  positions: { x: number; y: number }[];
}

function constructEdgeMap(graph: MultiDirectedGraph): Map<string, Edge> {
  const edgeMap = new Map<string, Edge>();
  graph?.forEachEdge((edge, attrs, source, target) => {
    if (source !== undefined && target !== undefined && attrs.weight !== null) {
      edgeMap.set(edge, {
        source: source,
        target: target,
        weight: attrs.weight,
        ogWeight: attrs.ogWeight,
      });
    }
  });
  return edgeMap;
}

function constructNodeMap(graph: MultiDirectedGraph): Map<string, Node> {
  const nodeMap = new Map<string, Node>();
  graph?.forEachNode((_, attrs) => {
    nodeMap.set(attrs.label, {
      key: attrs.key,
      size: attrs.size,
      label: attrs.label,
      did: attrs.did,
    });
  });
  return nodeMap;
}



const isLocal = document.location.hostname === "localhost";

const GraphContainer: React.FC<{}> = () => {
  // Router info
  const [searchParams, setSearchParams] = useSearchParams();

  // Graph raw data
  const [graphDump, setGraphDump] = React.useState<any>(null);

  // Graph stats
  const [userCount, setUserCount] = React.useState<number>(0);
  const [edgeCount, setEdgeCount] = React.useState<number>(0);
  const [totalWeight, setTotalWeight] = React.useState<number>(0);

  // Selected Node properties
  const [selectedNode, setSelectedNode] = React.useState<string | null>(null);
  const [legend, setLegend] = React.useState<boolean>(false);
  const [showHiddenClusters, setShowHiddenClusters] = React.useState<boolean>(false);
  const [currentLayoutName, setCurrentLayoutName] = React.useState<string>(config.getLayoutName(searchParams.get("layout")));
  // const [showExperimental, setShowExperimental] = React.useState<boolean>(false);
  const [selectedNodeCount, setSelectedNodeCount] = React.useState<number>(-1);
  const [inWeight, setInWeight] = React.useState<number>(-1);
  const [outWeight, setOutWeight] = React.useState<number>(-1);
  const [selectedNodeEdges, setSelectedNodeEdges] = React.useState<
    string[] | null
  >(null);
  const [showSecondDegreeNeighbors, setShowSecondDegreeNeighbors] =
    React.useState<boolean>(false);

  const previousSelectedNode: string | null = usePrevious<string | null>(
    selectedNode
  );
  const previousSecondDegreeNeighbors: boolean = usePrevious<boolean>(
    showSecondDegreeNeighbors
  );

  // Graph State
  const [graph, setGraph] = React.useState<MultiDirectedGraph | null>(null);
  const [graphShouldUpdate, setGraphShouldUpdate] =
    React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(true);

  // Moot List State
  const [mootList, setMootList] = React.useState<MootNode[]>([]);
  const [showMootList, setShowMootList] = React.useState<boolean>(true);

  const [edgeMap, setEdgeMap] = React.useState<Map<string, Edge>>(new Map());
  const [nodeMap, setNodeMap] = React.useState<Map<string, Node>>(new Map());

  const [clusters, setClusters] = React.useState<Cluster[]>([]);
  const [showClusterLabels, setShowClusterLabels] =
    React.useState<boolean>(true);
  const [useSubclusterOverlay, setUseSubclusterOverlay] =
    React.useState<boolean>(searchParams.get("withSubclusters") != null);

  const SocialGraph: React.FC = () => {
    const loadGraph = useLoadGraph();
    const registerEvents = useRegisterEvents();
    const { sigma, container } = useSigmaContext();

    useEffect(() => {
      // Create the graph
      const newGraph = new MultiDirectedGraph();

      const hiddenClusters = config.hiddenClusters.get(currentLayoutName) ?? new Map();
      if (graphDump !== null && (graph === null || graphShouldUpdate)) {
        setGraphShouldUpdate(false);
        newGraph.import(graphDump);

        // Construct the edge and node maps
        const newEdgeMap = constructEdgeMap(newGraph);
        const newNodeMap = constructNodeMap(newGraph);
        setEdgeMap(newEdgeMap);
        setNodeMap(newNodeMap);

        const communityClusters = newGraph.getAttribute("clusters");

        if (communityClusters === null) {
          return;
        }
        const palette = iwanthue(
          Object.keys(communityClusters).length -
          Object.keys(config.knownClusterColorMappings).length -
          Object.keys(config.knownOverlayClusterColorMappings).length,
          {
            seed: "bskyCommunityClusters3",
            colorSpace: "intense",
            clustering: "force-vector",
          }
        );

        // create and assign one color by cluster
        for (const community in communityClusters) {
          const cluster = communityClusters[community];
          if (cluster.label !== undefined) {
            cluster.color =
              // knownClusterColorMappings.get(cluster.label) ?? palette.pop();

              config.knownOverlayClusterColorMappings.get(cluster.label)
                ? useSubclusterOverlay
                  ? config.knownOverlayClusterColorMappings.get(cluster.label)
                  : config.knownOverlayClusterHideCustomColorMappings.get(cluster.label)
                : config.knownClusterColorMappings.get(cluster.label)
                ?? palette.pop();
          } else {
            cluster.color = palette.pop();
          }
        }

        // Set the color of each node to the color of its cluster
        newGraph?.updateEachNodeAttributes((_, attr) => {
          if (
            attr.community !== undefined &&
            attr.community in communityClusters
          ) {
            if (showHiddenClusters || !hiddenClusters.get(communityClusters[attr.community].label)) {
              attr.color = communityClusters[attr.community].color;
            } else {
              //todo remove completely and use different layout
              attr.color = config.settings.hiddenClusterColor;
            }
          }
          return attr;
        });

        newGraph.forEachEdge((edge) => {
          newGraph.setEdgeAttribute(edge, "hidden", true);
        });

        newGraph.setAttribute("clusters", communityClusters);

        setUserCount(newGraph.order);
        setEdgeCount(newGraph.size);
        setTotalWeight(
          newGraph.reduceEdges(
            (acc, edge) => acc + newGraph.getEdgeAttribute(edge, "ogWeight"),
            0
          )
        );

        newGraph?.forEachNode((_, attr) => {
          attr["old-color"] = attr.color;
        });

        // Initialize cluster positions
        const newClusters: Cluster[] = [];
        for (const community in communityClusters) {
          const cluster = communityClusters[community];
          // adapt the position to viewport coordinates
          const viewportPos = sigma.graphToViewport(cluster as Coordinates);
          if (showHiddenClusters || !hiddenClusters.get(cluster.label)) {
            newClusters.push({
              label: cluster.label,
              displayName: cluster.displayName,
              idx: cluster.idx,
              x: viewportPos.x,
              y: viewportPos.y,
              color: cluster.color,
              size: cluster.size,
              positions: cluster.positions,
            });
          }
        }
        setClusters(newClusters);
        setGraph(newGraph);
        loadGraph(newGraph);
        setLoading(false);
      }
    }, [loadGraph]);

    // Render Cluster Labels
    const renderClusterLabels = () => {
      if (graph === null) {
        return;
      }
      // create the clustersLabel layer
      const communityClusters = graph.getAttribute("clusters");

      // Initialize cluster positions
      for (const community in communityClusters) {
        const cluster = communityClusters[community];
        // adapt the position to viewport coordinates
        const viewportPos = sigma.graphToViewport(cluster as Coordinates);
        const clusterLabel = document.getElementById(`cluster-${cluster.idx}`);
        // update position from the viewport
        if (clusterLabel !== null) {
          clusterLabel.style.top = `${viewportPos.y.toFixed(2)}px`;
          clusterLabel.style.left = `${viewportPos.x.toFixed(2)}px`;
        }
      }
    };

    // Select Node Effect
    useEffect(() => {
      if (
        graph !== null &&
        selectedNode !== null &&
        (selectedNode !== previousSelectedNode ||
          showSecondDegreeNeighbors !== previousSecondDegreeNeighbors)
      ) {
        // Hide all edges
        graph?.edges().forEach((edge) => {
          graph?.setEdgeAttribute(edge, "hidden", true);
          // Set all edges to a light gray
          graph?.setEdgeAttribute(edge, "color", "#e0e0e0");
        });

        // Hide or fade all nodes
        graph?.updateEachNodeAttributes((_, attrs) => {
          attrs.highlighted = false;
          if (showSecondDegreeNeighbors) {
            attrs.hidden = true;
          } else {
            attrs.hidden = false;
            attrs.color = "rgba(0,0,0,0.1)";
          }
          return attrs;
        });

        // Get all neighbors of selected node
        const neighbors = graph?.neighbors(selectedNode);

        // Build the MootList, an ordered list of neighbors by weight
        const mootList = graph?.reduceEdges<MootNode[]>(
          selectedNode,
          (acc, _, edgeAttrs, source, target, sourceAttrs, targetAttrs) => {
            const weight = edgeAttrs.weight;
            const existingMootEntry = acc.find((entry) => {
              return (
                entry.node.toString() === target.toString() ||
                entry.node.toString() === source.toString()
              );
            });
            if (existingMootEntry === undefined && source !== target) {
              const key =
                source === selectedNode ? targetAttrs.key : sourceAttrs.key;
              const label =
                source === selectedNode ? targetAttrs.label : sourceAttrs.label;
              const did =
                source === selectedNode ? targetAttrs.did : sourceAttrs.did;
              acc.push({
                node: key,
                weight: weight,
                label: label,
                did: did,
              });
            }
            return acc;
          },
          []
        );

        mootList.sort((a, b) => b.weight - a.weight);

        setMootList(mootList);

        // Re-color all nodes connected to selected node
        graph?.forEachNeighbor(selectedNode, (node, attrs) => {
          attrs.hidden = false;
          attrs.color = attrs["old-color"];
          // Set all 2nd degree neighbors to a light grey
          if (showSecondDegreeNeighbors) {
            graph?.forEachNeighbor(node, (neighbor, neighborAttrs) => {
              if (!neighbors?.includes(neighbor)) {
                neighborAttrs.hidden = false;
                neighborAttrs.color = "rgba(0,0,0,0.1)";
              }
              // Show 2nd degree neighbor edges
              graph?.forEachEdge(node, neighbor, (_, attrs) => {
                attrs.hidden = false;
              });
            });
          }
        });

        // Re-show edges connected to selected node
        graph?.forEachInEdge(selectedNode, (_, attrs) => {
          attrs.hidden = false;
          attrs.color = "#4b33ff";
        });

        graph?.forEachOutEdge(selectedNode, (_, attrs) => {
          attrs.hidden = false;
          attrs.color = "#ff5254";
        });

        // Re-color selected node and highlight it
        graph?.updateNodeAttributes(selectedNode, (attrs) => {
          attrs.color = attrs["old-color"];
          attrs.highlighted = true;
          attrs.hidden = false;
          return attrs;
        });

        // Update selected node count and weight for display
        setSelectedNodeCount(graph?.degree(selectedNode) || 0);
        setInWeight(
          graph?.reduceInEdges(
            selectedNode,
            (acc, edge) => acc + graph.getEdgeAttribute(edge, "ogWeight"),
            0
          ) || 0
        );
        setOutWeight(
          graph?.reduceOutEdges(
            selectedNode,
            (acc, edge) => acc + graph.getEdgeAttribute(edge, "ogWeight"),
            0
          ) || 0
        );
        setSelectedNodeEdges(graph?.edges(selectedNode) || null);
        sigma.refresh();
      } else if (graph !== null && selectedNode === null) {
        graph?.edges().forEach((edge) => {
          graph?.setEdgeAttribute(edge, "hidden", true);
          graph?.setEdgeAttribute(edge, "color", "#e0e0e0");
        });
        graph?.nodes().forEach((node) => {
          const oldColor = graph.getNodeAttribute(node, "old-color");
          graph?.setNodeAttribute(node, "color", oldColor);
          graph?.setNodeAttribute(node, "highlighted", false);
          graph?.setNodeAttribute(node, "hidden", false);
        });
        setSelectedNodeCount(-1);
        setSelectedNodeEdges(null);
        setInWeight(-1);
        setOutWeight(-1);
        sigma.refresh();
      }
    }, [selectedNode, showSecondDegreeNeighbors]);

    useEffect(() => {
      renderClusterLabels();
      // Register the events
      registerEvents({
        clickNode: (event: any) => {
          const nodeLabel = graph?.getNodeAttribute(event.node, "label");
          let newParams: { s?: string; ml?: string } = {
            s: `${nodeLabel}`,
          };
          if (showMootList) {
            newParams.ml = `${showMootList}`;
          }
          setSearchParams(newParams);
        },
        doubleClickNode: (event: any) => {
          window.open(
            `https://bsky.app/profile/${graph?.getNodeAttribute(
              event.node,
              "did"
            )}`,
            "_blank"
          );
        },
        afterRender: () => {
          renderClusterLabels();
        },
        clickStage: (_: any) => {
          setSearchParams({});
        },
      });
    }, [registerEvents]);

    return null;
  };

  async function fetchGraph() {
    let fetchURL = `./exporter/out/${currentLayoutName}_layout.json`;

    const textGraph = await fetch(fetchURL);
    const responseJSON = await textGraph.json();
    setGraphDump(responseJSON);
  }

  useEffect(() => {
    const selectedUserFromParams = searchParams.get("s");
    const showMootListFromParams = searchParams.get("ml");
    if (selectedUserFromParams !== null) {
      const selectedNodeKey = nodeMap.get(selectedUserFromParams)?.key;
      if (selectedNodeKey !== undefined) {
        setSelectedNode(selectedNodeKey.toString());
      }
    } else {
      setSelectedNode(null);
    }
    setShowMootList(showMootListFromParams === "true");
  }, [searchParams, nodeMap]);

  useEffect(() => {
    fetchGraph();
  }, []);

  return (
    <div className="overflow-hidden">
      {loading && <Loading message="Loading Graph" />}
      <SigmaContainer
        graph={MultiDirectedGraph}
        style={{ height: "100vh" }}
        settings={{
          nodeProgramClasses: { image: getNodeProgramImage() },
          defaultNodeType: "image",
          defaultEdgeType: "arrow",
          labelDensity: 0.07,
          labelGridCellSize: 60,
          labelRenderedSizeThreshold: 9,
          labelFont: "Lato, sans-serif",
          zIndex: true,
        }}
      >
        {selectedNode !== null && mootList.length > 0 && (
          <div className="bg-white shadow rounded-md absolute
          mobile:overflow-scroll mobile:left-1/2 mobile:top-2 mobile:transform mobile:left-2 mobile:right-2 mobile:w-fit mobile:translate-x-0
          desktop:overflow-hidden desktop:left-1/2 desktop:top-5 desktop:transform desktop:w-1/3 desktop:left-5 desktop:translate-x-0
          mt-auto z-50">
            <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
              <div className="-ml-4 -mt-2 flex flex-wrap items-center justify-between sm:flex-nowrap">
                <div className="ml-4 mt-2">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    {getTranslation('top_moots')}
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
                    {showMootList ? getTranslation('hide') : getTranslation('show')}
                  </button>
                </div>
              </div>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  {getTranslation('these_are_top_moots_that')}{" "}
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
                  {getTranslation('has_interacted_with')}.
                </p>
              </div>
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
        )}
        {legend && (<Legend legend={legend} setLegend={setLegend} layoutName={currentLayoutName} showHiddenClusters={showHiddenClusters} />)}
        <div className="overflow-hidden w-screen h-screen absolute top-0 left-0">
          {clusters.map((cluster) => {
            if (cluster.label !== undefined) {
              return (
                <div
                  key={cluster.idx}
                  id={`cluster-${cluster.idx}`}
                  hidden={!showClusterLabels}
                  className="clusterLabel absolute md:text-3xl text-xl"
                  style={{
                    fontSize: 24,
                    fontWeight: "bolder",
                    color: `${cluster.color}`,
                    top: `${cluster.y}px`,
                    left: `${cluster.x}px`,
                    zIndex: 3,
                  }}
                >
                  {config.hideClusterLabels.indexOf(cluster.label) > -1
                    ? ""
                    : config.knownClusterNames.get(cluster.label)
                    ?? (cluster.displayName || cluster.label)}
                </div>
              );
            }
          })}
        </div>
        <SocialGraph />
        <div className="
        mobile:bottom-12 mobile:left-0 mobile:right-0 mobile:w-fit mobile:h-3/7 mobile:transform mobile:translate-x-0
        desktop:left-1/2 desktop:bottom-12 desktop:transform desktop:-translate-x-1/2 desktop:w-fit
         z-50 fixed">
          <div className="bg-white shadow sm:rounded-lg py-1">
            <dl className="mx-auto grid gap-px bg-gray-900/5 grid-cols-2">
              <div className="flex flex-col items-baseline bg-white text-center">
                <dt className="text-sm font-medium leading-6 text-gray-500 ml-auto mr-auto mt-2">
                  <span className="hidden lg:inline-block">{getTranslation('represented')}{" "}</span>{" "}{getTranslation('users')}
                </dt>
                <dd className="lg:text-3xl mr-auto ml-auto text-lg font-medium leading-10 tracking-tight text-gray-900">
                  {selectedNodeCount >= 0
                    ? selectedNodeCount.toLocaleString()
                    : userCount.toLocaleString()}
                </dd>
              </div>
              <div className="flex flex-col items-baseline bg-white text-center">
                <dt className="text-sm font-medium leading-6 text-gray-500 ml-auto mr-auto mt-2">
                  <span className="hidden lg:inline-block">{getTranslation('represented')}{" "}</span>{" "}{getTranslation('interactions')}
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
                      {getTranslation('show_communities')}{" "}<span className="hidden md:inline">{getTranslation('graph_will_refresh')}</span>
                      <span className="md:hidden">{getTranslation('graph_will_refresh')}</span>
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
                <div>
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
                        {getTranslation('show_hidden_clusters')}{" "}<span className="hidden md:inline">{getTranslation('graph_will_refresh')}</span>
                        <span className="md:hidden">{getTranslation('graph_will_refresh')}</span>
                      </label>
                    </div>
                  </div>
                </div>
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
                      {getTranslation('interactions')}{" "}<span className="hidden md:inline">{getTranslation('of_friends')}</span>
                      <span className="md:hidden">{getTranslation('of_friends')}</span>
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
                      {getTranslation('labels')}{" "}<span className="hidden md:inline">{getTranslation('of_clusters')}</span>
                      <span className="md:hidden">{getTranslation('of_clusters')}</span>
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
                      {getTranslation('more_details')}{" "}<span className="hidden md:inline">{getTranslation('on_clusters')}</span>
                      <span className="md:hidden">{getTranslation('on_clusters')}</span>
                    </label>
                  </div>
                </div>
                <div className="flex flex-row">
                  <LayoutMenu setLoading={setLoading} setCurrentLayoutName={setCurrentLayoutName} setGraphShouldUpdate={setGraphShouldUpdate} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SigmaContainer>
      <footer className="bg-white fixed bottom-0 text-center w-full z-50">
        <div className="mx-auto max-w-7xl px-2">
          <span className="footer-text text-xs">
            {config.legend.author &&
              <div>
                {getTranslation('cluster_algo_made_by')}{" "}
                <a
                  href={config.legend.author.url}
                  target="_blank"
                  className="font-bold underline-offset-1 underline"
                >
                  {config.legend.author.name}
                </a>
                {". "}
              </div>
            }
            {getTranslation('visualization')}{" "}
            <a
              href="https://bsky.jazco.dev/atlas"
              target="_blank"
              className="font-bold underline-offset-1 underline"
            >
              {getTranslation('based_on_atlas')}
            </a>{" "}{getTranslation('from')}{" "}
            <a
              href="https://bsky.app/profile/jaz.bsky.social"
              target="_blank"
              className="font-bold underline-offset-1 underline"
            >
              Jaz
            </a>
            {" 🏳️‍⚧️"}
          </span>
          <span className="footer-text text-xs">
            {" | "}
            {graph
              ? formatDistanceToNow(
                parseISO(graph?.getAttribute("lastUpdated")),
                { addSuffix: true }
              )
              : "loading..."}{" "}
            <img src="/update-icon.svg" className="inline-block h-4 w-4" />
            {" | "}
            <a
              href="https://github.com/uabluerail/atlas"
              target="_blank"
            >
              <img
                src="/github.svg"
                className="inline-block h-3.5 w-4 mb-0.5"
              />
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default GraphContainer;
