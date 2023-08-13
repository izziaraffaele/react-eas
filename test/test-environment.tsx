import { Wallet } from 'ethers';

export const MAINNET_ADDRESS = '0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587';
export const SEPOLIA_ADDRESS = '0xC2679fBD37d54388Ce493F1DB75320D236e1815e';

export function initEnvironment() {
  const sender = new Wallet(
    '0x0123456789012345678901234567890123456789012345678901234567890123'
  );

  const receiver = new Wallet(
    '0x6789012345678901230123456789012345678901234567890123456789012345'
  );

  return {
    sender,
    receiver,
  };
}

export function mockTx<T>(v: T) {
  return {
    wait: jest.fn(() => v),
  };
}

export * from '@testing-library/react';
