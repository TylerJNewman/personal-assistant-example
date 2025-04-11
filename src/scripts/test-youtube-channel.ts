import dotenv from 'dotenv';
import { youtubeChannelTool } from '../mastra/tools/youtube-channel';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Manually load API key if not available in environment
if (!process.env.YOUTUBE_API_KEY) {
  try {
    const envPath = path.resolve(process.cwd(), '.env.development');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const youtubeApiKeyMatch = envContent.match(/YOUTUBE_API_KEY=([^\n]+)/);
      if (youtubeApiKeyMatch?.[1]) {
        process.env.YOUTUBE_API_KEY = youtubeApiKeyMatch[1];
        console.log('Loaded YouTube API key from .env.development');
      }
    }
  } catch (error) {
    console.error('Error loading environment variables:', error);
  }
}

async function main() {
  try {
    // Verify API key is set
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error('YouTube API key is not configured. Please check your .env.development file.');
    }

    // @ts-ignore - Ignore TypeScript error about possibly undefined
    const result = await youtubeChannelTool.execute({
      context: {
        channelHandle: '@fcpeuro'
      }
    });

    console.log('Channel Information:');
    console.log('-------------------');
    console.log('Channel ID:', result.channelId);
    console.log('Channel Title:', result.title);
    console.log('\nVideo IDs:');
    console.log('----------');
    result.videoIds.forEach((videoId, index) => {
      console.log(`${index + 1}. ${videoId}`);
    });
    console.log(`\nTotal Videos: ${result.videoIds.length}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the main function
main().catch(error => {
  console.error('Error in test script:', error);
  process.exit(1);
}); 