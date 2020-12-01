import * as React from "react";
import {KgFrame} from "kg/components/frame/KgFrame";

import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from "@material-ui/core";
import {kgId} from "shared/api/kgId";
import {useQuery} from "@apollo/react-hooks";
import * as KgCreditsPageQueryDocument from "kg/api/queries/KgCreditsPageQuery.graphql";
import {KgCreditsPageQuery} from "kg/api/queries/types/KgCreditsPageQuery";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  textCenter: {
    textAlign: "center",
  },
}));

export const KgCreditsPage: React.FunctionComponent = () => {
  const classes = useStyles();
  const query = useQuery<KgCreditsPageQuery>(KgCreditsPageQueryDocument, {
    variables: {kgId},
  });

  return (
    <KgFrame {...query}>
      {() => (
        <Grid container direction="column">
          <Grid item>
            <Card>
              <CardHeader className={classes.textCenter} title="Credits" />
              <CardContent>
                <Grid container direction="column" spacing={2}>
                  <Grid item>
                    <a href="https://homes.cs.washington.edu/~msap/atomic/">
                      <Typography variant="h6">
                        ATOMIC: An Atlas of Machine Commonsense for If-Then
                        Reasoning
                      </Typography>
                    </a>
                    <p>
                      License:{" "}
                      <a href="https://creativecommons.org/licenses/by/4.0/">
                        Creative Commons Attribution 4.0 International
                      </a>
                    </p>
                  </Grid>
                  <Grid item>
                    <a href="http://conceptnet.io/">
                      <Typography variant="h6">ConceptNet</Typography>
                    </a>
                    <p>
                      This work includes data from ConceptNet 5, which was
                      compiled by the Commonsense Computing Initiative.
                      ConceptNet 5 is freely available under the&nbsp;
                      <a href="https://creativecommons.org/licenses/by-sa/4.0/">
                        Creative Commons Attribution-ShareAlike license (CC BY
                        SA 4.0)
                      </a>
                      &nbsp; from https://conceptnet.io. The included data was
                      created by contributors to Commonsense Computing projects,
                      contributors to Wikimedia projects, Games with a Purpose,
                      Princeton University's WordNet, DBPedia, OpenCyc, and
                      Umbel.
                    </p>
                  </Grid>
                  <Grid item>
                    <a href="https://framenet.icsi.berkeley.edu/">
                      <Typography variant="h6">FrameNet</Typography>
                    </a>
                    <p>
                      FrameNet Data Release 1.7 by
                      http://framenet.icsi.berkeley.edu is licensed under
                      a&nbsp;
                      <a href="https://creativecommons.org/licenses/by/3.0/">
                        Creative Commons Attribution 3.0 Unported
                      </a>
                      License
                    </p>
                  </Grid>
                  <Grid item>
                    <a href="http://networkdata.ics.uci.edu/netdata/html/Roget.html">
                      <Typography variant="h6">
                        Roget's Thesaurus, 1879
                      </Typography>
                    </a>
                    <p>
                      Creative Commons License&nbsp;
                      <a href="http://creativecommons.org/licenses/by-nc-nd/2.5/">
                        BY-NC-ND 2.5
                      </a>
                    </p>
                  </Grid>
                  <Grid item>
                    <a href="https://visualgenome.org/">
                      <Typography variant="h6">Visual Genome</Typography>
                    </a>
                    <p>
                      Visual Genome by Ranjay Krishna is licensed under a
                      <a href="https://creativecommons.org/licenses/by/4.0/">
                        Creative Commons Attribution 4.0 International
                      </a>
                      &nbsp; License.
                    </p>
                  </Grid>
                  <Grid item>
                    <a href="https://www.wikidata.org/">
                      <Typography variant="h6">Wikidata</Typography>
                    </a>
                    <p>
                      All structured data from the main, property and lexeme
                      namespaces is available under the{" "}
                      <a href="https://creativecommons.org/publicdomain/zero/1.0/">
                        Creative Commons CC0 License
                      </a>
                      ; text in the other namespaces is available under the
                      <a href="https://creativecommons.org/licenses/by-sa/4.0/">
                        Creative Commons Attribution-ShareAlike License
                      </a>
                      .
                    </p>
                  </Grid>
                  <Grid item>
                    <a href="https://wordnet.princeton.edu/">
                      <Typography variant="h6">WordNet</Typography>
                    </a>
                    <p>
                      WordNet Release 3.0 This software and database is being
                      provided to you, the LICENSEE, by Princeton University
                      under the following license. By obtaining, using and/or
                      copying this software and database, you agree that you
                      have read, understood, and will comply with these terms
                      and conditions.: Permission to use, copy, modify and
                      distribute this software and database and its
                      documentation for any purpose and without fee or royalty
                      is hereby granted, provided that you agree to comply with
                      the following copyright notice and statements, including
                      the disclaimer, and that the same appear on ALL copies of
                      the software, database and documentation, including
                      modifications that you make for internal use or for
                      distribution. WordNet 3.0 Copyright 2006 by Princeton
                      University. All rights reserved. THIS SOFTWARE AND
                      DATABASE IS PROVIDED "AS IS" AND PRINCETON UNIVERSITY
                      MAKES NO REPRESENTATIONS OR WARRANTIES, EXPRESS OR
                      IMPLIED. BY WAY OF EXAMPLE, BUT NOT LIMITATION, PRINCETON
                      UNIVERSITY MAKES NO REPRESENTATIONS OR WARRANTIES OF
                      MERCHANT- ABILITY OR FITNESS FOR ANY PARTICULAR PURPOSE OR
                      THAT THE USE OF THE LICENSED SOFTWARE, DATABASE OR
                      DOCUMENTATION WILL NOT INFRINGE ANY THIRD PARTY PATENTS,
                      COPYRIGHTS, TRADEMARKS OR OTHER RIGHTS. The name of
                      Princeton University or Princeton may not be used in
                      advertising or publicity pertaining to distribution of the
                      software and/or database. Title to copyright in this
                      software, database and any associated documentation shall
                      at all times remain with Princeton University and LICENSEE
                      agrees to preserve same.
                    </p>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </KgFrame>
  );
};
