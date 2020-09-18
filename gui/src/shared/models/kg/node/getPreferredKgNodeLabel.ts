export const getPreferredKgNodeLabel = (node: {
  id: string;
  labels: readonly string[];
}) => {
  if (node.labels.length > 0) {
    return node.labels[0];
  }
  return node.id;
};
