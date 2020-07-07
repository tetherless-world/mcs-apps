export interface KgNode {
  __typename: "KgNode";
  aliases: string[] | null;
  datasource: string;
  id: string;
  label: string | null;
  other: string | null;
  pos: string | null;
}
