import * as React from "react";
import * as d3 from "d3";

// Reference https://observablehq.com/@d3/force-directed-graph
export const ForceDirectedGraph = <
  NodeDatum extends d3.SimulationNodeDatum,
  LinkDatum extends d3.SimulationLinkDatum<NodeDatum>
>({
  nodes,
  links,
  height,
  width,
  nodeIdFunction,
  nodeGroupFunction,
}: {
  nodes: NodeDatum[];
  links: LinkDatum[];
  height: number;
  width: number;
  nodeIdFunction: (node: NodeDatum) => string;
  nodeGroupFunction: (node: NodeDatum) => string;
}) => {
  const svgRef = React.useRef<SVGSVGElement>(null);

  const scale = d3.scaleOrdinal(d3.schemeCategory10);
  const color = (d: NodeDatum) => scale(nodeGroupFunction(d));

  const drag = (simulation: d3.Simulation<NodeDatum, LinkDatum>) => {
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
      .drag<SVGCircleElement, NodeDatum>()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };

  React.useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    const simulation = d3
      .forceSimulation<NodeDatum, LinkDatum>(nodes)
      .force(
        "link",
        d3.forceLink<NodeDatum, LinkDatum>(links).id(nodeIdFunction)
      )
      .force("charge", d3.forceManyBody())
      .force("x", d3.forceX())
      .force("y", d3.forceY());
    // .force("center", d3.forceCenter(width / 2, height / 2));

    const svg = d3
      .select<SVGSVGElement, null>(svgRef.current)
      // @ts-ignore
      .attr("viewBox", [-width / 2, -height / 2, width, height]);
    // .attr("viewBox", [0, 0, width, height] as number[]);

    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll<SVGLineElement, LinkDatum>("line")
      .data(links)
      .join("line")
      // .attr("stroke-width", (d) => Math.sqrt(d.value));
      .attr("stroke-width", 1);

    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll<SVGCircleElement, NodeDatum>("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 5)
      .attr("fill", color)
      .call(drag(simulation));

    node.append("title").text(nodeIdFunction);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as NodeDatum).x!)
        .attr("y1", (d) => (d.source as NodeDatum).y!)
        .attr("x2", (d) => (d.target as NodeDatum).x!)
        .attr("y2", (d) => (d.target as NodeDatum).y!);

      node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
    });
  }, [svgRef, nodes, links]);

  return <svg ref={svgRef} height={height} width={width} />;
};
