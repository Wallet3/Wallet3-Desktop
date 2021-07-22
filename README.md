# Wallet 3 - A Secure Wallet for Bankless Era

Wallet 3 is a secure crypto wallet for desktop users. It has a simple, UX-friendly design for users. With WalletConnect, users can experience the powerful DeFi ecosystem.

## Cutting-edge security

Wallet 3 utilizes the latest macOS security features to protect users. The private key is stored in the keychain which is secured by Secure Enclave, inaccessible to anyone other than the user.

Wallet 3 **DO NOT** trust users' desktop environment. After Wallet 3 is launchd,  the app creates a secure pipline for inter-process communication. And no sensitive data will be resident in the memory.

### About hardware wallet

Wallet 3 provides 12/24 seed phrases for users. And according to Apple Security Document: 

> The kernel CPRNG is seeded from multiple entropy sources during boot and over the lifetime of the device. These include (contingent on availability): <br>
The Secure Enclave hardware TRNG <br>
Timing-based jitter collected during boot <br>
Entropy collected from hardware interrupts <br>
A seed file used to persist entropy across boots <br>
Intel random instructions — for example, RDSEED and RDRAND (only on an Intel-based Mac) <br> <br>
Source: https://support.apple.com/en-ie/guide/security/seca0c73a75b/web

**Wallet 3** can utilize these advanced security mechanisms to protect the digital assets for desktop users.

## Features

0. Built for Security.
1. Support Layer 2 and EVM-compatible chains.
2. Connect DeFi apps with WalletConnect.
3. UX-friendly Design.
4. Support TouchBar.
5. Real-time gas price for Mac users.
6. Multi-account support.

## What is Ethereum

Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether (ETH or Ξ) is the native cryptocurrency of the platform.

> The vision of Ethereum grants a more ambitious possibility. We can disrupt the central banks yes, but we can also replace private banks with protocols. We can turn all bank functions into code, both central and private. Saving, lending, borrowing, trading—the entire money system—all bankless. And as long as the central bank monetary policies remain competitive, they too can encode their money on this public settlement network. That’s the point. Anyone can. The Ethereum network is open and neutral like the internet. Source: [Bankless](https://newsletter.banklesshq.com/p/a-tale-of-two-money-systems)

## What is DeFi

The term DeFi stands for “decentralized finance” and the move to shift away from the more traditional centralized financial systems such as banks, brokerages or exchanges that facilitate transactions to a secure peer-to-peer service model without the need for transactional intermediaries.

## Localization

Wallet 3 is available in the following languages:

- English
- Japanese
- Traditional Chinese
- Simplified Chinese

## Development Setup

1. Clone the repo: `https://github.com/Wallet3/Wallet3.git`
2. Install dependencies: `yarn install`
3. Copy `src/common/.wallet3.rc.example.json` to `src/common/.wallet3.rc.json`, and fill valid RPC urls: `src/common/.wallet3.rc.json`
4. Copy `sign/appSign.example.js` to `sign/appSign.js`, `sign/winSign.example.js` to `sign/winSign.js`
5. Launch: `yarn start`

## Copyright & License

&copy; 2021 ChainBow Co, Ltd. Business Source License 1.1
