import React, { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { MultiDirectedGraph } from "graphology";
import Menu from "./Menu";
import getNodeProgramImage from "sigma/rendering/programs/node-image";
import {
  SigmaContainer,
  useRegisterEvents,
  useLoadGraph,
  useSigmaContext,
} from "@react-sigma/core";
import { Coordinates } from "sigma/types";
import "@react-sigma/core/lib/react-sigma.min.css";
import iwanthue from "iwanthue";
import Loading from "./Loading";
import Legend from "./Legend";
import { config } from "../common/visualConfig"
import { getTranslation, getLanguageByName } from "../common/translation";
import Footer from "./Footer";
import { useMediaQuery } from 'react-responsive'

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
  const [moderator] = React.useState<boolean>(searchParams.get("moderator") === "true");

  const isMobile = useMediaQuery({ query: '(max-width: 600px)' });
  console.log("------------------------ isMobile: " + isMobile);
  const [currentLayoutName] = React.useState<string>(searchParams.get("layout") ? config.getLayoutName(searchParams.get("layout"), moderator) : config.getDefaultLayout(moderator, isMobile));
  const [currentLanguage, setCurrentLanguage] = React.useState<string>(getLanguageByName(searchParams.get("lang")));
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
      {loading && <Loading message={getTranslation('loading_graph', currentLanguage)} />}
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
                    {getTranslation('top_moots', currentLanguage)}
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
                    {showMootList ? getTranslation('hide', currentLanguage) : getTranslation('show', currentLanguage)}
                  </button>
                </div>
              </div>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
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
                  {getTranslation('has_interacted_with', currentLanguage)}.
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
        {legend && (<Legend
          legend={legend}
          setLegend={setLegend}
          layoutName={currentLayoutName}
          showHiddenClusters={showHiddenClusters}
          currentLanguage={currentLanguage}
        />)}
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
        <Menu
          selectedNodeCount={selectedNodeCount}
          userCount={userCount}
          selectedNodeEdges={selectedNodeEdges}
          edgeCount={edgeCount}
          graph={graph}
          showMootList={showMootList}
          currentLayoutName={currentLayoutName}
          currentLanguage={currentLanguage}
          setSearchParams={setSearchParams}
          setLoading={setLoading}
          useSubclusterOverlay={useSubclusterOverlay}
          setUseSubclusterOverlay={setUseSubclusterOverlay}
          setGraphShouldUpdate={setGraphShouldUpdate}
          showHiddenClusters={showHiddenClusters}
          setShowHiddenClusters={setShowHiddenClusters}
          showSecondDegreeNeighbors={showSecondDegreeNeighbors}
          setShowSecondDegreeNeighbors={setShowSecondDegreeNeighbors}
          showClusterLabels={showClusterLabels}
          setShowClusterLabels={setShowClusterLabels}
          legend={legend}
          setLegend={setLegend}
          moderator={moderator} />
      </SigmaContainer>
      <Footer graph={graph} currentLanguage={currentLanguage} setCurrentLanguage={setCurrentLanguage} />
    </div>
  );
};

export default GraphContainer;
