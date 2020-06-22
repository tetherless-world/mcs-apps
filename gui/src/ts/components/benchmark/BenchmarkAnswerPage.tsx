import * as React from "react";
import {useParams} from "react-router-dom";
import * as BenchmarkAnswerPageQueryDocument from "api/queries/benchmark/BenchmarkAnswerPageQuery.graphql";
import {
  BenchmarkAnswerPageQuery,
  BenchmarkAnswerPageQueryVariables,
  BenchmarkAnswerPageQuery_benchmarkById_datasetById_questionById_choices as QuestionAnswerChoice,
  BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById_answerByQuestionId_explanation as AnswerExplanation,
} from "api/queries/benchmark/types/BenchmarkAnswerPageQuery";
import {useQuery} from "@apollo/react-hooks";
import * as _ from "lodash";
import {Grid, Typography, Card, CardContent} from "@material-ui/core";
import {NotFound} from "components/error/NotFound";
import {Frame} from "components/frame/Frame";
import {BenchmarkFrame} from "components/benchmark/BenchmarkFrame";
import {
  ForceGraph,
  ForceGraphNode,
  ForceGraphArrowLink,
} from "components/data/forceGraph";
import {ForceGraphLinkDatum, ForceGraphNodeDatum} from "models/data/forceGraph";
import * as d3 from "d3";

//localhost:9001/benchmark/benchmark0/dataset/benchmark0-test/submission/benchmark0-submission/question/benchmark0-test-0

const QuestionAnswerChoiceCard: React.FunctionComponent<{
  choice: QuestionAnswerChoice;
  dataCy: string;
}> = ({choice, children, dataCy}) => (
  <Card data-cy={dataCy}>
    <CardContent>
      <Grid container>
        <Grid item xs={2}>
          <Typography variant="h6" data-cy="label">
            {choice.label}
          </Typography>
        </Grid>
        <Grid item xs={10}>
          <Typography variant="body1" data-cy="text">
            {choice.text}
          </Typography>
        </Grid>
      </Grid>
      {children}
    </CardContent>
  </Card>
);

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
  .force("charge", d3.forceManyBody().strength(-300))
  .force("x", d3.forceX())
  .force("y", d3.forceY())
  .force("collide", d3.forceCollide(50));

const AnswerExplanationGraph: React.FunctionComponent<{
  explanation: AnswerExplanation;
}> = ({explanation}) => {
  const choiceAnalyses = explanation.choiceAnalyses;

  // const [links, setLinks] = React.useState<AnswerExplanationGraphLinkDatum[]>([]);
  // const [nodes, setNodes] = React.useState<AnswerExplanationGraphNodeDatum[]>([]);

  const {nodes, links} = React.useMemo<{
    nodes: {[nodeId: string]: AnswerExplanationGraphNodeDatum};
    links: {[linkId: string]: AnswerExplanationGraphLinkDatum};
  }>(() => {
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

            for (let i = 0; i < path.length; i += 2) {
              if (!nodes[path[i]]) {
                nodes[path[i]] = {
                  id: path[i],
                  paths: [],
                  incomingEdges: 0,
                  outgoingEdges: 0,
                };
              }
            }

            for (let i = 1; i < path.length; i += 2) {
              const linkId = `${pathId}-${i}`;
              links[linkId] = {
                source: path[i - 1],
                target: path[i + 1],
                sourceId: path[i - 1],
                targetId: path[i + 1],
                id: linkId,
                pathId,
                questionAnswerPathId,
                choiceAnalysisId,
                score,
              };
              const sourceNode = nodes[path[i - 1]];
              sourceNode.outgoingEdges += 1;
              if (!sourceNode.paths.some((path) => path.id === pathId)) {
                sourceNode.paths.push({
                  id: pathId,
                  questionAnswerPathId,
                  choiceAnalysisId,
                  score,
                });
              }
              const targetNode = nodes[path[i + 1]];
              nodes[path[i + 1]].incomingEdges += 1;
              if (!targetNode.paths.some((path) => path.id === pathId)) {
                targetNode.paths.push({
                  id: pathId,
                  questionAnswerPathId,
                  choiceAnalysisId,
                  score,
                });
              }
            }
          });
        });
      });

    for (const node of Object.values(nodes)) {
      node.paths = node.paths.sort((path1, path2) => path1.score - path2.score);
    }

    return {nodes, links};
  }, [explanation]);

  // Initialize color scale
  const pathColorScale = d3.scaleOrdinal(d3.schemeCategory10);

  const nodeRadius = (node: AnswerExplanationGraphNodeDatum) =>
    node.incomingEdges > 0 ? Math.log2(node.incomingEdges * 10) + 10 : 10;

  return (
    <ForceGraph
      height={800}
      width={1200}
      simulation={answerExplanationGraphSimulation}
    >
      {Object.values(nodes).map((node) => {
        const path = node.paths[0];
        const score = path.score;
        const fill = pathColorScale(path.choiceAnalysisId);

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
  );
};

interface BenchmarkAnswerRouteParams {
  benchmarkId: string;
  datasetId: string;
  submissionId: string;
  questionId: string;
}

export const BenchmarkAnswerPage: React.FunctionComponent = () => {
  const routeParams = _.mapValues(
    useParams<BenchmarkAnswerRouteParams>(),
    decodeURIComponent
  );

  const query = useQuery<
    BenchmarkAnswerPageQuery,
    BenchmarkAnswerPageQueryVariables
  >(BenchmarkAnswerPageQueryDocument, {
    variables: routeParams,
  });

  return (
    <Frame {...query}>
      {({data}) => {
        const benchmark = data.benchmarkById;
        const dataset = benchmark?.datasetById;
        const question = dataset?.questionById;
        const submission = dataset?.submissionById;
        const answer = submission?.answerByQuestionId;

        const {benchmarkId, datasetId, submissionId, questionId} = routeParams;

        if (!benchmark) {
          return <NotFound label={benchmarkId} />;
        }

        if (!dataset) {
          return <NotFound label={datasetId} />;
        }

        if (!question) {
          return <NotFound label={questionId} />;
        }

        if (!submission) {
          return <NotFound label={submissionId} />;
        }

        return (
          <BenchmarkFrame
            {...{
              benchmark: {id: benchmarkId, name: benchmark.name},
              dataset: {id: datasetId, name: dataset.name},
              question: {id: questionId},
              submission: {id: submissionId, name: submission.name},
            }}
          >
            {/* Show question and answer choices*/}
            <Grid container direction="column">
              <Grid item container>
                <Grid item md={6} container direction="column" justify="center">
                  <Grid item>
                    <Typography variant="h4" data-cy="questionText">
                      {question.text}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item md={6} container direction="column" spacing={3}>
                  {question.choices.map((choice) => (
                    <Grid item key={choice.label}>
                      <QuestionAnswerChoiceCard
                        choice={choice}
                        dataCy="questionAnswer"
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Extra spacing hack */}
              <Grid item>
                <br />
                <br />
              </Grid>

              {answer && (
                <React.Fragment>
                  {/* Show submission answer */}
                  <Grid item container spacing={2}>
                    <Grid
                      item
                      md={6}
                      container
                      direction="column"
                      justify="center"
                      alignItems="flex-end"
                    >
                      <Grid item>
                        <Typography variant="h5">
                          Submission{" "}
                          <span data-cy="submissionId">{submissionId}</span>{" "}
                          answered
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid item md={6} spacing={3}>
                      <QuestionAnswerChoiceCard
                        choice={
                          question.choices.find(
                            (choice) => choice.label === answer.choiceLabel
                          )!
                        }
                        dataCy="submissionAnswer"
                      ></QuestionAnswerChoiceCard>
                    </Grid>
                  </Grid>

                  {/* Show submission explanation */}
                  {answer.explanation && (
                    <Grid item>
                      <Typography variant="body1">Explanation</Typography>
                      <AnswerExplanationGraph
                        explanation={answer.explanation}
                      />
                    </Grid>
                  )}
                </React.Fragment>
              )}
            </Grid>
          </BenchmarkFrame>
        );
      }}
    </Frame>
  );
};
