import {
  KgNodeContext,
  KgNodeContextRelatedNodeLabel,
} from "shared/models/kg/node/KgNodeContext";

export const indexNodeContextByTopEdgePredicate = (
  nodeContext: KgNodeContext
): {[index: string]: readonly KgNodeContextRelatedNodeLabel[]} => {
  const relatedNodeLabelsByNodeId: {
    [index: string]: KgNodeContextRelatedNodeLabel[];
  } = {};
  for (const relatedNodeLabel of nodeContext.relatedNodeLabels) {
    for (const nodeId of relatedNodeLabel.nodeIds) {
      let relatedNodeLabels = relatedNodeLabelsByNodeId[nodeId];
      if (!relatedNodeLabels) {
        relatedNodeLabels = relatedNodeLabelsByNodeId[nodeId] = [];
      }
      relatedNodeLabels.push(relatedNodeLabel);
    }
  }

  const result: {[index: string]: KgNodeContextRelatedNodeLabel[]} = {};
  for (const topEdge of nodeContext.topEdges) {
    let predicateNodeLabels = result[topEdge.predicate];
    if (!predicateNodeLabels) {
      predicateNodeLabels = result[topEdge.predicate] = [];
    }
    const objectNodeLabels = relatedNodeLabelsByNodeId[topEdge.object];
    if (!objectNodeLabels) {
      continue;
    }
    for (const objectNodeLabel of objectNodeLabels) {
      if (
        predicateNodeLabels.some(
          (predicateNodeLabel) =>
            predicateNodeLabel.nodeLabel == objectNodeLabel.nodeLabel
        )
      ) {
        // Ignore duplicates
        continue;
      }
      predicateNodeLabels.push(objectNodeLabel);
    }
    predicateNodeLabels.sort((left, right) => left.pageRank - right.pageRank);
  }

  return result;
};
