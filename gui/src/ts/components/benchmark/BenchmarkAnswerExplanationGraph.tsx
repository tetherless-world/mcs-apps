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
import {BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById_answerByQuestionId_explanation as AnswerExplanation} from "api/queries/benchmark/types/BenchmarkAnswerPageQuery";

interface AnswerExplanationGraphNodeDatum extends ForceGraphNodeDatum {
  paths: {
    choiceAnalysisId: string;
    questionAnswerPathId: string;
    id: string;
    score: number;
  }[];
  incomingEdges: number;
  outgoingEdges: number;
}

interface AnswerExplanationGraphLinkDatum
  extends ForceGraphLinkDatum<AnswerExplanationGraphNodeDatum> {
  pathId: string;
  questionAnswerPathId: string;
  choiceAnalysisId: string;
  score: number;
}

const answerExplanationGraphSimulation = d3
  .forceSimulation<
    AnswerExplanationGraphNodeDatum,
    AnswerExplanationGraphLinkDatum
  >()
  .force(
    "link",
    d3
      .forceLink<
        AnswerExplanationGraphNodeDatum,
        AnswerExplanationGraphLinkDatum
      >()
      .id((node) => node.id)
    // .distance(100)
    // .strength(1)
  )
  // .force("center", d3.forceCenter())
  // .force("charge", d3.forceManyBody().strength(-300))
  // .force("x", d3.forceX())
  // .force("y", d3.forceY())
  .force("collide", d3.forceCollide(50));

const extractNodeAndLinks = (explanation: AnswerExplanation) => {
  const choiceAnalyses = explanation.choiceAnalyses;

  const nodes: {[nodeId: string]: AnswerExplanationGraphNodeDatum} = {};
  const links: {[linkId: string]: AnswerExplanationGraphLinkDatum} = {};

  choiceAnalyses
    // ?.slice(0, 1)
    ?.forEach(({questionAnswerPaths, choiceLabel}) => {
      const choiceAnalysisId = choiceLabel;

      questionAnswerPaths.forEach(({paths, endNodeId, startNodeId}) => {
        const questionAnswerPathId = `${choiceAnalysisId}-${startNodeId}-${endNodeId}`;

        paths.forEach(({path, score}, index) => {
          const pathId = `${questionAnswerPathId}-${index}`;

          // Extract nodes from path [node link node link node]
          for (let i = 0; i < path.length; i += 2) {
            const nodeId = path[i];
            if (!nodes[nodeId]) {
              nodes[nodeId] = {
                id: nodeId,
                label: nodeId,
                incomingEdges: 0,
                outgoingEdges: 0,
                paths: [],
              };
            }
          }

          // Extract links from path [node link node link node]
          for (let i = 1; i < path.length; i += 2) {
            const sourceNodeId = path[i - 1];
            const targetNodeId = path[i + 1];

            const linkId = `${pathId}-${i}`;
            const pathInfo = {
              questionAnswerPathId,
              choiceAnalysisId,
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
            if (!sourceNode.paths.some((path) => path.id === pathId)) {
              sourceNode.paths.push({
                id: pathId,
                ...pathInfo,
              });
            }
            if (!targetNode.paths.some((path) => path.id === pathId)) {
              targetNode.paths.push({
                id: pathId,
                ...pathInfo,
              });
            }
          }
        });
      });
    });

  // Sort paths of each node by score
  for (const node of Object.values(nodes)) {
    node.paths = node.paths.sort((path1, path2) => path1.score - path2.score);
  }

  return {nodes, links};
};

const answerExplanationGraphStyles = makeStyles({
  graphLegendContainer: {
    display: "flex",
    flexDirection: "row",
    padding: 0,
    whiteSpace: "nowrap",
  },
});

const AnswerExplanationGraphLegendNode: React.FunctionComponent<{
  radius?: number;
  color?: string;
  opacity?: number;
}> = ({radius: propRadius, color: propColor, opacity: propOpacity}) => {
  const radius = propRadius || 20;
  const backgroundColor = propColor || "#999";
  const opacity = propOpacity || 1;
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

export const BenchmarkAnswerExplanationGraph: React.FunctionComponent<{
  explanation: AnswerExplanation;
}> = ({explanation}) => {
  const classes = answerExplanationGraphStyles();

  const choiceAnalyses = explanation.choiceAnalyses;

  const {nodes, links} = React.useMemo<{
    nodes: {[nodeId: string]: AnswerExplanationGraphNodeDatum};
    links: {[linkId: string]: AnswerExplanationGraphLinkDatum};
  }>(() => extractNodeAndLinks(explanation), [explanation]);

  // Initialize color scale
  const pathColorScale = d3.scaleOrdinal(d3.schemeCategory10);

  // Scale radius of nodes by number of incoming edges
  const nodeRadius = (node: AnswerExplanationGraphNodeDatum) =>
    node.incomingEdges > 0 ? 10 * Math.log2(node.incomingEdges) + 10 : 10;

  return (
    <React.Fragment>
      <List className={classes.graphLegendContainer}>
        {choiceAnalyses?.map(({choiceLabel}) => (
          <ListItem key={choiceLabel}>
            <AnswerExplanationGraphLegendNode
              color={pathColorScale(choiceLabel)}
            />
            <ListItemText primary={choiceLabel} />
          </ListItem>
        ))}
        <ListItem>
          <AnswerExplanationGraphLegendNode radius={25} />
          <ListItemText primary="More edges" />
        </ListItem>
        <ListItem>
          <AnswerExplanationGraphLegendNode radius={15} />
          <ListItemText primary="Less edges" />
        </ListItem>
        <ListItem>
          <AnswerExplanationGraphLegendNode />
          <ListItemText primary="High score" />
        </ListItem>
        <ListItem>
          <AnswerExplanationGraphLegendNode opacity={0.5} />
          <ListItemText primary="Low score" />
        </ListItem>
      </List>
      <ForceGraph
        height={800}
        width={1200}
        simulation={answerExplanationGraphSimulation}
      >
        {Object.values(nodes).map((node) => {
          const path = node.paths[0];
          const score = path.score;
          // Color by choice analysis (aka choiceLabel)
          const fill =
            node.paths.length > 1
              ? "#999"
              : pathColorScale(path.choiceAnalysisId);
          // Opacity based on score

          return (
            <ForceGraphNode
              key={node.id}
              node={node}
              r={nodeRadius(node)}
              fill={fill}
              fillOpacity={score}
            >
              <title>{node.id}</title>
            </ForceGraphNode>
          );
        })}
        {Object.values(links).map((link) => (
          <ForceGraphArrowLink
            key={link.id}
            link={link}
            targetRadius={nodeRadius(nodes[link.targetId])}
            strokeOpacity={link.score * 0.6}
          />
        ))}
      </ForceGraph>
    </React.Fragment>
  );
};
