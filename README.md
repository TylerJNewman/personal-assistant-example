# Porsche 911 YouTube Assistant (The911GuruBot)

A specialized Mastra agent that provides comprehensive information about Porsche 911 models by leveraging YouTube videos through the Model Context Protocol (MCP).

## Features

- Search for YouTube videos about Porsche 911 models
- Retrieve and analyze video transcripts
- Extract relevant information from videos about specific 911 models and variants
- Generate direct links to relevant videos, including timestamp links when appropriate
- Remember user preferences for personalized responses

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env` file with the following configuration:
   ```
   OPENAI_API_KEY=your-openai-api-key
   YOUTUBE_API_KEY=your-youtube-api-key
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token
   ```

## Usage

To run the YouTube assistant in interactive mode:

```bash
pnpm youtube-assistant
```

This will start an interactive CLI session where you can ask questions about Porsche 911 models, and the agent will respond with relevant information sourced from YouTube videos.

## How It Works

The assistant uses:

1. **YouTube MCP Server**: Connects to YouTube's API to search and retrieve video data
2. **Mastra Agent**: Orchestrates the conversation and maintains context
3. **Memory**: Remembers user preferences and conversation history
4. **Custom Tools**: Formats video results with proper links and timestamps

## Development

- `src/mastra/agents/index.ts` - Contains the agent definition
- `src/scripts/test-youtube-assistant.ts` - Interactive test script

## License

ISC
