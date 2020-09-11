export class MuiDataTable {
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
