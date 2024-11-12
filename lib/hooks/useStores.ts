// hooks/useStores.ts

import useRootStore from "../stores/rootStore";
import { RootState } from "../types";

type Stores = {
  [K in keyof RootState]: RootState;
} & { rootStore: RootState };

export const useStores = (): Stores => {
  const rootStore = useRootStore();
  return {
    chartStore: rootStore,
    questionnaireStore: rootStore,
    commitStore: rootStore,
    variableStore: rootStore,
    modalStore: rootStore,
    utilityStore: rootStore,
    rootStore,
  };
};
