export interface ForceDirectedGraphNodeOptions<T> {
  id: (node: T) => string;
  group: (node: T) => string;
  onClick: (node: T) => void;
  r: number;
  "stroke-width": number;
  fill: (node: T) => string;
}
