import { randomUUID } from 'crypto';
import Readline from 'readline';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import the Mastra instance
import { mastra } from '../mastra';

// Get the agent
const agent = mastra.getAgent('guruAgent');

// Generate a thread ID
const threadId = randomUUID();
console.log(`Thread ID: ${threadId}`);

// User ID for the session
const resourceId = 'SAMPLE_USER_123';

// Helper function to log agent responses
async function logResponse(res: Awaited<ReturnType<typeof agent.stream>>) {
  console.log(`\n🤖 The911GuruBot:`);
  for await (const chunk of res.textStream) {
    process.stdout.write(chunk);
  }
  console.log(`\n\n`);
}

// Example queries to test
const sampleQueries = [
  "What are the main differences between the 992 and 991 generation Porsche 911?",
  "Tell me about the Porsche 911 GT3 RS performance specifications",
  "What makes the 911 Turbo S so special compared to regular 911 models?",
  "Can you recommend a good video about the history of air-cooled Porsche 911s?",
  "What are the key features of the new 992 GT3?"
];

// Main function to run the test
async function main() {
  // Start with an introduction
  await logResponse(
    await agent.stream(
      [
        {
          role: 'system',
          content: `Initialize conversation with a new user interested in Porsche 911s.`
        }
      ],
      { resourceId, threadId }
    )
  );

  // Interactive mode
  const rl = Readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('Sample queries you can try:');
  sampleQueries.forEach((query, index) => {
    console.log(`${index + 1}. ${query}`);
  });
  console.log('Or type your own query about Porsche 911s!\n');

  // Start interactive loop
  while (true) {
    const userInput: string = await new Promise(resolve => {
      rl.question('Your query: ', answer => {
        resolve(answer);
      });
    });

    // Check for exit command
    if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
      console.log('Exiting conversation. Goodbye!');
      break;
    }

    // Process numeric shortcuts to sample queries
    const queryIndex = parseInt(userInput) - 1;
    const query = (queryIndex >= 0 && queryIndex < sampleQueries.length) 
      ? sampleQueries[queryIndex] 
      : userInput;

    if (queryIndex >= 0 && queryIndex < sampleQueries.length) {
      console.log(`Query: ${query}`);
    }

    // Send query to agent
    await logResponse(
      await agent.stream(query, {
        threadId,
        resourceId,
      })
    );
  }

  rl.close();
  process.exit(0);
}

// Run the main function
main().catch(error => {
  console.error('Error in test script:', error);
  process.exit(1);
}); 