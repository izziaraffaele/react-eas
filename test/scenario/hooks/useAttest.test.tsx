import { Signer, toBigInt } from 'ethers';

import { renderHook, initEnvironment } from '../../test-environment';
import { useAttest, AttestationData } from '../../../src/hooks/useAttest'; // Adjusted path

const { sender, receiver: sender2 } = initEnvironment();

const mockOffchain = {
  signOffchainAttestation: jest.fn().mockResolvedValue('mockSignedAttestation'),
};

const easMock = {
  attest: jest.fn().mockResolvedValue({
    wait: () => 'mockAttestationUID',
  }),
  getAttestation: jest.fn().mockResolvedValue('mockAttestation'),
  getOffchain: () => Promise.resolve(mockOffchain),
};

const easContextMock = {
  eas: easMock,
  signer: sender as Signer | null,
};

jest.mock('../../../src/hooks/useEasContext', () => ({
  useEasContext: jest.fn(() => easContextMock),
}));

describe('useAttest()', () => {
  let signer: Signer | undefined;

  const renderTest = () => renderHook(() => useAttest(signer));

  beforeEach(() => {
    jest.clearAllMocks();
    signer = undefined;
    easContextMock.signer = sender;
  });

  it('provides onchain and offchain functions', () => {
    const { result } = renderTest();

    expect(result.current.onchain).toBeInstanceOf(Function);
    expect(result.current.offchain).toBeInstanceOf(Function);
  });

  describe('onchain', () => {
    it('works as expected', async () => {
      const { result } = renderTest();

      const attestationData: AttestationData['onchain'] = {
        recipient: '0xFD50b031E778fAb33DfD2Fc3Ca66a1EeF0652165',
        expirationTime: toBigInt(0),
        revocable: true, // Be aware that if your schema is not revocable, this MUST be false
        data: 'encodedData',
      };

      await expect(
        result.current.onchain('mockSchema', attestationData)
      ).resolves.toBe('mockAttestation');
      expect(easMock.attest).toHaveBeenCalledWith({
        schema: 'mockSchema',
        data: attestationData,
      });
      expect(easMock.getAttestation).toHaveBeenCalledWith('mockAttestationUID');
    });
  });

  describe('offchain', () => {
    const attestationData: AttestationData['offchain'] = {
      recipient: '0xFD50b031E778fAb33DfD2Fc3Ca66a1EeF0652165',
      expirationTime: toBigInt(0),
      time: toBigInt(1671219636),
      revocable: true,
      version: 1,
      nonce: toBigInt(0),
      refUID:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      data: 'encodedData',
    };

    it('throws error when no signer is provided', async () => {
      easContextMock.signer = null;
      const { result } = renderTest();

      await expect(
        result.current.offchain('mockSchema', attestationData)
      ).rejects.toThrow('Signing offchain attestations requires a signer.');
    });

    it('works as expected with default signer', async () => {
      const { result } = renderTest();

      await expect(
        result.current.offchain('mockSchema', attestationData)
      ).resolves.toBe('mockSignedAttestation');

      expect(mockOffchain.signOffchainAttestation).toHaveBeenCalledWith(
        {
          ...attestationData,
          schema: 'mockSchema',
        },
        easContextMock.signer
      );
    });

    it('works as expected with custom signer', async () => {
      signer = sender2;
      const { result } = renderTest();

      await expect(
        result.current.offchain('mockSchema', attestationData)
      ).resolves.toBe('mockSignedAttestation');

      expect(mockOffchain.signOffchainAttestation).toHaveBeenCalledWith(
        {
          ...attestationData,
          schema: 'mockSchema',
        },
        signer
      );
    });
  });

  // Note: Testing memoization might require further setups or adjustments based on the exact behavior of the `eas` context and `useEasContext` hook.
});
