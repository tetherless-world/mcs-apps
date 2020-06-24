import * as React from "react";
import * as _ from "lodash";
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Grid,
  withStyles,
} from "@material-ui/core";
import {
  ForceGraph,
  ForceGraphNode,
  ForceGraphArrowLink,
} from "components/data/forceGraph";
import {ForceGraphLinkDatum, ForceGraphNodeDatum} from "models/data/forceGraph";
import * as d3 from "d3";
import {
  BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById_answerByQuestionId_explanation_choiceAnalyses as AnswerChoiceAnalysis,
  BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById_answerByQuestionId_explanation_choiceAnalyses_questionAnswerPaths as QuestionAnswerPath,
} from "api/queries/benchmark/types/BenchmarkAnswerPageQuery";

interface AnswerChoiceAnalysisGraphNodeDatum extends ForceGraphNodeDatum {
  paths: {
    questionAnswerPathId: string;
    id: string;
    score: number;
  }[];
  incomingEdges: number;
  outgoingEdges: number;
}

interface AnswerChoiceAnalysisGraphLinkDatum
  extends ForceGraphLinkDatum<AnswerChoiceAnalysisGraphNodeDatum> {
  pathId: string;
  questionAnswerPathId: string;
  score: number;
}

const getQuestionAnswerPathId = ({
  startNodeId,
  endNodeId,
}: QuestionAnswerPath) => `${startNodeId}-${endNodeId}`;

const getAnswerPathId = (
  questionAnswerPathId: QuestionAnswerPath,
  answerPathIndex: number
) => `${getQuestionAnswerPathId(questionAnswerPathId)}-${answerPathIndex}`;

const extractNodeAndLinks = (choiceAnalysis: AnswerChoiceAnalysis) => {
  const nodes: {[nodeId: string]: AnswerChoiceAnalysisGraphNodeDatum} = {};
  const links: {[linkId: string]: AnswerChoiceAnalysisGraphLinkDatum} = {};

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

const AnswerChoiceAnalysisGraphLegendNode: React.FunctionComponent<{
  radius?: number;
  color?: string;
  opacity?: number;
  borderRadius?: string;
  border?: string;
}> = ({
  radius: userDefinedRadius,
  color: userDefinedColor,
  opacity: userDefinedOpacity,
  borderRadius: userDefinedBorderRadius,
  border,
}) => {
  const radius = userDefinedRadius ?? 20;
  const backgroundColor = userDefinedColor ?? "#999";
  const opacity = userDefinedOpacity ?? 1;
  const borderRadius = userDefinedBorderRadius ?? "50%";
  return (
    <ListItemAvatar>
      <div
        style={{
          height: radius + "px",
          width: radius + "px",
          borderRadius,
          backgroundColor,
          display: "inline-block",
          opacity,
          border,
        }}
      />
    </ListItemAvatar>
  );
};

// Initialize color scale
const colorScale = d3.interpolateRgb("red", "green");

// Scale radius of nodes by number of incoming edges
const nodeRadius = (node: AnswerChoiceAnalysisGraphNodeDatum) =>
  node.incomingEdges > 0 ? 8 * Math.log2(node.incomingEdges) + 10 : 10;

export const BenchmarkAnswerChoiceAnalysisGraph: React.FunctionComponent<{
  choiceAnalysis: AnswerChoiceAnalysis;
}> = ({choiceAnalysis}) => {
  const {nodes, links} = React.useMemo<{
    nodes: {[nodeId: string]: AnswerChoiceAnalysisGraphNodeDatum};
    links: {[linkId: string]: AnswerChoiceAnalysisGraphLinkDatum};
  }>(() => extractNodeAndLinks(choiceAnalysis), [choiceAnalysis]);

  return (
    <React.Fragment>
      <HorizontalList>
        <ListItem>Choice {choiceAnalysis.choiceLabel}</ListItem>
        <ListItem>
          <AnswerChoiceAnalysisGraphLegendNode radius={30} />
          <ListItemText primary="More edges" />
        </ListItem>
        <ListItem>
          <AnswerChoiceAnalysisGraphLegendNode radius={10} />
          <ListItemText primary="Less edges" />
        </ListItem>
        <ListItem>
          <AnswerChoiceAnalysisGraphLegendNode color={colorScale(1)} />
          <ListItemText primary="High score" />
        </ListItem>
        <ListItem>
          <AnswerChoiceAnalysisGraphLegendNode
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
            <QuestionAnswerPathGraphs
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

const QuestionAnswerPathGraphs: React.FunctionComponent<{
  questionAnswerPath: QuestionAnswerPath;
  nodes: AnswerChoiceAnalysisGraphNodeDatum[];
  nodesIndexed: {[nodeId: string]: AnswerChoiceAnalysisGraphNodeDatum};
  links: AnswerChoiceAnalysisGraphLinkDatum[];
}> = ({questionAnswerPath, nodes, links, nodesIndexed}) => {
  const {
    startNode,
    startNodeId,
    endNode,
    endNodeId,
    score,
    paths,
  } = questionAnswerPath;

  const highestScorePath = paths.sort((p1, p2) => p2.score - p1.score)[0];
  const highestScorePathIndex = paths.findIndex(
    (path) => path === highestScorePath
  );

  const highestScorePathId = getAnswerPathId(
    questionAnswerPath,
    highestScorePathIndex
  );

  return (
    <div>
      <HorizontalList>
        <ListItem>
          <ListItemText primary={"Score: " + score.toFixed(3)} />
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <AnswerChoiceAnalysisGraphLegendNode
              color="none"
              border="2px solid blue"
            />
          </ListItemAvatar>
          <ListItemText
            primary={"Start: " + (startNode?.label ?? startNodeId)}
          />
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <AnswerChoiceAnalysisGraphLegendNode
              color="none"
              border="2px solid purple"
            />
          </ListItemAvatar>
          <ListItemText primary={"End: " + (endNode?.label ?? endNodeId)} />
        </ListItem>
      </HorizontalList>
      <Grid container>
        <Grid item md={4}>
          <ForceGraph height={400} width={400}>
            {nodes.map((node) => {
              const score =
                node.paths.reduce(
                  (totalScore, path) =>
                    totalScore + (path.questionAnswerPathId ? path.score : 0),
                  0
                ) / node.paths.length;
              let stroke = undefined;
              if (node.id === startNodeId) {
                stroke = "blue";
              } else if (node.id === endNodeId) {
                stroke = "purple";
              }

              return (
                <ForceGraphNode
                  key={node.id}
                  node={node}
                  r={nodeRadius(node)}
                  fill={colorScale(score)}
                  opacity={
                    node.paths.some((path) => path.id === highestScorePathId)
                      ? 1
                      : 0.2
                  }
                  cursor="pointer"
                  stroke={stroke}
                  strokeWidth={4}
                >
                  <title>{node.label}</title>
                </ForceGraphNode>
              );
            })}
            {links.map((link) => (
              <ForceGraphArrowLink
                key={link.id}
                link={link}
                stroke={colorScale(link.score)}
                targetRadius={nodeRadius(nodesIndexed[link.targetId])}
                opacity={highestScorePathId === link.pathId ? 1 : 0.2}
              />
            ))}
          </ForceGraph>
        </Grid>
        <Grid item md={8}>
          <code>{JSON.stringify(questionAnswerPath)}</code>
        </Grid>
      </Grid>
    </div>
  );
};
