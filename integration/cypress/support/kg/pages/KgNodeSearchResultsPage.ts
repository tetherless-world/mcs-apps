import {Page} from "../../Page";
import {KgTestData} from "../KgTestData";

class StringFacetForm {
  constructor(private readonly selector: string) {}

  disclose() {
    return cy.get(this.selector).click();
  }

  valueCheckbox(valueId: string) {
    return cy.get(`[data-cy="facet-value-${valueId}"]`);
  }
}

class KgNodeFacets {
  readonly sources = new StringFacetForm("[data-cy=sources-facet]");
}

class MUIDataTable {
  constructor(private readonly selector: string) {}

  get() {
    return cy.get(this.selector);
  }

  paginateBack() {
    this.get().find("tfoot [data-testid=pagination-back]").click();
  }

  paginateNext() {
    this.get().find("tfoot [data-testid=pagination-next]").click();
  }

  get rowsPerPage() {
    return this.get().find("tfoot [data-testid=pagination-rows]");
  }
}

class KgNodeResultsTable extends MUIDataTable {
  constructor() {
    super("[data-cy=matchingNodesTable]");
  }

  row(index: number): KgNodeResultsTableRow {
    return new KgNodeResultsTableRow(index, this);
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

class KgNodeResultsTableRow {
  constructor(
    private readonly index: number,
    private readonly table: KgNodeResultsTable
  ) {}

  get() {
    return this.table.get().find(`[data-cy=node-${this.index}]`);
  }

  readonly nodeLink = new KgNodeResultsNodeTableRowKgNodeLink(this);

  readonly sourceLink = new KgNodeResultsNodeTableRowKgDatasourceLink(this);
}

class KgNodeResultsNodeTableRowKgDatasourceLink {
  constructor(private readonly row: KgNodeResultsTableRow) {}

  click() {
    this.row.get().find("[data-cy=source-link]").first().click();
  }
}

class KgNodeResultsNodeTableRowKgNodeLink {
  constructor(private readonly row: KgNodeResultsTableRow) {}

  get() {
    return this.row.get().find("[data-cy=node-link]");
  }

  click() {
    this.get().click();
  }
}

export class KgNodeSearchResultsPage extends Page {
  constructor(private readonly search: string) {
    super();
  }

  readonly facets = new KgNodeFacets();
  readonly resultsTable = new KgNodeResultsTable();

  get relativeUrl() {
    return (
      `/kg/${KgTestData.kgId}/node/search?query=` +
      encodeURIComponent(JSON.stringify({text: this.search}))
    );
  }
}
