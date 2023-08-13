# react-eas

A set of hooks to easily develop apps using the Ethereum Attestation Service (EAS) with React.

The [Ethereum Attestation Service (EAS)](https://attest.sh/) is a protocol designed to make attestations onchain/offchain. Attestations are a key component in verifying claims without revealing unnecessary information and can be used in a wide range of applications including, but not limited to, identity verification, reputation systems, and trust scores. This package aims to simplify the development process for dApps integrating with EAS.

For more details on Ethereum Attestation Service (EAS), visit the official [documentation](https://docs.attest.sh/).

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Setting up `EasProvider`](#setting-up-easprovider)
  - [Using the Hooks](#using-the-hooks)
    - [`useAttest`](#useattest)
    - [`useEasContext`](#useeascontext)
- [Contributing](#contributing)
- [License](#license)

## Features

- `useAttest`: A hook to create attestation on/off chain using the Ethereum Attestation Service.
- `useEasContext`: Access your EAS configured instance from every component in the component tree.
- `encodeAttestationData`: Utility to help you encode attestation data.

## Installation

```bash
npm install react-eas
```

or

```bash
yarn add react-eas
```

## Usage

### Setting up `EasProvider`

Wrap your main application or the portion where you intend to use the Ethereum Attestation Service with the `EasProvider`. This establishes an EAS SDK instance for you and connects it to the Ethereum mainnet contract.

```jsx
import { EasProvider } from 'react-eas';

function App() {
  return <EasProvider>{/* other components */}</EasProvider>;
}
```

To connect to a contract deployed on a different network:

```jsx
import { EasProvider } from 'react-eas';

const EASContractAddress = '0xC2679fBD37d54388Ce493F1DB75320D236e1815e'; // Sepolia v0.26

function App() {
  return (
    <EasProvider address={EASContractAddress}>
      {/* other components */}
    </EasProvider>
  );
}
```

Options for the EAS SDK can be passed to the provider. This is useful for automatically connecting the SDK to a signer or a provider. To allow your users to issue attestations a signer is required.

For instance, here's an example using ethers.js. For using wagmi and viem, learn how to create [ethers.js adapters](https://wagmi.sh/core/ethers-adapters#public-client--provider).

```jsx
import { useEffect } from 'react';
import { EasProvider } from 'react-eas';
import { EASOptions } from '@ethereum-attestation-service/eas-sdk';

function App() {
  const [easOptions, setEasOptions] = useState({
    // any default EAS option
  } as EASOptions);

  useEffect(() => {
    async function loadSignerOrProvider() {
      const provider = new ethers.BrowserProvider(window.ethereum);

      // loading a signer is required only if you want to enable
      // write operations like attestation issuance.
      const signer = await provider.getSigner();

      // extend the current EAS options to add the signer (or provider)
      setEasOptions((current) => ({
        ...current,
        signerOrProvider: signer
      }));
    }

    if (window.ethereum) {
      loadSignerOrProvider();
    }
  }, []);

  return (
    <EasProvider options={easOptions}>{/* other components */}</EasProvider>
  );
}
```

You can also pass your custom EAS instance to the provider, offering complete flexibility.

```jsx
import { EasProvider } from 'react-eas';

const EASContractAddress = '0xC2679fBD37d54388Ce493F1DB75320D236e1815e'; // Sepolia v0.26

// Initialize the SDK with the address of the EAS Schema contract address
const easInstance = new EAS(EASContractAddress);

// For default provider (use dedicated providers like Infura or Alchemy in production)
const provider = ethers.providers.getDefaultProvider('sepolia');

// Connects an ethers style provider/signingProvider for read/write functions.
// Note that a signer is ESSENTIAL for write operations!
eas.connect(provider);

function App() {
  return <EasProvider eas={easInstance}>{/* other components */}</EasProvider>;
}
```

### Using the Hooks

#### useAttest

This hook lets you issue on-chain and off-chain attestations.

Example for an on-chain attestation:

```jsx
import { Signer } from 'ethers';
import { useAttest, encodeAttestationData } from 'react-eas';

const schemaUID = "0xb16fa048b0d597f5a821747eba64efa4762ee5143e9a80600d0005386edfc995";

type ExampleAttestationData = {
  eventId: number;
  voteIndex: number;
};

function OnchainAttestComponent() {
  const { onchain } = useAttest();

  async function handleIssueAttestation(data: ExampleAttestationData) {
    const encodedData = encodeAttestationData(data, [
      { name: "eventId", type: "uint256" },
      { name: "voteIndex", type: "uint8" },
    ]);

    const attestation = await onchain(schemaUID, {
      recipient: "0xFD50b031E778fAb33DfD2Fc3Ca66a1EeF0652165",
      expirationTime: 0,
      revocable: true,
      data: encodedData,
    });

    return attestation;
  }

  return (
    <button onClick={() => handleIssueAttestation({ eventId: 273, voteIndex: 1 })}>
      Issue attestation
    </button>
  );
}
```

Example for an off-chain attestation:

```jsx
import { useAttest, encodeAttestationData } from 'react-eas';

const schemaUID = "0xb16fa048b0d597f5a821747eba64efa4762ee5143e9a80600d0005386edfc995";

type ExampleAttestationData = {
  eventId: number;
  voteIndex: number;
}

function OffchainAttestComponent() {
  const { offchain } = useAttest();

  async function handleIssueAttestation(data: ExampleAttestationData) {
    const encodedData = encodeAttestationData(data, [
      { name: "eventId", type: "uint256" },
      { name: "voteIndex", type: "uint8" },
    ]);

    const attestation = await offchain(schemaUID, {
      recipient: '0xFD50b031E778fAb33DfD2Fc3Ca66a1EeF0652165',
      expirationTime: 0,
      time: 1671219636,
      revocable: true,
      version: 1,
      nonce: 0,
      refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
      data: encodedData,
    });

    return attestation;
  }

  return (
    <button onClick={() => handleIssueAttestation({ eventId: 273, voteIndex: 1 })}>
      Issue attestation
    </button>
  );
}
```

#### useEasContext

Retrieve the underlying EAS SDK anywhere within your component tree. Here is an example using [@tanstack/react-query](https://www.npmjs.com/package/@tanstack/react-query) to fetch a specific attestation

```jsx
import { useEasContext } from 'react-eas';
import { useQuery } from '@tanstack/react-query';

const uid =
  '0xff08bbf3d3e6e0992fc70ab9b9370416be59e87897c3d42b20549901d2cccc3e';

function SomeComponent() {
  const { eas } = useEasContext();

  const { isLoading, isError, data, error } = useQuery({
    queryKey: ['attestation', uid],
    queryFn: () => eas.getAttestation(uid),
  });

  // rest of the code
}
```

## Contributing

Pull requests are welcomed! For significant changes, please open an issue first to discuss your proposed changes.

## License

[MIT](./LICENSE)
