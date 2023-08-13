// eas
import { EAS, EASOptions } from '@ethereum-attestation-service/eas-sdk';
// utils
import {
  initEnvironment,
  renderHook,
  MAINNET_ADDRESS,
  SEPOLIA_ADDRESS,
} from '../../test-environment';
//
import { useEasController } from '../../../src';

const { sender } = initEnvironment();

describe('useEasController()', () => {
  let inputs: {
    eas?: EAS;
    address?: string;
    options?: EASOptions;
  } = {};

  const renderTest = () =>
    renderHook(() =>
      useEasController(inputs.eas || inputs.address, inputs.options)
    );

  beforeEach(() => {
    inputs = {};
  });

  it('initializes with the default contract address when no address is provided', async () => {
    const {
      result: {
        current: { eas },
      },
    } = renderTest();

    expect(eas).toBeInstanceOf(EAS);
    await expect(eas.contract.getAddress()).resolves.toBe(MAINNET_ADDRESS);
  });

  it('uses the provided EAS instance instead of creating a new one', () => {
    inputs.eas = new EAS(MAINNET_ADDRESS);
    const {
      result: {
        current: { eas },
      },
    } = renderTest();

    expect(eas).toBe(inputs.eas);
  });

  it('initializes with a given address', async () => {
    inputs.address = SEPOLIA_ADDRESS;
    const {
      result: {
        current: { eas },
      },
    } = renderTest();

    expect(eas).toBeInstanceOf(EAS);
    await expect(eas.contract.getAddress()).resolves.toBe(inputs.address);
  });

  it('does not re-compute EAS unless address or options change', () => {
    const {
      result: {
        current: { eas },
      },
      rerender,
    } = renderTest();

    const initialInstance = eas;

    rerender(); // Re-render the hook

    expect(eas).toBe(initialInstance);
  });

  it('detects and returns signer when options.signerOrProvider is a signer', () => {
    inputs.options = {
      signerOrProvider: sender,
    };
    const {
      result: {
        current: { signer },
      },
    } = renderTest();

    expect(signer).toBe(inputs.options.signerOrProvider);
  });

  it('returns null for signer when options.signerOrProvider is not a signer', () => {
    const {
      result: {
        current: { signer },
      },
    } = renderTest();

    expect(signer).toBeNull();
  });
});
