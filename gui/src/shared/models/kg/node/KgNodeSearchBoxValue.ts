import {KgNodeSearchBoxTextValue} from "shared/models/kg/node/KgNodeSearchBoxTextValue";
import {KgNodeSearchBoxNodeLabelValue} from "shared/models/kg/node/KgNodeSearchBoxNodeLabelValue";
export type KgNodeSearchBoxValue =
  | KgNodeSearchBoxNodeLabelValue
  | KgNodeSearchBoxTextValue
  | null;
