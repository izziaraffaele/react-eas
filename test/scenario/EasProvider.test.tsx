import React from 'react';
import { EAS } from '@ethereum-attestation-service/eas-sdk';
import {
  MAINNET_ADDRESS,
  SEPOLIA_ADDRESS,
  render,
} from '../test-environment';
import { EasProvider, EasContext, EasProviderProps } from '../../src/EasProvider';

const RENDER_NULL = () => null;

describe('EasProvider', () => {
  let easProps: EasProviderProps = {};
  let renderContent: (value: EAS | null) => React.ReactNode = RENDER_NULL;

  const renderTest = () =>
    render(
      <EasProvider {...easProps}>
        <EasContext.Consumer>{renderContent}</EasContext.Consumer>
      </EasProvider>
    );

  beforeEach(() => {
    easProps = {};
    renderContent = RENDER_NULL;
  });

  it('renders without crashing', () => {
    renderTest();
  });

  it('provides default EAS instance when no props are provided', () => {
    renderContent = (value) => (
      <span data-testid="context-child-value">
        {value ? 'Exists' : 'Not exists'}
      </span>
    );

    const { getByTestId } = renderTest();
    expect(getByTestId('context-child-value').textContent).toBe('Exists');
  });

  it('provides passed EAS instance when eas prop is provided', () => {
    easProps.eas = new EAS(MAINNET_ADDRESS);
    renderContent = (value) => (
      <span data-testid="context-child-value">
        {value ? 'Exists' : 'Not exists'}
      </span>
    );

    const { getByTestId } = renderTest();
    expect(getByTestId('context-child-value').textContent).toBe('Exists');
  });

  it('generates and provides a new EAS instance based on address prop', () => {
    easProps.address = SEPOLIA_ADDRESS;
    renderContent = (value) => (
      <span data-testid="context-child-value">
        {value ? 'Exists' : 'Not exists'}
      </span>
    );

    const { getByTestId } = renderTest();
    expect(getByTestId('context-child-value').textContent).toBe('Exists');
  });

  // Note: Checking if the component respects options prop might be trickier
  // unless the EAS instance exposes some properties/methods to verify it.

  it('children have access to provided EAS instance', () => {
    easProps.eas = new EAS(MAINNET_ADDRESS);
    renderContent = (value) => (
      <span data-testid="context-child-value">
        {value === easProps.eas ? 'Matched' : 'Not matched'}
      </span>
    );

    const { getByTestId } = renderTest();
    expect(getByTestId('context-child-value').textContent).toBe('Matched');
  });
});
