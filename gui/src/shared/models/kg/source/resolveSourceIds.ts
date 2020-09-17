import {KgSource} from "shared/models/kg/source/KgSource";
import {resolveSourceId} from "shared/models/kg/source/resolveSourceId";

export const resolveSourceIds = (kwds: {
  allSources: readonly KgSource[];
  sourceIds: readonly string[];
}): readonly KgSource[] => {
  return kwds.sourceIds.map((sourceId) =>
    resolveSourceId({allSources: kwds.allSources, sourceId})
  );
};
