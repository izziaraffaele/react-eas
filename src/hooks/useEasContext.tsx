import { useContext } from 'react';
//
import { EasContext } from '../EasProvider';

export function useEasContext() {
  const contextValue = useContext(EasContext);

  if (!contextValue) {
    throw new Error('Cannot use useEasContext outside of EasProvider.');
  }

  return contextValue;
}
