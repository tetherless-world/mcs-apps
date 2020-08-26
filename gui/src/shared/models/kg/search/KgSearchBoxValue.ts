import {KgSearchBoxTextValue} from "shared/models/kg/search/KgSearchBoxTextValue";
import {KgSearchBoxNodeLabelValue} from "shared/models/kg/search/KgSearchBoxNodeLabelValue";
export type KgSearchBoxValue =
  | KgSearchBoxNodeLabelValue
  | KgSearchBoxTextValue
  | null;
