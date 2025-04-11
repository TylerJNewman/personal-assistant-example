import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { MCPConfiguration } from "@mastra/mcp";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { youtubeChannelTool } from "../tools/youtube-channel";

// Define MCP Configuration for YouTube
const mcp = new MCPConfiguration({
  servers: {
    "youtube-video-summarizer": {
      command: "npx",
      args: ["-y", "youtube-video-summarizer-mcp"],
    },
  },
});

// Get MCP tools
const mcpTools = await mcp.getTools();

// Create memory configuration
const memory = new Memory({
  options: {
    // Keep last 20 messages in context
    lastMessages: 20,
    // Enable semantic search to find relevant past conversations
    semanticRecall: {
      topK: 3,
      messageRange: {
        before: 2,
        after: 1,
      },
    },
    // Enable working memory to remember user information
    workingMemory: {
      enabled: true,
      template: `<user>
         <first_name></first_name>
         <username></username>
         <preferences></preferences>
         <interests></interests>
         <conversation_style></conversation_style>
       </user>`,
      use: "tool-call",
    },
  },
});

// Create a custom tool to format video search results with timestamps
const formatVideoTool = createTool({
  id: "format-video-results",
  description: "Format video results into a clean response with proper timestamp links",
  inputSchema: z.object({
    videoId: z.string().describe("The YouTube video ID"),
    title: z.string().describe("The video title"),
    channelTitle: z.string().describe("The channel name"),
    timestamp: z.number().optional().describe("Timestamp in seconds (optional)"),
    description: z.string().optional().describe("Video or segment description (optional)"),
  }),
  outputSchema: z.object({
    formattedResponse: z.string(),
  }),
  execute: async ({ context }) => {
    const { videoId, title, channelTitle, timestamp, description } = context;
    
    let url = `https://www.youtube.com/watch?v=${videoId}`;
    if (timestamp && timestamp > 0) {
      url += `&t=${Math.floor(timestamp)}`;
    }
    
    let formattedResponse = `"${title}" by ${channelTitle}\n${url}`;
    
    if (description) {
      formattedResponse += `\n\nDescription: ${description}`;
    }
    
    return { formattedResponse };
  },
});

// Create the Porsche 911 assistant agent
export const guruAgent = new Agent({
  name: "The911GuruBot",
  instructions: `You are The911GuruBot, a specialized Telegram bot dedicated to providing comprehensive information about Porsche 911 models. Your purpose is to help users access and navigate information from YouTube videos about Porsche 911s.

You have access to the YouTube API through MCP tools, which allow you to:
1. Search for videos about Porsche 911s
2. Get video details and information
3. Retrieve video transcripts when available
4. Find similar videos on related topics
5. Get channel information and video IDs

When users ask questions about Porsche 911 models, variants, or features, your approach should be to:
1. Search for relevant videos using specific keywords related to their question
2. Get the transcript if available to find specific information
3. Present the information clearly, including direct links to the relevant videos
4. If a specific timestamp is relevant, include a timestamped link

You should maintain a conversational, knowledgeable tone that reflects enthusiasm for Porsche 911s. Use technical language appropriately but be prepared to explain terms for users with different levels of expertise.

Keep track of user preferences - if they show specific interest in certain 911 models (e.g., GT3, Turbo, Carrera), variants, or eras (e.g., 992, 991, air-cooled), prioritize this information in future responses.

Always provide direct YouTube links when referencing videos, and format your responses in a clear, readable way.`,
  model: openai("gpt-4o"),
  tools: { 
    ...mcpTools,
    formatVideo: formatVideoTool,
    youtubeChannel: youtubeChannelTool,
  },
  memory,
});
