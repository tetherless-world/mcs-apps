import * as React from "react";
import * as d3 from "d3";

import {ForceGraphNodeProps} from "./ForceGraphNode";
import {ForceGraphLinkProps} from "./ForceGraphLink";

// Positions
interface NodePositions {
  [nodeId: string]: {cx: number; cy: number};
}

interface LinkPositions {
  [linkId: string]: {x1: number; y1: number; x2: number; y2: number};
}

// Reference https://github.com/uber/react-vis-force
export const ForceGraph = <
  NodeDatum extends d3.SimulationNodeDatum & {id: string},
  LinkDatum extends d3.SimulationLinkDatum<NodeDatum> & {id: string}
>({
  height,
  width,
  children,
}: React.PropsWithChildren<{
  height: number;
  width: number;
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
            cx: node.x!,
            cy: node.y!,
          },
        }),
        prevPositions
      )
    );
  }, []);

  // Initialize force simulation once and then update node
  // and links with useEffect
  const simulation = React.useMemo<d3.Simulation<NodeDatum, LinkDatum>>(
    () =>
      d3
        .forceSimulation<NodeDatum, LinkDatum>()
        .force(
          "link",
          d3.forceLink<NodeDatum, LinkDatum>().id((node) => node.id)
        )
        .force("charge", d3.forceManyBody())
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .on("tick", updatePositions)
        .on("end", () => {
          simulation.on("tick", null);
        }),
    []
  );

  // When nodes or links are changed, update simulation
  React.useEffect(() => {
    simulation
      .nodes(nodes)
      .force<d3.ForceLink<NodeDatum, LinkDatum>>("link")!
      .links(links);
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
