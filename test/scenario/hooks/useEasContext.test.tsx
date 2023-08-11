import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
  waitFor,
  initEnvironment,
  renderHook,
  MAINNET_ADDRESS,
} from '../../test-environment';
// eas
import { EAS } from '@ethereum-attestation-service/eas-sdk';
//
import { useEasContext } from '../../../src';

initEnvironment();

describe('useEasContext()', () => {

  it('should return context value when called within EasProvider', () => {
    const contextValue = new EAS(MAINNET_ADDRESS);

    // Mock useContext to return contextValue
    jest.spyOn(React, 'useContext').mockImplementation(() => contextValue);

    const { result } = renderHook(() => useEasContext());

    expect(result.current).toEqual(contextValue);
  });

  it('should throw error when called outside of EasProvider', async () => {
    const fallbackRender = jest.fn<null, any, any>(() => null);

    // Mock the EasContext to return null
    jest.spyOn(React, 'useContext').mockImplementation(() => null);

    renderHook(() => useEasContext(), {
      wrapper: ({ children }) => (
        <ErrorBoundary fallbackRender={fallbackRender}>
          {children}
        </ErrorBoundary>
      )
    });

    await waitFor(() => expect(fallbackRender).toHaveBeenCalled());

    expect(
      fallbackRender.mock.calls[0][0].error
    ).toEqual(new Error('Cannot use useEasContext outside of EasProvider.'));
  });
});
