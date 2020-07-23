export type KgEdge = {
  readonly subject: string;
  readonly predicate: string;
  readonly object: string;
  readonly sources: string[];
  readonly weight: Number;
};
