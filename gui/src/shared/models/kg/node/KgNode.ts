export interface KgNode {
  __typename: "KgNode";
  aliases: string[] | null;
  id: string;
  label: string | null;
  sourceIds: string[];
  pos: string | null;
}
