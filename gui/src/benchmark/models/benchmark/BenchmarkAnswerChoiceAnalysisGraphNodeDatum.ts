import {ForceGraphNodeDatum} from "models/data/forceGraph/ForceGraphNodeDatum";

export interface BenchmarkAnswerChoiceAnalysisGraphNodeDatum
  extends ForceGraphNodeDatum {
  paths: {
    questionAnswerPathId: string;
    id: string;
    score: number;
  }[];
  incomingEdges: number;
  outgoingEdges: number;
}
