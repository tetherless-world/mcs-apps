export interface KgEdgeObject {
  object: string;
  objectNode: {
    id: string;
    label: string | null;
    pos: string | null;
  } | null;
  predicate: string;
}
