import {ForceGraphLinkDatum} from "shared/models/data/forceGraph/ForceGraphLinkDatum";
import {BenchmarkAnswerChoiceAnalysisGraphNodeDatum} from "benchmark/models/benchmark/BenchmarkAnswerChoiceAnalysisGraphNodeDatum";

export interface BenchmarkAnswerChoiceAnalysisGraphLinkDatum
  extends ForceGraphLinkDatum<BenchmarkAnswerChoiceAnalysisGraphNodeDatum> {
  pathId: string;
  questionAnswerPathId: string;
  score: number;
}
