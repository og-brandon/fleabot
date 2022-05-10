export type ConfigModel = {
  clientId: string;
  guildId: string;
  token: string;
  twitterConsumerKey: string;
  twitterConsumerSecret: string;
  twitterAccessTokenKey: string;
  twitterAccessTokenSecret: string;
  twitter_channel: string[];
  rhcp_subreddit_channel_ID: string;
  rhcp_twitter_toggle: boolean;
  rhcp_subreddit_toggle: boolean;
  following: string[];
  channelsToPost: string[];
  geniusToken: string[];
  tzUserRegistry: Record<string, string[]>;
};
