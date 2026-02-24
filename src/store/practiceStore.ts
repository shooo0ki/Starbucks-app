import { create } from 'zustand';
import type { PracticeSession, PracticeOrder, QuizResult } from '@/types/practice';

type PracticeStore = {
  session: PracticeSession | null;
  orderedOrders: PracticeOrder[];
  currentOrderIndex: number;
  results: QuizResult[];
  sessionStartMs: number;

  setSession: (session: PracticeSession) => void;
  setOrderedOrders: (orders: PracticeOrder[]) => void;
  addResult: (result: QuizResult) => void;
  nextQuestion: () => void;
  reset: () => void;
};

export const usePracticeStore = create<PracticeStore>((set) => ({
  session: null,
  orderedOrders: [],
  currentOrderIndex: 0,
  results: [],
  sessionStartMs: 0,

  setSession: (session) =>
    set({
      session,
      orderedOrders: session.orders,
      currentOrderIndex: 0,
      results: [],
      sessionStartMs: Date.now(),
    }),

  setOrderedOrders: (orders) => set({ orderedOrders: orders }),

  addResult: (result) =>
    set((state) => ({ results: [...state.results, result] })),

  nextQuestion: () =>
    set((state) => ({ currentOrderIndex: state.currentOrderIndex + 1 })),

  reset: () =>
    set({
      session: null,
      orderedOrders: [],
      currentOrderIndex: 0,
      results: [],
      sessionStartMs: 0,
    }),
}));
