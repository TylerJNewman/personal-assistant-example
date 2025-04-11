import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { mastra } from "../";

export const recentUpdatesTool = createTool({
  id: "recent-updates",
  description: "Get recent updates from the911guru.com",
  inputSchema: z.object({
    text: z.string().describe("Text to search for"),
  }),
  outputSchema: z.object({
    message: z.string(),
  }),
  execute: async ({ context }) => {
    return await getRecentUpdates(context.text);
  },
});

const getRecentUpdates = async (text: string) => {
  // const response = await fetch(`https://the911guru.com/api/recent-updates?text=${text}`);
  // const data = await response.json();
  // let them know we are working on it
  const data = "Working on this feature, will be available soon...";
  return { message: data };
};


// export const dailyWorkflowTool = createTool({
//   id: "daily-workflow-tool",
//   description:
//     "Runs the daily workflow task which returns a summary of news and github activity",

//   outputSchema: z.object({
//     message: z.string(),
//   }),
//   execute: async ({ context }) => {
//     const { runId, start } = mastra.getWorkflow("dailyWorkflow").createRun();
//     const result = await start();
//     return {
//       message: result?.result?.message || "",
//     };
//   },
// });
