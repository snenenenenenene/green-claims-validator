// stores/rootStore.ts

import { create } from 'zustand';
import createChartSlice from './chartSlice';
import createQuestionnaireSlice from './questionnaireSlice';
import createCommitSlice from './commitSlice';
import createVariableSlice from './variableSlice';
import createModalSlice from './modalSlice';
import createUtilitySlice from './utilitySlice';
import { RootState } from '../types';

const useRootStore = create<RootState>((set, get) => ({
  ...createChartSlice(set, get),
  ...createQuestionnaireSlice(set, get),
  ...createCommitSlice(set, get),
  ...createVariableSlice(set, get),
  ...createModalSlice(set, get),
  ...createUtilitySlice(set, get),

  // Add any additional root-level state or methods here
}));

export default useRootStore;