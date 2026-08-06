import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// PostgreSQL Client Setup
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://ekremberatrecep@localhost:5432/shopping_dotnet_db",
});

// Create MCP Server
const server = new Server(
  {
    name: "shopping-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get-users-count",
        description: "Get the total number of non-deleted users in the system",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get-active-offers-count",
        description: "Get the total number of active offers in the system",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Handle Tool Execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get-users-count") {
    try {
      const result = await pool.query("SELECT COUNT(*) FROM \"Users\" WHERE \"IsDeleted\" = false");
      const count = result.rows[0].count;
      
      return {
        content: [
          {
            type: "text",
            text: `Sistemde toplam ${count} adet aktif kullanıcı bulunmaktadır.`,
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(ErrorCode.InternalError, `Veritabanı hatası: ${error.message}`);
    }
  }

  if (request.params.name === "get-active-offers-count") {
    try {
      const result = await pool.query("SELECT COUNT(*) FROM \"Offers\" WHERE \"IsActive\" = true");
      const count = result.rows[0].count;
      
      return {
        content: [
          {
            type: "text",
            text: `Sistemde toplam ${count} adet aktif kampanya bulunmaktadır.`,
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(ErrorCode.InternalError, `Veritabanı hatası: ${error.message}`);
    }
  }

  throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
});

// Start the Server
async function run() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Shopping MCP Server started successfully");
  } catch (error) {
    console.error("Failed to start MCP server:", error);
    process.exit(1);
  }
}

run();
