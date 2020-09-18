export const getPreferredKgEdgeLabel = (edge: {
  id: string;
  labels: readonly string[];
}) => {
  if (edge.labels.length > 0) {
    return edge.labels[0];
  }
  return edge.id;
};
