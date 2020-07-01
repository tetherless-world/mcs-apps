import {Page} from "../Page";
import {TestData} from "../../TestData";

class MUIDataTable {
  constructor(private readonly selector: string) {}

  get() {
    return cy.get(this.selector);
  }

  // None of these work, not sure why
  paginateBack() {
    this.get().find("tfoot button[data-testid=pagination-back]");
  }

  paginateNext() {
    cy.get(this.selector + " tfoot button[data-testid=paginate-next]");
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
    return this.get().find("[data-cy=title]");
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

  readonly datasourceLink = new KgNodeResultsNodeTableRowKgDatasourceLink(this);
}

class KgNodeResultsNodeTableRowKgDatasourceLink {
  constructor(private readonly row: KgNodeResultsTableRow) {}

  click() {
    this.row.get().find("[data-cy=datasource-link]").click();
  }
}

class KgNodeResultsNodeTableRowKgNodeLink {
  constructor(private readonly row: KgNodeResultsTableRow) {}

  click() {
    this.row.get().find("[data-cy=node-link]").click();
  }
}

export class KgNodeSearchResultsPage extends Page {
  constructor(private readonly search: string) {
    super();
  }

  readonly resultsTable = new KgNodeResultsTable();

  get relativeUrl() {
    return (
      `/kg/${TestData.kgId}/node/search?text=` + encodeURIComponent(this.search)
    );
  }
}
