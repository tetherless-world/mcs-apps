import {KgSource} from "shared/models/kg/source/KgSource";

export const resolveSourceId = (kwds: {
  allSources: readonly KgSource[];
  sourceId: string;
}): KgSource => {
  const {allSources, sourceId} = kwds;
  const source = allSources.find((source) => source.id === sourceId);
  if (source) {
    return source;
  }
  return {id: sourceId, label: sourceId};
};
