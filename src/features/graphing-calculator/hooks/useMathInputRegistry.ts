import { useCallback, useRef, useState } from 'react';

import type { MathInputHandle } from '../../../components/MathInput';

export const useMathInputRegistry = () => {
  const inputRefs = useRef<Record<string, MathInputHandle>>({});
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const registerInput = useCallback((id: string, handle: MathInputHandle | null) => {
    if (handle) {
      inputRefs.current[id] = handle;
    } else {
      delete inputRefs.current[id];
    }
  }, []);

  const focusInput = useCallback((id: string) => {
    inputRefs.current[id]?.focus();
    setFocusedId(id);
  }, []);

  const insertIntoInput = useCallback((id: string, latex: string) => {
    const inputHandle = inputRefs.current[id];
    if (!inputHandle) return false;

    inputHandle.insert(latex);
    inputHandle.focus();
    setFocusedId(id);
    return true;
  }, []);

  const unregisterInput = useCallback((id: string) => {
    delete inputRefs.current[id];
    setFocusedId((current) => (current === id ? null : current));
  }, []);

  return {
    focusedId,
    setFocusedId,
    registerInput,
    focusInput,
    insertIntoInput,
    unregisterInput,
  };
};
