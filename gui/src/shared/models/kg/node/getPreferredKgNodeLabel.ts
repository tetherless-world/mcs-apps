import * as stringSimilarity from "string-similarity";

export const getPreferredKgNodeLabel = (node: {
  id: string;
  labels: readonly string[];
}) => {
  switch (node.labels.length) {
    case 0:
      return node.id;
    case 1:
      return node.labels[0];
    default: {
      const matches = stringSimilarity.findBestMatch(node.id, node.labels);
      const bestNodeLabel = matches.bestMatch.target;
      console.debug(
        `Multiple node labels (${node.labels.join(", ")}) for id ${
          node.id
        }, choosing ${bestNodeLabel}`
      );
      return bestNodeLabel;
    }
  }
};
