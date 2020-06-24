import * as React from "react";
import * as _ from "lodash";
import {List, ListItem, ListItemText, withStyles} from "@material-ui/core";
import {
  ForceGraph,
  ForceGraphNode,
  ForceGraphArrowLink,
} from "components/data/forceGraph";

import * as d3 from "d3";
import {BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById_answerByQuestionId_explanation_choiceAnalyses as AnswerChoiceAnalysis} from "api/queries/benchmark/types/BenchmarkAnswerPageQuery";
import {BenchmarkQuestionAnswerPathGraph} from "components/benchmark/BenchmarkQuestionAnswerPathGraph";
import {BenchmarkAnswerChoiceAnalysisGraphNodeDatum} from "models/benchmark/BenchmarkAnswerChoiceAnalysisGraphNodeDatum";
import {BenchmarkAnswerChoiceAnalysisGraphLinkDatum} from "models/benchmark/BenchmarkAnswerChoiceAnalysisGraphLinkDatum";
import {BenchmarkAnswerChoiceAnalysisGraphLegendCircle} from "components/benchmark/BenchmarkAnswerChoiceAnalysisGraphLegendCircle";
import {getQuestionAnswerPathId} from "util/benchmark/getQuestionAnswerPathId";
import {getAnswerPathId} from "util/benchmark/getAnswerPathId";

const extractNodeAndLinks = (choiceAnalysis: AnswerChoiceAnalysis) => {
  const nodes: {
    [nodeId: string]: BenchmarkAnswerChoiceAnalysisGraphNodeDatum;
  } = {};
  const links: {
    [linkId: string]: BenchmarkAnswerChoiceAnalysisGraphLinkDatum;
  } = {};

  choiceAnalysis.questionAnswerPaths.forEach((questionAnswerPath) => {
    const {
      paths,
      startNodeId,
      endNodeId,
      endNode,
      startNode,
    } = questionAnswerPath;

    const questionAnswerPathId = getQuestionAnswerPathId(questionAnswerPath);

    paths.forEach((answerPath, answerPathIndex) => {
      const {path, score} = answerPath;

      const pathId = getAnswerPathId(questionAnswerPath, answerPathIndex);

      // Extract nodes from path
      for (let i = 0; i < path.length; i += 2) {
        const nodeId = path[i];
        if (!nodes[nodeId]) {
          nodes[nodeId] = {
            id: nodeId,
            label: nodeId,
            incomingEdges: 0,
            outgoingEdges: 0,
            paths: [],
            r: 0,
          };
        }
      }

      // Update label of start and end node
      if (nodes[startNodeId] && startNode && startNode.label) {
        nodes[startNodeId].label = startNode.label;
      }

      if (nodes[endNodeId] && endNode && endNode.label) {
        nodes[endNodeId].label = endNode.label;
      }

      // Extract links from path is [node link node link node]
      for (let i = 1; i < path.length; i += 2) {
        const sourceNodeId = path[i - 1];
        const targetNodeId = path[i + 1];

        const linkId = `${pathId}-${i}`;
        const pathInfo = {
          questionAnswerPathId,
          score,
        };
        // Add path info to link
        links[linkId] = {
          source: sourceNodeId,
          target: targetNodeId,
          sourceId: sourceNodeId,
          targetId: targetNodeId,
          id: linkId,
          pathId,
          label: path[i],
          ...pathInfo,
        };

        const sourceNode = nodes[sourceNodeId];
        const targetNode = nodes[targetNodeId];

        // Increment node edge counts
        sourceNode.outgoingEdges += 1;
        targetNode.incomingEdges += 1;

        // Add path info to node
        sourceNode.paths.push({
          id: pathId,
          ...pathInfo,
        });
        targetNode.paths.push({
          id: pathId,
          ...pathInfo,
        });
      }
    });
  });

  // Sort paths of each node by score descending
  for (const node of Object.values(nodes)) {
    node.paths = node.paths.sort((path1, path2) => path2.score - path1.score);
  }

  return {nodes, links};
};

const HorizontalList = withStyles({
  root: {
    display: "flex",
    flexDirection: "row",
    padding: 0,
    whiteSpace: "nowrap",
  },
})(List);

// Initialize color scale
const colorScale = d3.interpolateRgb("red", "green");

// Scale radius of nodes by number of incoming edges
const nodeRadius = (node: BenchmarkAnswerChoiceAnalysisGraphNodeDatum) =>
  node.incomingEdges > 0 ? 8 * Math.log2(node.incomingEdges) + 10 : 10;

const MIN_QUESTION_ANSWER_PATH_SCORE = 0.001;

export const BenchmarkAnswerChoiceAnalysisGraph: React.FunctionComponent<{
  choiceAnalysis: AnswerChoiceAnalysis;
}> = ({choiceAnalysis}) => {
  const {nodes, links} = React.useMemo<{
    nodes: {[nodeId: string]: BenchmarkAnswerChoiceAnalysisGraphNodeDatum};
    links: {[linkId: string]: BenchmarkAnswerChoiceAnalysisGraphLinkDatum};
  }>(() => extractNodeAndLinks(choiceAnalysis), [choiceAnalysis]);

  return (
    <React.Fragment>
      <HorizontalList>
        <ListItem>Choice {choiceAnalysis.choiceLabel}</ListItem>
        <ListItem>
          <BenchmarkAnswerChoiceAnalysisGraphLegendCircle radius={30} />
          <ListItemText primary="More edges" />
        </ListItem>
        <ListItem>
          <BenchmarkAnswerChoiceAnalysisGraphLegendCircle radius={10} />
          <ListItemText primary="Less edges" />
        </ListItem>
        <ListItem>
          <BenchmarkAnswerChoiceAnalysisGraphLegendCircle
            color={colorScale(1)}
          />
          <ListItemText primary="High score" />
        </ListItem>
        <ListItem>
          <BenchmarkAnswerChoiceAnalysisGraphLegendCircle
            opacity={0.5}
            color={colorScale(0)}
          />
          <ListItemText primary="Low score" />
        </ListItem>
      </HorizontalList>
      <ForceGraph height={800} width={1200}>
        {Object.values(nodes)
          .sort((node1, node2) => node1.paths[0].score - node2.paths[0].score)
          .map((node) => {
            const score =
              node.paths.reduce(
                (totalScore, path) => totalScore + path.score,
                0
              ) / node.paths.length;

            return (
              <ForceGraphNode
                key={node.id}
                node={node}
                r={nodeRadius(node)}
                fill={colorScale(score)}
                opacity={score}
                cursor="pointer"
              >
                <title>{node.label}</title>
              </ForceGraphNode>
            );
          })}
        {Object.values(links)
          .sort((link1, link2) => link1.score - link2.score)
          .map((link) => (
            <ForceGraphArrowLink
              key={link.id}
              link={link}
              stroke={colorScale(link.score)}
              targetRadius={nodeRadius(nodes[link.targetId])}
              opacity={link.score * 0.6}
            />
          ))}
      </ForceGraph>
      {choiceAnalysis.questionAnswerPaths
        .filter(({score}) => score < MIN_QUESTION_ANSWER_PATH_SCORE)
        .sort((a, b) => b.score - a.score)
        .map((questionAnswerPath) => {
          const questionAnswerPathNodes = _.cloneDeep(
            Object.values(nodes)
              .filter((node) =>
                node.paths.some(
                  (path) =>
                    path.questionAnswerPathId ===
                    getQuestionAnswerPathId(questionAnswerPath)
                )
              )
              .sort(
                (node1, node2) => node1.paths[0].score - node2.paths[0].score
              )
          );
          const questionAnswerPathLinks = _.cloneDeep(
            Object.values(links)
              .filter(
                (link) =>
                  link.questionAnswerPathId ===
                  getQuestionAnswerPathId(questionAnswerPath)
              )
              .sort((link1, link2) => link1.score - link2.score)
          );
          return (
            <BenchmarkQuestionAnswerPathGraph
              key={getQuestionAnswerPathId(questionAnswerPath)}
              questionAnswerPath={questionAnswerPath}
              nodes={questionAnswerPathNodes}
              links={questionAnswerPathLinks}
              nodesIndexed={nodes}
            />
          );
        })}
    </React.Fragment>
  );
};
