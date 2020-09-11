import {match} from "react-router-dom";

export class TabRoute {
  constructor(kwds: {
    content: React.ReactNode;
    dataCy: string;
    label: string;
    relPath: string;
    routeMatch: match<{}>;
  }) {
    this.content = kwds.content;
    this.dataCy = kwds.dataCy;
    this.label = kwds.label;
    this.relPath = kwds.relPath;
    this.routeMatch = kwds.routeMatch;
  }

  readonly content: React.ReactNode;
  readonly dataCy: string;
  readonly label: string;
  readonly relPath: string;
  private readonly routeMatch: match<{}>;

  get url() {
    return this.routeMatch.url + this.relPath;
  }

  get path() {
    return this.routeMatch.path + this.relPath;
  }
}
