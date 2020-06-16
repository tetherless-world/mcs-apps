import * as React from "react";
import * as d3 from "d3";

import {ForceDirectedGraphNodeOptions as NodeOptions} from "models/data/ForceDirectedGraphNodeOptions";

// type D3AttrValue<GElement extends d3.BaseType, Datum> =
//   | null
//   | string
//   | number
//   | boolean
//   | d3.ValueFn<GElement, Datum, string | number | boolean | null>;

// type D3Value<T, GElement extends d3.BaseType, Datum> =
//   | null
//   | T
//   | d3.ValueFn<GElement, Datum, T>;

// interface ForceDirectedGraphOptions<
//   NodeDatum extends d3.SimulationNodeDatum,
//   LinkDatum extends d3.SimulationLinkDatum<NodeDatum>
// > {
//   node: ForceDirectedGraphNodeOptions<NodeDatum>;
//   link: {[key: string]: D3AttrValue<SVGLineElement, LinkDatum>};
// }

// interface ForceDirectedGraphNodeOptions<
//   NodeDatum extends d3.SimulationNodeDatum
// > {
//   r: D3Value<number, SVGCircleElement, NodeDatum>;
// }

interface LinkOptions<T> {}

// Reference https://observablehq.com/@d3/force-directed-graph
export const ForceDirectedGraph = <
  NodeDatum extends d3.SimulationNodeDatum,
  LinkDatum extends d3.SimulationLinkDatum<NodeDatum>
>({
  nodes,
  links,
  height,
  width,
  nodeOptions,
  linkOptions,
}: // nodeOptions: userDefinedNodeOptions,
{
  nodes: NodeDatum[];
  links: LinkDatum[];
  height: number;
  width: number;
  nodeOptions: NodeOptions<NodeDatum>;
  linkOptions: LinkOptions<LinkDatum>;
  // nodeOptions?: Partial<ForceDirectedGraphNodeOptions<NodeDatum>>;
}) => {
  const svgRef = React.useRef<SVGSVGElement>(null);

  // const options: ForceDirectedGraphOptions<NodeDatum, LinkDatum> = {
  //   node: {
  //     r: 5,
  //     ...(userDefinedNodeOptions || {}),
  //   },
  //   link: {},
  // };

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
        d3.forceLink<NodeDatum, LinkDatum>(links).id(nodeOptions.id)
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

    const svgEnter = svg.selectAll("g").data([null]).enter();

    svgEnter
      .append("g")
      .attr("class", "links")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6);

    svgEnter
      .append("g")
      .attr("class", "nodes")
      .attr("stroke", "#fff")
      .attr("stroke-width", nodeOptions["stroke-width"]);

    const link = svg
      .select<SVGGElement>("g.links")
      .selectAll<SVGLineElement, LinkDatum>("line")
      .data(links)
      .join("line")
      // .attr("stroke-width", (d) => Math.sqrt(d.value));
      .attr("stroke-width", 1);

    const node = svg
      .select<SVGGElement>("g.nodes")
      .selectAll<SVGCircleElement, NodeDatum>("circle")
      .data(nodes, nodeOptions.id)
      .join("circle")
      .attr("r", nodeOptions.r)
      .attr("fill", nodeOptions.fill)
      .on("click", nodeOptions.onClick)
      .style("cursor", "pointer")
      .call(drag(simulation));

    node.append("title").text(nodeOptions.id);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as NodeDatum).x!)
        .attr("y1", (d) => (d.source as NodeDatum).y!)
        .attr("x2", (d) => (d.target as NodeDatum).x!)
        .attr("y2", (d) => (d.target as NodeDatum).y!);

      node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
    });
  }, [svgRef, nodes, links, height, width]);

  return <svg ref={svgRef} height={height} width={width} />;
};
