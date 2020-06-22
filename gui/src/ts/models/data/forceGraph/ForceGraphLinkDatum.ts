import * as d3 from "d3";
import {ForceGraphNodeDatum} from "./ForceGraphNodeDatum";

export type ForceGraphLinkDatum<NodeDatum extends ForceGraphNodeDatum> = {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
} & d3.SimulationLinkDatum<NodeDatum>;
