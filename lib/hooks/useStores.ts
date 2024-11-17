// hooks/useStores.ts

import useRootStore from "../stores/rootStore";

type Stores = {
  [K in keyof any]: any;
} & { rootStore: any };

export const useStores = (): Stores => {
  const rootStore = useRootStore();
  return {
    questionnaireStore: rootStore,
    modalStore: rootStore,
    rootStore,
  };
};
