import * as React from "react";
import * as d3 from "d3";

import {ForceGraphNodeProps} from "./ForceGraphNode";
import {ForceGraphLinkProps} from "./ForceGraphLink";
import {
  ForceGraphNodePosition,
  ForceGraphLinkPosition,
  ForceGraphNodeDatum,
  ForceGraphLinkDatum,
} from "models/data/forceGraph";

// Positions
interface NodePositions {
  [nodeId: string]: ForceGraphNodePosition;
}

interface LinkPositions {
  [linkId: string]: ForceGraphLinkPosition;
}

// Reference https://github.com/uber/react-vis-force
export const ForceGraph = <
  NodeDatum extends ForceGraphNodeDatum,
  LinkDatum extends ForceGraphLinkDatum<NodeDatum>
>({
  height,
  width,
  boundNodes,
  simulation,
  children,
}: React.PropsWithChildren<{
  height: number;
  width: number;
  boundNodes?: boolean;
  simulation: d3.Simulation<NodeDatum, LinkDatum>;
}>) => {
  const [nodePositions, setNodePositions] = React.useState<NodePositions>({});
  const [linkPositions, setLinkPositions] = React.useState<LinkPositions>({});

  // Extract node and link data from children props
  const {nodes, links} = React.useMemo<{
    nodes: NodeDatum[];
    links: LinkDatum[];
  }>(() => {
    const nodes: NodeDatum[] = [];
    const links: LinkDatum[] = [];

    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) {
        return;
      }

      const {node, link} = child.props;
      if (node) {
        nodes.push(node);
      } else if (link) {
        links.push(link);
      }
    });

    return {nodes, links};
  }, [children]);

  const updatePositions = React.useCallback(() => {
    setLinkPositions((prevPositions) =>
      links.reduce<LinkPositions>(
        (positions, link) => ({
          ...positions,
          [link.id]: {
            x1: (link.source as NodeDatum).x!,
            y1: (link.source as NodeDatum).y!,
            x2: (link.target as NodeDatum).x!,
            y2: (link.target as NodeDatum).y!,
          },
        }),
        prevPositions
      )
    );

    setNodePositions((prevPositions) =>
      nodes.reduce<NodePositions>(
        (positions, node) => ({
          ...positions,
          [node.id]: {
            cx: boundNodes
              ? Math.max(
                  Math.min(node.x!, width / 2 - node.r),
                  -width / 2 + node.r
                )
              : node.x!,
            cy: boundNodes
              ? Math.max(
                  Math.min(node.y!, height / 2 - node.r),
                  -height / 2 + node.r
                )
              : node.y!,
          },
        }),
        prevPositions
      )
    );
  }, []);

  // When nodes or links are changed, update simulation
  React.useEffect(() => {
    simulation
      .nodes(nodes)
      .force<d3.ForceLink<NodeDatum, LinkDatum>>("link")!
      .links(links);
    simulation.on("tick", updatePositions);
  }, [nodes, links]);

  // Create children elements
  const nodeElements: React.ReactNode[] = [];
  const linkElements: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      return;
    }

    // Check component type by checking props
    const {node, link}: {node: NodeDatum; link: LinkDatum} = child.props;
    if (node) {
      nodeElements.push(
        // Use clone element to insert position attributes
        React.cloneElement<ForceGraphNodeProps<NodeDatum>>(child, {
          ...nodePositions[node.id],
        })
      );
    } else if (link) {
      linkElements.push(
        React.cloneElement<ForceGraphLinkProps<LinkDatum>>(child, {
          ...linkPositions[link.id],
        })
      );
    }
  });

  return (
    <svg
      height={height}
      width={width}
      viewBox={[-width / 2, -height / 2, width, height].join(" ")}
    >
      <g className="links">{linkElements}</g>
      <g className="nodes">{nodeElements}</g>
    </svg>
  );
};
