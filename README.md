# SVM-MCP: SOON Model Context Protocol Server

A Model Context Protocol (MCP) server that integrates Claude AI with SOON and other SVM-based blockchains. The server provides tools for checking balances, fetching recent transactions, and viewing token holdings on SOON's testnet and mainnet, for account balances, transactions, and token holdings.

## Overview

This MCP server is designed to connect Claude with the SOON ecosystem, allowing it to:
- Query wallet balances on testnet and mainnet
- Fetch the most recent transactions for an address
- Check token holdings for any account

The current implementation uses the SOON's RPC endpoints, but can be easily modified to work with any Solana-compatible blockchain or custom SVM implementation.

## Features

- **Get Balances**: Fetch native token balances for any address on SOON testnet or mainnet
- **Get Last Transaction**: Retrieve the most recent transaction for an address
- **Get Token Accounts**: List all token accounts owned by an address

## Prerequisites

- Node.js (v16+)
- NPM or Bun package manager
- Claude Desktop (for local testing)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/rkmonarch/svm-mcp
cd svm-mcp
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Build the project:
```bash
npm run build
# or
bun run build
```

## Project Structure

The main server implementation is in `src/index.ts`:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Connection, PublicKey } from "@solana/web3.js";
import { z } from "zod";

const connectionTestnet = new Connection("https://rpc.testnet.soo.network/rpc");
const connectionMainnet = new Connection("https://rpc.mainnet.soo.network/rpc");

const server = new McpServer({
  name: "svm-mcp",
  version: "0.0.1",
  capabilities: [
    "get-soon-testnet-balance",
    "get-soon-testnet-last-transaction",
    "get-soon-testnet-account-tokens",
    "get-soon-mainnet-balance",
    "get-soon-mainnet-last-transaction",
    "get-soon-mainnet-account-tokens",
  ],
});
```

## Tool Implementations

### Get Balance

```typescript
server.tool(
  "get-soon-testnet-balance",
  "Get the balance of a address on the Soon testnet",
  {
    address: z.string().describe("The Solana address to get the balance of"),
  },
  async ({ address }) => {
    try {
      const balance = await connectionTestnet.getBalance(new PublicKey(address));
      return {
        content: [
          {
            type: "text",
            text: `Balance: ${balance}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting balance: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);
```

### Get Last Transaction

```typescript
server.tool(
  "get-soon-testnet-last-transaction",
  "Get the last transaction of an address on the Soon testnet",
  {
    address: z
      .string()
      .describe("The Solana address to get the last transaction for"),
  },
  async ({ address }) => {
    try {
      // Fetch the most recent transaction signatures for the address
      const signatures = await connectionTestnet.getSignaturesForAddress(
        new PublicKey(address),
        { limit: 1 } // Limit to just the most recent transaction
      );

      if (signatures.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No transactions found for this address",
            },
          ],
        };
      }

      // Get the most recent transaction using its signature
      const latestSignature = signatures[0].signature;
      const transaction = await connectionTestnet.getConfirmedTransaction(
        latestSignature
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(transaction),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting transaction: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);
```

### Get Token Accounts

```typescript
server.tool(
  "get-soon-testnet-account-tokens",
  "Get the tokens of a address on the Soon testnet",
  {
    address: z.string().describe("The Solana address to get the tokens of"),
  },
  async ({ address }) => {
    try {
      const tokens = await connectionTestnet.getTokenAccountsByOwner(
        new PublicKey(address),
        {
          programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        }
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(tokens),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting tokens: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);
```

### Server Initialization

```typescript
async function main() {
  try {
    console.error("Starting MCP server...");
    const transport = new StdioServerTransport();
    console.error("Transport initialized, connecting to server...");
    await server.connect(transport);
    console.error("Server connection established successfully");
    // The server will keep running in this state
  } catch (error) {
    console.error("There was an error connecting to the server:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("There was an error starting the server:", err);
  process.exit(1);
});
```

## Configuration

### Claude Desktop Configuration

To use this MCP server with Claude Desktop, add the following to your `claude_desktop_config.json` file:

```json
{
  "mcpServers": {
    "svm-mcp": {
      "command": "bun",
      "args": ["/path/to/svm-mcp/build/index.js"]
    }
  }
}
```

### Customizing RPC Endpoints

To use different RPC endpoints or connect to a different Solana-compatible blockchain, edit the connection URLs in `src/index.ts`:

```typescript
const connectionTestnet = new Connection("YOUR_TESTNET_RPC_URL");
const connectionMainnet = new Connection("YOUR_MAINNET_RPC_URL");
```

## Usage with Claude

Once the MCP server is running and connected to Claude, you can use the following commands:

### Checking an Address Balance

```
Can you check the balance of this SOON testnet address: <address>
```

### Fetching Recent Transactions

```
What is the last transaction made by <address> on SOON testnet?
```

### Retrieving Token Holdings

```
What tokens does <address> hold on SOON mainnet?
```

## Acknowledgments

- [Anthropic Claude](https://www.anthropic.com/claude) for the AI capabilities
- [Model Context Protocol](https://modelcontextprotocol.io/introduction) for enabling tool integration
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/) for blockchain interaction
- [SOON Network](https://soo.network/) for the SVM implementation used in this example
