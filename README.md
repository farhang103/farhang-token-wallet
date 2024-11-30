# Farhang Token Wallet

A modern, secure web3 wallet interface for interacting with the Farhang Token (FAT) on the Sepolia testnet. Built with Next.js, RainbowKit, and Wagmi.

## Features

- 🔐 Secure wallet connection via RainbowKit
- 💸 Send and receive FAT tokens
- ⚡ Real-time balance updates
- 💰 Live gas fee estimation in USD
- 🔄 Transaction status tracking
- ✅ Comprehensive test coverage
- 🎨 Clean, modern UI with Tailwind CSS

## Tech Stack

- **Frontend Framework:** Next.js 15
- **Web3 Libraries:**
  - RainbowKit
  - Wagmi
  - Viem
- **Styling:**
  - Tailwind CSS
  - Shadcn/ui components
- **Testing:**
  - Vitest
  - React Testing Library
- **Smart Contract Development:**
  - Hardhat
  - OpenZeppelin
- **Type Safety:** TypeScript
- **Form Handling:** React Hook Form + Zod
- **State Management:** TanStack Query

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v10+)
- A wallet with some Sepolia ETH

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/farhang-token-wallet.git
   cd farhang-token-wallet
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:

   ```env
   NEXT_PUBLIC_ENABLE_TESTNETS=true
   SEPOLIA_RPC_URL=your_sepolia_rpc_url
   PRIVATE_KEY=your_private_key
   NEXT_PUBLIC_DEPLOYED_TOKEN_ADDRESS=your_token_address
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Smart Contract Deployment

To deploy the Farhang Token contract to Sepolia:

```bash
npm run deploy
```

## Testing

Run the test suite:

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui
```

## Acknowledgments

- [RainbowKit](https://www.rainbowkit.com/)
- [Wagmi](https://wagmi.sh/)
- [T3 Stack](https://create.t3.gg/)
- [Shadcn/ui](https://ui.shadcn.com/)
