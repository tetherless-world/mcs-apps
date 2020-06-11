import * as React from "react";
import {Frame} from "components/frame/Frame";
import * as PathPageDocument from "api/queries/PathPageQuery.graphql";
import {PathPageQuery} from "api/queries/types/PathPageQuery";
import {useQuery} from "@apollo/react-hooks";
import {ForceDirectedGraph} from "components/data/ForceDirectedGraph";
import * as d3 from "d3";
import {Node} from "models/Node";
import {FatalErrorModal} from "components/error/FatalErrorModal";
import {ApolloException} from "@tetherless-world/twxplore-base";

interface PathNode extends d3.SimulationNodeDatum, Node {
  pathId: string;
}

interface PathEdge extends d3.SimulationLinkDatum<PathNode> {}

export const PathPage: React.FunctionComponent = () => {
  const {data, error} = useQuery<PathPageQuery>(PathPageDocument);
  // console.dir(data);

  if (error) {
    return <FatalErrorModal exception={new ApolloException(error)} />;
  }

  const pathGraphData = React.useMemo<{
    nodes: PathNode[];
    links: PathEdge[];
  }>(() => {
    const nodes: PathNode[] = [];
    const links: PathEdge[] = [];

    data?.paths.forEach((path) => {
      path.edges.forEach((edge) => {
        if (
          edge.subjectNode &&
          nodes.find((node) => node.id === edge.subject) === undefined
        ) {
          nodes.push({...edge.subjectNode, pathId: path.id});
        }

        if (
          edge.objectNode &&
          nodes.find((node) => node.id === edge.object) === undefined
        ) {
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
      <ForceDirectedGraph
        {...pathGraphData}
        width={500}
        height={500}
        nodeIdFunction={(node) => node.id}
        nodeGroupFunction={(node) => node.pathId}
      />
    </Frame>
  );
};
