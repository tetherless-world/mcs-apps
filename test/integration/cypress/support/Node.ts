export type Node = {
  readonly id: string;
  readonly label: string;
  readonly aliases: [string];
  readonly pos: string;
  readonly datasource: string;
  readonly other: {};
};
