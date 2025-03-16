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

server.tool(
  "get-soon-testnet-balance",
  "Get the balance of a address on the Soon testnet",
  {
    address: z.string().describe("The SOON address to get the balance of"),
  },
  async ({ address }) => {
    const balance = await connectionTestnet.getBalance(new PublicKey(address));
    return {
      content: [
        {
          type: "text",
          text: `Balance: ${balance}`,
        },
      ],
    };
  }
);

server.tool(
  "get-soon-testnet-last-transaction",
  "Get the last transaction of an address on the Soon testnet",
  {
    address: z
      .string()
      .describe("The SOON address to get the last transaction for"),
  },
  async ({ address }) => {
    try {
      const signatures = await connectionTestnet.getSignaturesForAddress(
        new PublicKey(address),
        { limit: 1 }
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
            text: `Error getting transaction: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-soon-testnet-account-tokens",
  "Get the tokens of a address on the Soon testnet",
  {
    address: z.string().describe("The SOON address to get the tokens of"),
  },
  async ({ address }) => {
    try {
      const tokens = await connectionTestnet.getTokenAccountsByOwner(
        new PublicKey(address),
        {
          programId: new PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ),
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
            text: `Error getting tokens: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-soon-mainnet-balance",
  "Get the balance of a address on the Soon mainnet",
  {
    address: z.string().describe("The SOON address to get the balance of"),
  },
  async ({ address }) => {
    const balance = await connectionMainnet.getBalance(new PublicKey(address));
    return {
      content: [
        {
          type: "text",
          text: `Balance: ${balance}`,
        },
      ],
    };
  }
);

server.tool(
  "get-soon-mainnet-last-transaction",
  "Get the last transaction of an address on the Soon mainnet",
  {
    address: z
      .string()
      .describe("The SOON address to get the last transaction for"),
  },
  async ({ address }) => {
    try {
      const signatures = await connectionMainnet.getSignaturesForAddress(
        new PublicKey(address),
        { limit: 1 }
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

      const latestSignature = signatures[0].signature;
      const transaction = await connectionMainnet.getConfirmedTransaction(
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
            text: `Error getting transaction: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-soon-mainnet-account-tokens",
  "Get the tokens of a address on the Soon mainnet",
  {
    address: z.string().describe("The SOON address to get the tokens of"),
  },
  async ({ address }) => {
    try {
      const tokens = await connectionMainnet.getTokenAccountsByOwner(
        new PublicKey(address),
        {
          programId: new PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ),
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
            text: `Error getting tokens: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

async function main() {
  try {
    console.error("Starting MCP server...");
    const transport = new StdioServerTransport();
    console.error("Transport initialized, connecting to server...");
    await server.connect(transport);
    console.error("Server connection established successfully");
  } catch (error) {
    console.error("There was an error connecting to the server:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("There was an error starting the server:", err);
  process.exit(1);
});
