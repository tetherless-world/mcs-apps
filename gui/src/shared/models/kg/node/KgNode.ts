import {KgSource} from "shared/models/kg/source/KgSource";

export interface KgNode {
  __typename: "KgNode";
  aliases: string[] | null;
  id: string;
  label: string | null;
  sources: KgSource[];
  pos: string | null;
}
