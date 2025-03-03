import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AnalysisResponse } from '@/types'

interface UserState {
  user: any | null;
  setUser: (user: any) => void;
}

interface AnalysisState {
  analysis: any | null;
  setAnalysis: (analysis: any) => void;
  analyses: AnalysisResponse[];
  isLoading: boolean;
  error: string | null;
}

interface ComparisonState {
  comparisons: any[];
  addComparison: (comparison: any) => void;
  removeComparison: (id: string) => void;
  selectedAnalysisIds: string[];
  selectAnalysis: (id: string) => void;
  deselectAnalysis: (id: string) => void;
  clearSelection: () => void;
  compareSelected: () => void;
  isComparing: boolean;
  comparisonResult: {
    analyses: AnalysisResponse[];
    improvements: Array<string | { title: string; description: string }>;
  } | null;
  error: string | null;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: 'user-storage',
    }
  )
)

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set) => ({
      analysis: null,
      setAnalysis: (analysis) => set({ analysis }),
      analyses: [],
      isLoading: false,
      error: null,
    }),
    {
      name: 'analysis-storage',
    }
  )
)

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set) => ({
      comparisons: [],
      addComparison: (comparison) =>
        set((state) => ({
          comparisons: [...state.comparisons, comparison],
        })),
      removeComparison: (id) =>
        set((state) => ({
          comparisons: state.comparisons.filter((c) => c.id !== id),
        })),
      selectedAnalysisIds: [],
      selectAnalysis: (id) => 
        set((state) => ({
          selectedAnalysisIds: [...state.selectedAnalysisIds, id]
        })),
      deselectAnalysis: (id) =>
        set((state) => ({
          selectedAnalysisIds: state.selectedAnalysisIds.filter((analysisId) => analysisId !== id)
        })),
      clearSelection: () => set({ selectedAnalysisIds: [] }),
      compareSelected: () => set({ isComparing: true }),
      isComparing: false,
      comparisonResult: null,
      error: null,
    }),
    {
      name: 'comparison-storage',
    }
  )
) 