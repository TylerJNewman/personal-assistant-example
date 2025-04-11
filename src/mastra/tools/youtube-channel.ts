import { createTool } from "@mastra/core/tools";
import { z } from "zod";

interface PlaylistItem {
  contentDetails: {
    videoId: string;
  };
}

interface PlaylistResponse {
  items: PlaylistItem[];
  nextPageToken?: string;
}

interface ChannelContext {
  channelHandle: string;
}

interface ChannelResult {
  channelId: string;
  title: string;
  videoIds: string[];
}

const tool = createTool({
  id: "youtube-channel",
  description: "Get YouTube channel information and video IDs",
  inputSchema: z.object({
    channelHandle: z.string().describe("The YouTube channel handle (e.g., @fcpeuro)"),
  }),
  outputSchema: z.object({
    channelId: z.string(),
    title: z.string(),
    videoIds: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const { channelHandle } = context;
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      throw new Error("YouTube API key is not configured");
    }

    // First, get the channel ID using the channel handle
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${channelHandle}&key=${apiKey}`
    );
    
    if (!channelResponse.ok) {
      throw new Error(`Failed to fetch channel info: ${channelResponse.statusText}`);
    }

    const channelData = await channelResponse.json();
    
    if (!channelData.items || channelData.items.length === 0) {
      throw new Error(`Channel not found: ${channelHandle}`);
    }

    const channelId = channelData.items[0].id;

    // Now get the channel's uploads playlist ID
    const channelDetailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&id=${channelId}&key=${apiKey}`
    );

    if (!channelDetailsResponse.ok) {
      throw new Error(`Failed to fetch channel details: ${channelDetailsResponse.statusText}`);
    }

    const channelDetails = await channelDetailsResponse.json();
    const uploadsPlaylistId = channelDetails.items[0].contentDetails.relatedPlaylists.uploads;
    const channelTitle = channelDetails.items[0].snippet.title;

    // Get all videos from the uploads playlist
    let videoIds: string[] = [];
    let nextPageToken = "";
    
    do {
      const playlistResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ""}`
      );

      if (!playlistResponse.ok) {
        throw new Error(`Failed to fetch playlist items: ${playlistResponse.statusText}`);
      }

      const playlistData = await playlistResponse.json() as PlaylistResponse;
      videoIds = videoIds.concat(playlistData.items.map(item => item.contentDetails.videoId));
      nextPageToken = playlistData.nextPageToken || "";
    } while (nextPageToken);

    return {
      channelId,
      title: channelTitle,
      videoIds,
    };
  },
});

export const youtubeChannelTool = tool; 