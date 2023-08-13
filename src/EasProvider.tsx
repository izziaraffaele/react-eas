'use client';

import { createContext } from 'react';
// eas
import { EAS, EASOptions } from '@ethereum-attestation-service/eas-sdk';
// hooks
import { useEasController } from './hooks/useEasController';

export type EasContextValue = ReturnType<typeof useEasController>;

export type EasProviderProps = {
  eas?: EAS;
  address?: string;
  options?: EASOptions;
};

export const EasContext = createContext<EasContextValue | null>(null);

export function EasProvider({
  eas,
  address,
  options,
  children,
}: React.PropsWithChildren<EasProviderProps>) {
  const contextValue = useEasController(eas || address, options);

  return (
    <EasContext.Provider value={contextValue}>{children}</EasContext.Provider>
  );
}
