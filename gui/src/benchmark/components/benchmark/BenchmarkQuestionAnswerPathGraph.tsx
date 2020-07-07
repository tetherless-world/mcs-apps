import * as React from "react";
import * as d3 from "d3";
import {BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById_answerByQuestionId_explanation_choiceAnalyses_questionAnswerPaths as QuestionAnswerPath} from "benchmark/api/queries/types/BenchmarkAnswerPageQuery";
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Grid,
  withStyles,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  makeStyles,
  Card,
  CardContent,
} from "@material-ui/core";
import {
  ForceGraph,
  ForceGraphNode,
  ForceGraphArrowLink,
} from "shared/components/data/forceGraph";
import {BenchmarkAnswerChoiceAnalysisGraphLinkDatum} from "benchmark/models/benchmark/BenchmarkAnswerChoiceAnalysisGraphLinkDatum";
import {BenchmarkAnswerChoiceAnalysisGraphNodeDatum} from "benchmark/models/benchmark/BenchmarkAnswerChoiceAnalysisGraphNodeDatum";
import {getAnswerPathId} from "benchmark/util/benchmark/getAnswerPathId";
import {BenchmarkAnswerChoiceAnalysisGraphLegendCircle} from "benchmark/components/benchmark/BenchmarkAnswerChoiceAnalysisGraphLegendCircle";

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

export const BenchmarkQuestionAnswerPathGraph: React.FunctionComponent<{
  questionAnswerPath: QuestionAnswerPath;
  nodes: BenchmarkAnswerChoiceAnalysisGraphNodeDatum[];
  nodesIndexed: {[nodeId: string]: BenchmarkAnswerChoiceAnalysisGraphNodeDatum};
  links: BenchmarkAnswerChoiceAnalysisGraphLinkDatum[];
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
    <Card>
      <CardContent>
        <HorizontalList>
          <ListItem>
            <ListItemText primary={"Score: " + score.toFixed(3)} />
          </ListItem>
          <ListItem>
            <ListItemText primary={paths.length + " paths"} />
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <BenchmarkAnswerChoiceAnalysisGraphLegendCircle
                color="none"
                border="2px solid blue"
              />
            </ListItemAvatar>
            <ListItemText
              primary={"Start node: " + (startNode?.label ?? startNodeId)}
            />
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <BenchmarkAnswerChoiceAnalysisGraphLegendCircle
                color="none"
                border="2px solid purple"
              />
            </ListItemAvatar>
            <ListItemText
              primary={"End node: " + (endNode?.label ?? endNodeId)}
            />
          </ListItem>
        </HorizontalList>
        <Grid container spacing={2}>
          <Grid item md={6}>
            <ForceGraph height={500} width={500}>
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

                const focused = node.paths.some(
                  (path) => path.id === highestScorePathId
                );

                return (
                  <ForceGraphNode
                    key={node.id}
                    node={node}
                    r={nodeRadius(node)}
                    fill={colorScale(score)}
                    fillOpacity={score}
                    cursor="pointer"
                    stroke={stroke}
                    strokeWidth={4}
                    showLabel={focused}
                  >
                    <title>{node.label}</title>
                  </ForceGraphNode>
                );
              })}
              {links.map((link) => {
                const focused = highestScorePathId === link.pathId;

                return (
                  <ForceGraphArrowLink
                    key={link.id}
                    link={link}
                    stroke={colorScale(link.score)}
                    targetRadius={nodeRadius(nodesIndexed[link.targetId])}
                    opacity={focused ? 1 : link.score}
                    showLabel={focused}
                  />
                );
              })}
            </ForceGraph>
          </Grid>
          <Grid item md={6}>
            <QuestionAnswerPathTable questionAnswerPath={questionAnswerPath} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const useStylesQuestionAnswerPathTable = makeStyles({
  selectedRow: {
    backgroundColor: "lightgrey !important",
  },
  tableRow: {
    "&:hover": {
      backgroundColor: "lightgrey !important",
    },
  },
});

const QuestionAnswerPathTable: React.FunctionComponent<{
  questionAnswerPath: QuestionAnswerPath;
}> = ({questionAnswerPath: {paths}}) => {
  const classes = useStylesQuestionAnswerPathTable();

  return (
    <TableContainer component={Paper}>
      <Table data-cy="matchingNodesTable">
        <TableHead>
          <TableRow>
            <TableCell>Score</TableCell>
            <TableCell>Number of nodes</TableCell>
            <TableCell>Path</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paths.map(({score, path}, index) => (
            <TableRow
              key={index}
              classes={{selected: classes.selectedRow}}
              selected={index === 0}
            >
              <TableCell>{score}</TableCell>
              <TableCell>{Math.ceil(path.length / 2)}</TableCell>
              <TableCell>{path.join("\t")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
