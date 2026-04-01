import { useState, useCallback } from "react";
import type { Placement } from "./solver";

interface History {
  past: Placement[][];
  present: Placement[];
  future: Placement[][];
}

export function useHistory(initial: Placement[] = []) {
  const [state, setState] = useState<History>({
    past: [],
    present: initial,
    future: [],
  });

  const commit = useCallback((next: Placement[] | ((prev: Placement[]) => Placement[])) => {
    setState((s) => {
      const nextVal = typeof next === "function" ? next(s.present) : next;
      return { past: [...s.past, s.present], present: nextVal, future: [] };
    });
  }, []);

  const undo = useCallback(() => {
    setState((s) => {
      if (s.past.length === 0) return s;
      const prev = s.past[s.past.length - 1];
      return {
        past: s.past.slice(0, -1),
        present: prev,
        future: [s.present, ...s.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((s) => {
      if (s.future.length === 0) return s;
      const next = s.future[0];
      return {
        past: [...s.past, s.present],
        present: next,
        future: s.future.slice(1),
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState({ past: [], present: [], future: [] });
  }, []);

  return {
    placements: state.present,
    commit,
    undo,
    redo,
    reset,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
