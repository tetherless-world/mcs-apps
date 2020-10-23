import {Hrefs as SharedHrefs} from "shared/Hrefs";

declare var KG_BASE_HREF: string;

export class KgHrefs extends SharedHrefs {
  constructor() {
    super(KG_BASE_HREF);
  }
}
