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

  it('should return the default EAS instance when no parameters are provided', async () => {
    const {
      result: {
        current: { eas },
      },
    } = renderTest();

    expect(eas).toBeInstanceOf(EAS);
    await expect(eas.contract.getAddress()).resolves.toBe(MAINNET_ADDRESS);
  });

  it('should return the passed EAS instance when an instance of EAS is provided', () => {
    inputs.eas = new EAS(MAINNET_ADDRESS);

    const {
      result: {
        current: { eas },
      },
    } = renderTest();

    expect(eas).toBe(inputs.eas);
  });

  it('should return a new EAS instance with the provided address string', async () => {
    inputs.address = SEPOLIA_ADDRESS;

    const {
      result: {
        current: { eas },
      },
    } = renderTest();

    expect(eas).toBeInstanceOf(EAS);
    await expect(eas.contract.getAddress()).resolves.toBe(inputs.address);
  });

  it('should respect the options parameter when constructing a new EAS instance', () => {
    inputs.options = {
      signerOrProvider: sender,
    };

    const {
      result: {
        current: { eas },
      },
    } = renderTest();

    expect(eas.contract.runner).toBe(inputs.options.signerOrProvider);
  });

  it('should not recreate the EAS instance unnecessarily due to memoization', () => {
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
});
