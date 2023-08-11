import { BaseWallet, Signer } from 'ethers';
import {
  AttestationRequestData,
  OffchainAttestationParams,
} from '@ethereum-attestation-service/eas-sdk';
import { useEasContext } from './useEasContext';
import { useMemo } from 'react';

export type AttestationData = {
  onchain: AttestationRequestData;
  offchain: Omit<OffchainAttestationParams, 'schema'>;
};

export function useAttest(signer?: Signer) {
  const eas = useEasContext();

  return useMemo(
    () => ({
      onchain: async (schema: string, data: AttestationData['onchain']) => {
        const tx = await eas.attest({
          schema,
          data,
        });
        const newAttestationUID = await tx.wait();
        return eas.getAttestation(newAttestationUID);
      },
      offchain: async (schema: string, data: AttestationData['offchain']) => {
        const offchain = await eas.getOffchain();

        if (!signer) {
          throw new Error('invalid signer');
        }

        return offchain.signOffchainAttestation(
          { ...data, schema },
          signer as unknown as BaseWallet
        );
      },
    }),
    [signer, eas]
  );
}
