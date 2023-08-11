import { Signer } from 'ethers';

import { renderHook, initEnvironment } from '../../test-environment';
import { useAttest, AttestationData } from '../../../src/hooks/useAttest'; // Adjusted path

const { sender } = initEnvironment();

const mockOffchain = {
  signOffchainAttestation: jest.fn().mockResolvedValue(
    'mockSignedAttestation'
  ),
};

const easMock = {
  attest: jest.fn().mockResolvedValue({
    wait: () => 'mockAttestationUID',
  }),
  getAttestation: jest.fn().mockResolvedValue('mockAttestation'),
  getOffchain: () => Promise.resolve(mockOffchain)
};

jest.mock('../../../src/hooks/useEasContext', () => ({
  useEasContext: jest.fn(() => easMock)
}));

describe('useAttest()', () => {
  let signer: Signer | undefined = sender;

  const renderTest = () => renderHook(() => useAttest(signer));

  beforeEach(() => {
    jest.clearAllMocks();
    signer = sender;
  });

  it('provides onchain and offchain functions', () => {
    const { result } = renderTest();

    expect(result.current.onchain).toBeInstanceOf(Function);
    expect(result.current.offchain).toBeInstanceOf(Function);
  });

  describe('onchain', () => {
    it('works as expected', async () => {
      const { result } = renderTest();

      await expect(
        result.current.onchain('mockSchema', {} as AttestationData['onchain'])
      ).resolves.toBe('mockAttestation');
      expect(easMock.attest).toHaveBeenCalledWith({
        schema: 'mockSchema',
        data: {},
      });
      expect(easMock.getAttestation).toHaveBeenCalledWith('mockAttestationUID');
    });
  });

  describe('offchain', () => {
    it('offchain function throws error when no signer is provided', async () => {
      signer = undefined;
      const { result } = renderTest();

      await expect(
        result.current.offchain('mockSchema', {} as AttestationData['offchain'])
      ).rejects.toThrow('invalid signer');
    });

    it('offchain function works as expected with valid signer', async () => {
      const { result } = renderTest();

      await expect(
        result.current.offchain('mockSchema', {} as AttestationData['offchain'])
      ).resolves.toBe('mockSignedAttestation');

      expect(mockOffchain.signOffchainAttestation).toHaveBeenCalledWith(
        {
          ...{},
          schema: 'mockSchema',
        },
        signer
      );
    });
  });

  // Note: Testing memoization might require further setups or adjustments based on the exact behavior of the `eas` context and `useEasContext` hook.
});
