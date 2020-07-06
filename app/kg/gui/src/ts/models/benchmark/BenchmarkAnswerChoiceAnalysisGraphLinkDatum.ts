import {ForceGraphLinkDatum} from "models/data/forceGraph/ForceGraphLinkDatum";
import {BenchmarkAnswerChoiceAnalysisGraphNodeDatum} from "models/benchmark/BenchmarkAnswerChoiceAnalysisGraphNodeDatum";

export interface BenchmarkAnswerChoiceAnalysisGraphLinkDatum
  extends ForceGraphLinkDatum<BenchmarkAnswerChoiceAnalysisGraphNodeDatum> {
  pathId: string;
  questionAnswerPathId: string;
  score: number;
}
