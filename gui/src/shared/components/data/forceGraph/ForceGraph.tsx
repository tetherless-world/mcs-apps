import * as React from "react";
import * as d3 from "d3";

import {
  ForceGraphNodeDatum,
  ForceGraphLinkDatum,
} from "shared/models/data/forceGraph";

const dragHandler = <
  NodeDatum extends ForceGraphNodeDatum,
  LinkDatum extends ForceGraphLinkDatum<NodeDatum>
>(
  simulation: d3.Simulation<NodeDatum, LinkDatum>
) => {
  function dragstarted(d: NodeDatum) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d: NodeDatum) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d: NodeDatum) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3
    .drag<SVGGElement, NodeDatum>()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
};

// Reference https://github.com/uber/react-vis-force
export const ForceGraph = <
  NodeDatum extends ForceGraphNodeDatum,
  LinkDatum extends ForceGraphLinkDatum<NodeDatum>
>({
  height,
  width,
  simulation: userDefinedSimulation,
  children,
}: React.PropsWithChildren<{
  height: number;
  width: number;
  simulation?: d3.Simulation<NodeDatum, LinkDatum>;
}>) => {
  const svgRef = React.useRef<SVGSVGElement>(null);

  const simulation = React.useMemo(
    () =>
      userDefinedSimulation ??
      d3
        .forceSimulation<NodeDatum, LinkDatum>()
        .force(
          "link",
          d3
            .forceLink<NodeDatum, LinkDatum>()
            .id((node) => node.id)
            .distance(100)
          // .strength(1)
        )
        // .force("center", d3.forceCenter())
        .force("charge", d3.forceManyBody().strength(-300))
        .force("x", d3.forceX())
        .force("y", d3.forceY()),
    // .force("collide", d3.forceCollide(50)),
    []
  );

  // When nodes or links are changed, update simulation
  React.useEffect(() => {
    if (!svgRef.current) {
      return;
    }

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

    simulation
      .nodes(nodes)
      .force<d3.ForceLink<NodeDatum, LinkDatum>>("link")!
      .links(links);

    const svg = d3.select<SVGSVGElement, null>(svgRef.current);

    const zoomContainer = svg.select<SVGGElement>("g.zoom");
    d3.zoom<SVGSVGElement, null>().on("zoom", () => {
      zoomContainer.attr("transform", d3.event.transform);
    })(svg);

    const linkSelection = svg
      .selectAll<SVGGElement, LinkDatum>("g.link")
      .data(links, function (link) {
        return link ? link.id : d3.select(this).attr("id");
      });

    const linkElementSelection = linkSelection
      .selectAll<SVGCircleElement, LinkDatum>("line")
      .data((link) => [link]);

    const linkLabelSelection = linkSelection
      .selectAll<SVGTextElement, LinkDatum>("text")
      .data((link) => [link, link]);

    const nodeSelection = svg
      .selectAll<SVGGElement, NodeDatum>("g.node")
      .data(nodes, function (node) {
        return node ? node.id : d3.select(this).attr("id");
      })
      .call(dragHandler(simulation));

    const nodeElementSelection = nodeSelection
      .selectAll<SVGCircleElement, NodeDatum>("circle")
      .data((node) => [node]);

    const nodeLabelSelection = nodeSelection
      .selectAll<SVGTextElement, NodeDatum>("text")
      .data((node) => [node, node]);

    simulation.on("tick", () => {
      linkElementSelection
        .attr("x1", (link) => (link.source as NodeDatum).x!)
        .attr("y1", (link) => (link.source as NodeDatum).y!)
        .attr("x2", (link) => (link.target as NodeDatum).x!)
        .attr("y2", (link) => (link.target as NodeDatum).y!);

      linkLabelSelection
        .attr(
          "x",
          (link) =>
            ((link.source as NodeDatum).x! + (link.target as NodeDatum).x!) / 2
        )
        .attr(
          "y",
          (link) =>
            ((link.source as NodeDatum).y! + (link.target as NodeDatum).y!) / 2
        );

      nodeElementSelection
        .attr("cx", (node) => node.x!)
        .attr("cy", (node) => node.y!);

      nodeLabelSelection
        .attr("x", (node) => node.x!)
        .attr("y", (node) => node.y!);
    });
  }, [svgRef, children]);

  return (
    <svg
      ref={svgRef}
      height={height}
      width={width}
      viewBox={[-width / 2, -height / 2, width, height].join(" ")}
      cursor="move"
      style={{border: "1px solid black"}}
    >
      <g className="zoom">{children}</g>
    </svg>
  );
};
