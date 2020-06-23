import * as d3 from "d3";

export type ForceGraphNodeDatum = {
  id: string;
  label: string;
  r: number;
} & d3.SimulationNodeDatum;
