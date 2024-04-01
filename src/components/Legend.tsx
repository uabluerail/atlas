import { FC, Dispatch, SetStateAction } from "react";
import { config } from "../common/visualConfig"
import { getTranslation } from "../common/translation";
import { GroupLegend, ClusterConfig } from "../../exporter/src/common/model";

interface LegendProps {
    legend: boolean;
    setLegend: Dispatch<SetStateAction<boolean>>;
    layoutName: string;
    showHiddenClusters: boolean;
}

const buildLinks = (links: {
    title: string;
    url: string;
}[]) => {
    const compiledLinks: any[] = [];
    links.forEach(link => compiledLinks.push(<p className="mt-2">
        <a
            href={link.url}
            target="_blank"
            className="font-bold text-xs underline-offset-1 underline"
        > {link.title}
        </a>
    </p>))
    return <div>{compiledLinks}</div>;
}

const buildExtras = (extras: string[]) => {
    const compiledExtras: any[] = [];
    extras.forEach(extra => compiledExtras.push(<p className="mt-2">
        {extra}
    </p>))
    return <div>{compiledExtras}</div>;
}

const Legend: FC<LegendProps> = ({ legend, setLegend, layoutName, showHiddenClusters }) => {
    const buildLegend = (legendGroup: GroupLegend) => {
        const clusterLegends: any[] = [];
        legendGroup.clusters.forEach(clusterName => {
            const cluster: ClusterConfig = config.getCluster(clusterName);
            const hideCluster = !includedClusters.get(clusterName) //not included in the graph
                || (hiddenClusters.get(clusterName) && !showHiddenClusters); //hidden when option show all clusters is off
            if (cluster && cluster.legend && !hideCluster) {
                const newLegend = <div>
                    {cluster.legend.description && <p className="mt-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-bold rounded-full bg-black" style={{ color: cluster.color }}>
                            {cluster.label}
                        </span> - {cluster.legend.description}
                    </p>}
                    {cluster.legend.extra && <p className="mt-2">
                        {cluster.legend.extra}
                    </p>}
                    {cluster.legend.links && <p className="mt-2 mb-5">
                        {buildLinks(cluster.legend.links)}
                    </p>}
                </div>;
                clusterLegends.push(newLegend);
            }
        });
        return <div>
            <h5 className="text-sm font-semibold leading-10 text-gray-600 mt-2">{legendGroup.label}</h5>
            <p className="mt-2">
                {legendGroup.description}
            </p>
            {legendGroup.extras && <p className="mt-2">
                {buildExtras(legendGroup.extras)}
            </p>}
            {legendGroup.links && <p className="mt-2 mb-5">
                {buildLinks(legendGroup.links)}
            </p>}
            {clusterLegends}
        </div>
    }

    const legendGroups: any[] = [];
    const includedClusters: Map<string, boolean> = config.includedClusters.get(layoutName) ?? new Map();
    const hiddenClusters: Map<string, boolean> = config.hiddenClusters.get(layoutName) ?? new Map();
    const currentLayoutLegend = config.getLayout(layoutName) && config.getLayout(layoutName).legend;
    const currentLayoutLegends: GroupLegend[] = config.legend.legends.filter(legend => legend.name === currentLayoutLegend)[0].groups ?? [];

    currentLayoutLegends.forEach(group => {
        const hasIncludedClusters = group.clusters.filter(clusterName => includedClusters.get(clusterName)
            && (showHiddenClusters || !hiddenClusters.get(clusterName))).length > 0;
        const shouldShowGroup = hasIncludedClusters && group.hide !== true;
        if (shouldShowGroup) {
            legendGroups.push(buildLegend(group));
        }
    });

    return (
        <div className="overflow-scroll bg-white shadow sm:rounded-md absolute transform
    mobile:left-1/2 mobile:top-2 mobile:left-2 mobile:right-2 mobile:w-fit mobile:h-1/2
    desktop:right-1/2 desktop:top-5 desktop:right-5 desktop:w-3/7 desktop:h-1/2
    translate-x-0 mt-auto z-50">
            <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                <div className="-ml-4 -mt-2 flex flex-wrap items-center justify-between sm:flex-nowrap">
                    <div className="ml-4 mt-2">
                        <h3 className="text-base font-semibold leading-6 text-gray-900">
                            {getTranslation('clusters_legend')}
                        </h3>
                    </div>
                    <div className="ml-4 mt-2 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => {
                                setLegend(!legend);
                            }}
                            className={
                                `relative inline-flex items-center rounded-md  px-3 py-2 text-xs font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2` +
                                (legend
                                    ? " bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600"
                                    : " bg-green-500 hover:bg-green-600 focus-visible:ring-green-500")
                            }
                        >
                            {legend ? getTranslation('hide') : getTranslation('show')}
                        </button>
                    </div>
                </div>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <h5 className="text-sm font-semibold leading-10 text-gray-600">
                        {getTranslation('overview_title')}
                    </h5>
                    <p>
                        {getTranslation('overview_part1')}
                    </p>
                    <p className="mt-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">{getTranslation('red_arrows')}</span> - {getTranslation('interactions_from_you')}.
                    </p>
                    <p className="mt-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{getTranslation('blue_arrows')}</span> - {getTranslation('interactions_to_you')}.
                    </p>
                    {config.legend.arrows && <p className="mt-2">
                        {config.legend.arrows}
                    </p>}
                    {config.legend.algo && <p className="mt-2">
                        {config.legend.algo}
                    </p>}
                    <h5 className="text-sm font-semibold leading-10 text-gray-600">
                        {getTranslation('overview_clusters')}
                    </h5>
                    {legendGroups}
                </div>
            </div>
        </div>
    )
}

export default Legend;