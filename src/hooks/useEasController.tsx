import { useMemo } from 'react';
// eas
import { EAS, EASOptions } from '@ethereum-attestation-service/eas-sdk';
import { Signer } from 'ethers';

// EAS mainnet contract
const DEFAULT_CONTRACT_ADDRESS = '0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587';

export function useEasController(
  address: string | EAS = DEFAULT_CONTRACT_ADDRESS,
  options: EASOptions = {}
) {
  const eas = useMemo(() => {
    if (address instanceof EAS) {
      return address;
    }

    return new EAS(address, options);
  }, [address, options]);

  const { contract } = eas;

  const signer = useMemo(() => {
    return isSigner(contract.runner) ? contract.runner : null;
  }, [contract]);

  return { eas, signer };
}

function isSigner(obj: unknown): obj is Signer {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'provider' in obj &&
    'signMessage' in obj &&
    'signTypedData' in obj
  );
}
