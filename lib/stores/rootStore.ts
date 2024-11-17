// stores/rootStore.ts

import { create } from "zustand";
import createModalSlice from "./modalSlice";
import createQuestionnaireSlice from "./questionnaireSlice";

const useRootStore = create<any>((set, get) => ({
  //@ts-ignore
  ...createQuestionnaireSlice(set, get),
  //@ts-ignore
  ...createModalSlice(set, get),
}));

export default useRootStore;
