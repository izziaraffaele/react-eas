"use client";

import { createContext } from 'react';
// eas
import { EAS, EASOptions } from '@ethereum-attestation-service/eas-sdk';
// hooks
import { useEasController } from './hooks/useEasController';

export const EasContext = createContext<EAS | null>(null);

export type EasProviderProps = {
  eas?: EAS,
  address?: string,
  options?: EASOptions
};

export function EasProvider({
  eas,
  address,
  options,
  children,
}: React.PropsWithChildren<EasProviderProps>) {
  const contextValue = useEasController(eas || address, options);

  return (
    <EasContext.Provider value={contextValue}>
      {children}
    </EasContext.Provider>
  );
}
