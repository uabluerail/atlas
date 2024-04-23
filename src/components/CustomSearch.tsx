import React, { ChangeEvent, useEffect, useState, CSSProperties } from "react";
import { Attributes } from "graphology-types";
import { getTranslation } from "../common/translation";
import { useRegisterEvents, useCamera, useSigma } from "@react-sigma/core";
import { config } from "../common/visualConfig";
import { SearchNode } from "../model";

type SearchLabelKeys = "text" | "placeholder";

/**
 * Properties for `SearchControl` component
 */
export interface SearchControlProps {

  viewPort: { width: number, height: number }
  /**
   * HTML id
   */
  id?: string;

  /**
   * HTML class
   */
  className?: string;

  /**
   * HTML CSS style
   */
  style?: CSSProperties;

  currentLayoutName: string;

  currentLanguage: string;

  /**
   * Map of the labels we use in the component.
   * This is usefull for I18N
   */
  labels?: { [Key in SearchLabelKeys]?: string };

  onLocate?: (nodeId: string) => void;
}

/**
 * The `SearchControl` create an input text where user can search a node in the graph by its label.
 * There is an autocomplete based on includes & lower case.
 * When a node is found, the graph will focus on the highlighted node
 *
 * ```jsx
 * <SigmaContainer>
 *   <ControlsContainer>
 *     <SearchControl />
 *   </ControlsContainer>
 * </SigmaContainer>
 * ```
 * See [[SearchControlProps]] for more information.
 *
 * @category Component
 */

function getUniqueKey(): string {
  return Math.random().toString(36).slice(2);
}

export const CustomSearch: React.FC<SearchControlProps> = ({
  viewPort,
  id,
  className,
  style,
  currentLayoutName,
  currentLanguage,
  labels = {},
  onLocate,
}: SearchControlProps) => {
  // Get sigma
  const sigma = useSigma();
  // Get event hook
  const registerEvents = useRegisterEvents();
  // Get camera hook
  const { goto: cameraGoTo } = useCamera();
  // Search value
  const [search, setSearch] = useState<string>("");
  // Datalist values
  const [values, setValues] = useState<Map<string, { id: string, label: string }>>(new Map());
  // Selected
  const [selected, setSelected] = useState<string | null>(null);
  // random id for the input
  const [inputId, setInputId] = useState<string>("");


  const layout = config.getLayout(currentLayoutName);

  const [handleSearchMap, setHandlesSearchMap] = useState<Map<string, SearchNode>>(new Map());
  const [searchLoaded, setSearchLoaded] = useState<boolean>(false);

  async function fetchSearch() {
    let responseJSON: {
      graphVersion: number;
      nodes: SearchNode[]
    };
    if (layout.searchFileName) {
      const textGraph = await fetch("./exporter/out/" + layout.searchFileName);
      responseJSON = await textGraph.json();
      const searchMap = new Map();
      responseJSON.nodes.forEach(node => {
        searchMap.set(node.handle, node);
      });
      setHandlesSearchMap(searchMap);
      setSearchLoaded(true);
    }
  }
  /**
   * When component mount, we set a random input id.
   */
  useEffect(() => {
    setInputId(`search-${getUniqueKey()}`);
  }, []);

  useEffect(() => {
    if (!searchLoaded) {
      fetchSearch();
    }
  }, [searchLoaded]);

  /**
   * When the search input changes, recompute the autocomplete values.
   */
  useEffect(() => {
    const newValues: Map<string, { id: string, label: string }> = new Map();
    if (!selected && search.length > 4) {
      if (layout.searchFileName) {
        const foundValues: Map<string, string> = new Map();
        handleSearchMap.forEach((node, key) => {
          if (
            key &&
            key.toLowerCase().startsWith(search.toLowerCase())
          )
            node.communities.forEach(name => {
              if (!foundValues.get(name)) {
                foundValues.set(name, key);
              }
            })
        });
        sigma
          .getGraph()
          .forEachNode((key: string, attributes: Attributes): void => {
            foundValues.forEach((user, name) => {
              if (
                attributes.label &&
                attributes.label.toLowerCase().includes(name.toLowerCase())
              )
                if (!newValues.get(key)) {
                  newValues.set(key, { id: key, label: user + ":" + name });
                }
            });
          });
      } else {
        sigma
          .getGraph()
          .forEachNode((key: string, attributes: Attributes): void => {
            if (
              attributes.label &&
              attributes.label.toLowerCase().includes(search.toLowerCase())
            )
              if (!newValues.get(key)) {
                newValues.set(key, { id: key, label: attributes.label });
              }
          });
      }
    }
    setValues(newValues);
  }, [search]);

  /**
   * When use clik on the stage
   *  => reset the selection
   */
  useEffect(() => {
    registerEvents({
      clickStage: () => {
        setSelected(null);
        setSearch("");
      },
    });
  }, [registerEvents]);

  /**
   * When the selected item changes, highlighted the node and center the camera on it.
   */
  useEffect(() => {
    if (!selected) {
      return;
    }

    if (onLocate) {
      onLocate(selected);
    }

    sigma.getGraph().setNodeAttribute(selected, "highlighted", true);

    const nodeDisplayData = sigma.getNodeDisplayData(selected);

    document.getElementById(inputId)?.blur();

    cameraGoTo({
      x: nodeDisplayData && nodeDisplayData.x,
      y: nodeDisplayData && nodeDisplayData.y,
      ratio: 0.1,
    });

    return () => {
      sigma.getGraph().setNodeAttribute(selected, "highlighted", false);
    };
  }, [selected]);

  /**
   * On change event handler for the search input, to set the state.
   */
  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const searchString = e.target.value;
    const valueItem = Array.from(values.values()).find((value) => value.label === searchString);
    if (valueItem) {
      setSearch(valueItem.label);
      setValues(new Map());
      setSelected(valueItem.id);
    } else {
      setSelected(null);
      setSearch(searchString);
    }
  };

  // Common html props for the div
  const htmlProps = {
    className: `react-sigma-search ${className ? className : ""}`,
    id,
    style,
  };

  return (
    <div {...htmlProps} className="w-full">
      <label htmlFor={inputId} style={{ display: "none" }}>
        {labels["text"] || "Search a node"}
      </label>
      <input
        id={inputId}
        type="text"
        className="block w-full text-xs xs:max-w-36 mobile:max-w-44 desktop:max-w-80 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 desktop:text-sm pl-3"
        placeholder={labels["placeholder"] || getTranslation('search_for_a_handle', currentLanguage, { viewPort, xs: 17 })}
        list={`${inputId}-datalist`}
        value={search}
        onChange={onInputChange}
      />
      <datalist id={`${inputId}-datalist`}>
        {Array.from(values.values()).map((value: { id: string; label: string }) => (
          <option key={value.id} value={value.label}>
            {value.label}
          </option>
        ))}
      </datalist>
    </div>
  );
};
