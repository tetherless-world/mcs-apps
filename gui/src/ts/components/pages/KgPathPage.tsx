import * as React from "react";
import {Frame} from "components/frame/Frame";
import * as KgPathPageQueryDocument from "api/queries/KgPathPageQuery.graphql";
import {KgPathPageQuery} from "api/queries/types/KgPathPageQuery";
import {useQuery} from "@apollo/react-hooks";
import {ForceDirectedGraph} from "components/data/ForceDirectedGraph";
import * as d3 from "d3";
import {KgNode} from "models/KgNode";
import * as ReactLoader from "react-loader";
import {ApolloErrorHandler} from "components/error/ApolloErrorHandler";

interface KgPathNode extends d3.SimulationNodeDatum, KgNode {
  pathId: string;
}

interface KgPathEdge extends d3.SimulationLinkDatum<KgPathNode> {}

export const KgPathPage: React.FunctionComponent = () => {
  const {data, error} = useQuery<KgPathPageQuery>(KgPathPageQueryDocument);
  // console.dir(data);

  if (error) {
    return <ApolloErrorHandler error={error} />;
  }

  const pathGraphData = React.useMemo<{
    nodes: KgPathNode[];
    links: KgPathEdge[];
  }>(() => {
    const nodes: KgPathNode[] = [];
    const links: KgPathEdge[] = [];

    data?.kg.paths.forEach((path) => {
      path.edges.forEach((edge) => {
        if (
          edge.subjectNode &&
          !nodes.some((node) => node.id === edge.subject)
        ) {
          nodes.push({...edge.subjectNode, pathId: path.id});
        }

        if (edge.objectNode && !nodes.some((node) => node.id === edge.object)) {
          nodes.push({...edge.objectNode, pathId: path.id});
        }

        links.push({
          source: edge.subject,
          target: edge.object,
        });
      });
    });

    return {nodes, links};
  }, [data]);
  // console.log(pathGraphData);

  return (
    <Frame>
      <ReactLoader loaded={!data}>
        <ForceDirectedGraph
          {...pathGraphData}
          width={500}
          height={500}
          nodeIdFunction={(node) => node.id}
          nodeGroupFunction={(node) => node.pathId}
        />
      </ReactLoader>
    </Frame>
  );
};
