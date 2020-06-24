import * as React from "react";

import {
  List,
  ListItem,
  makeStyles,
  ListItemAvatar,
  ListItemText,
} from "@material-ui/core";
import {
  ForceGraph,
  ForceGraphNode,
  ForceGraphArrowLink,
} from "components/data/forceGraph";
import {ForceGraphLinkDatum, ForceGraphNodeDatum} from "models/data/forceGraph";
import * as d3 from "d3";
import {BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById_answerByQuestionId_explanation_choiceAnalyses as AnswerChoiceAnalysis} from "api/queries/benchmark/types/BenchmarkAnswerPageQuery";

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

const extractNodeAndLinks = (choiceAnalysis: AnswerChoiceAnalysis) => {
  const nodes: {[nodeId: string]: AnswerChoiceAnalysisGraphNodeDatum} = {};
  const links: {[linkId: string]: AnswerChoiceAnalysisGraphLinkDatum} = {};

  choiceAnalysis.questionAnswerPaths.forEach(
    ({paths, endNodeId, startNodeId}) => {
      const questionAnswerPathId = `${startNodeId}-${endNodeId}`;

      paths.forEach(({path, score}, index) => {
        const pathId = `${questionAnswerPathId}-${index}`;

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
    }
  );

  // Sort paths of each node by score descending
  for (const node of Object.values(nodes)) {
    node.paths = node.paths.sort((path1, path2) => path2.score - path1.score);
  }

  return {nodes, links};
};

const answerChoiceAnalysisGraphStyles = makeStyles({
  graphLegendContainer: {
    display: "flex",
    flexDirection: "row",
    padding: 0,
    whiteSpace: "nowrap",
  },
});

const AnswerChoiceAnalysisGraphLegendNode: React.FunctionComponent<{
  radius?: number;
  color?: string;
  opacity?: number;
}> = ({
  radius: userDefinedRadius,
  color: userDefinedColor,
  opacity: userDefinedOpacity,
}) => {
  const radius = userDefinedRadius ?? 20;
  const backgroundColor = userDefinedColor ?? "#999";
  const opacity = userDefinedOpacity ?? 1;
  return (
    <ListItemAvatar>
      <div
        style={{
          height: radius + "px",
          width: radius + "px",
          borderRadius: "50%",
          backgroundColor,
          display: "inline-block",
          opacity,
        }}
      />
    </ListItemAvatar>
  );
};

export const BenchmarkAnswerChoiceAnalysisGraph: React.FunctionComponent<{
  choiceAnalysis: AnswerChoiceAnalysis;
}> = ({choiceAnalysis}) => {
  const classes = answerChoiceAnalysisGraphStyles();

  const {nodes, links} = React.useMemo<{
    nodes: {[nodeId: string]: AnswerChoiceAnalysisGraphNodeDatum};
    links: {[linkId: string]: AnswerChoiceAnalysisGraphLinkDatum};
  }>(() => extractNodeAndLinks(choiceAnalysis), [choiceAnalysis]);

  const simulation = React.useMemo(
    () =>
      d3
        .forceSimulation<
          AnswerChoiceAnalysisGraphNodeDatum,
          AnswerChoiceAnalysisGraphLinkDatum
        >()
        .force(
          "link",
          d3
            .forceLink<
              AnswerChoiceAnalysisGraphNodeDatum,
              AnswerChoiceAnalysisGraphLinkDatum
            >()
            .id((node) => node.id)
            .distance(100)
          // .strength(1)
        )
        // .force("center", d3.forceCenter())
        .force("charge", d3.forceManyBody().strength(-300))
        .force("x", d3.forceX())
        .force("y", d3.forceY()),
    // .force("collide", d3.forceCollide(50)),
    []
  );
  // Initialize color scale
  const colorScale = d3.interpolateRgb("red", "green");

  // Scale radius of nodes by number of incoming edges
  const nodeRadius = (node: AnswerChoiceAnalysisGraphNodeDatum) =>
    node.incomingEdges > 0 ? 8 * Math.log2(node.incomingEdges) + 10 : 10;

  return (
    <React.Fragment>
      <List className={classes.graphLegendContainer}>
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
      </List>
      <ForceGraph height={800} width={1200} simulation={simulation}>
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
                <title>{node.id}</title>
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
    </React.Fragment>
  );
};
