import {KgEdgeObject} from "shared/models/kg/node/KgEdgeObject";

export const indexKgEdgeObjectsByPredicate = (
  edgeObjects: readonly KgEdgeObject[]
) => {
  const edgeObjectsByPredicate: {
    [index: string]: KgEdgeObject[];
  } = {};
  for (const edge of edgeObjects) {
    if (!edge.objectNode) {
      continue;
    } else if (!edge.predicate) {
      continue;
    }
    const edges = (edgeObjectsByPredicate[edge.predicate] =
      edgeObjectsByPredicate[edge.predicate] ?? []);
    edges.push(edge);
  }
  return edgeObjectsByPredicate;
};
