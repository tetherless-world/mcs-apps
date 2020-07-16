export interface KgNode {
  __typename: "KgNode";
  aliases: string[] | null;
  sources: string[];
  id: string;
  label: string | null;
  other: string | null;
  pos: string | null;
}
