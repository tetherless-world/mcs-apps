import {KgPathPage} from "../support/page_files/KgPathPage";
import {TestData} from "../support/TestData";
import {KgPath} from "../support/Path";

context("KgPathPage", () => {
  const page = new KgPathPage();
  let path: KgPath;

  before(() => {
    TestData.paths.then((paths) => {
      path = paths[0];
    });
  });

  beforeEach(() => {
    page.visit();

    page.clickPath(path.id);

    page.assertPathLoaded(path.id);
  });

  it("should show path table", () => {
    page.pathTable;
  });

  it("should show selected path id", () => {
    page.selectedPathId.should("have.text", path.id);
  });

  it("should show go back to all paths", () => {
    page.clickAllPaths();

    page.assertLoaded();
  });
});
