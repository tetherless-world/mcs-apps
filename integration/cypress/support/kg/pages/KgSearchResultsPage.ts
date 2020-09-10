import {Page} from "../../Page";
import {KgTestData} from "../KgTestData";
import {MuiDataTable} from "./MuiDataTable";

class StringFacetForm {
  constructor(private readonly selector: string) {}

  disclose() {
    return cy.get(this.selector).click();
  }

  valueCheckbox(valueId: string) {
    return cy.get(`[data-cy="facet-value-${valueId}"]`);
  }
}

class KgSearchFacets {
  readonly sources = new StringFacetForm("[data-cy=sources-facet]");
}

class KgSearchResultsTable extends MuiDataTable {
  constructor() {
    super("[data-cy=matchingNodesTable]");
  }

  row(index: number) {
    const table = this;
    return {
      get() {
        return table.get().find(`[data-cy=search-result-${index}]`);
      },
      get nodeLabelLink() {
        return this.get().find("[data-cy=node-label-link]").first();
      },
      get nodeLink() {
        return this.get().find("[data-cy=node-link]").first();
      },
      get sourceLink() {
        return this.get().find("[data-cy=source-link]");
      },
    };
  }

  get title() {
    const selector = "[data-cy=title]";
    const self = this;
    return {
      get() {
        return self.get().find(selector);
      },
      get count() {
        return this.get().find("[data-cy=count]");
      },
      get filters() {
        return this.get().find("[data-cy=filters]");
      },
      get queryText() {
        return this.get().find("[data-cy=query-text]");
      },
    };
  }

  get header() {
    const selector = "thead>tr";
    const self = this;

    return {
      get() {
        return self.get().find(selector);
      },
      column(label: string) {
        return this.get().contains("th", label);
      },
    };
  }
}

export class KgSearchResultsPage extends Page {
  constructor(private readonly search: string) {
    super();
  }

  readonly facets = new KgSearchFacets();
  readonly resultsTable = new KgSearchResultsTable();

  get relativeUrl() {
    return (
      `/kg/${KgTestData.kgId}/search?query=` +
      encodeURIComponent(JSON.stringify({text: this.search}))
    );
  }
}
