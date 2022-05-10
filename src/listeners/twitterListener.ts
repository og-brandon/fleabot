import { Listener } from "./listener";
import { logger } from "../logger";
import {AnyChannel, Channel, MessageEmbed, PartialTextBasedChannelFields} from "discord.js";
import { client } from "../utils";
import Twit from "node-tweet-stream";
import { ConfigModel } from "../config/configModel";

export class TwitterListener extends Listener<"rhcp_twitter_toggle"> {
  configKey(): "rhcp_twitter_toggle" {
    return "rhcp_twitter_toggle";
  }

  async start(config: ConfigModel): Promise<void> {
      logger.info("Setting up TwitterListener");
      const t = new Twit({
      consumer_key: config.twitterConsumerKey,
      consumer_secret: config.twitterConsumerSecret,
      //app_only_auth:true,
      //access_token_key:config.twitterAccessTokenKey,
      //access_token_secret:config.twitterAccessTokenSecret
      token: config.twitterAccessTokenKey,
      token_secret: config.twitterAccessTokenSecret,
    });

    t.on("tweet", function (tweet: any) {
      if (isReply(tweet)) {
        //
      } else {
        let media = tweet.entities.media;
        let tweetURL = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
        chatPost(
          tweet.text,
          tweet.user.name,
          tweet.user.screen_name,
          tweetURL,
          tweet.user.profile_image_url,
          media
        );
      }
    });

    t.on("error", function (err: any) {
      logger.error(err);
    });
    let track = config.following;
    for (var i = 0; i < track.length; i++) {
      t.follow(track[i]);
      logger.info(`Following Twitter User [ID]${track[i]}`);
    }

    // twitter function
    function isReply(tweet: any) {
      return !!(
        tweet.retweeted_status ||
        tweet.in_reply_to_status_id ||
        tweet.in_reply_to_status_id_str ||
        tweet.in_reply_to_user_id ||
        tweet.in_reply_to_user_id_str ||
        tweet.in_reply_to_screen_name
      );
    }

    async function chatPost(
        content: any,
        author: any,
        atAuthor: any,
        tweetURL: any,
        authorPfp: any,
        media: any
    ) {
        const authorTweet = author + " @" + atAuthor;
        const message = new MessageEmbed()
            .setColor("#00acee")
            .setDescription(content)
            .setTimestamp()
            .setAuthor({
                name: authorTweet,
                iconURL: authorPfp,
                url: tweetURL,
            })
            .setURL(tweetURL)
            .setFooter({
                text: "Twitter",
                iconURL:
                    "https://raw.githubusercontent.com/og-brandon/fleabot/master/images/twitter.png",
            });

        if (!!media)
            for (let j = 0; j < media.length; j++)
                message.setImage(media[j].media_url);

        for (const channelId of config.twitter_channel) {
            try {
                const channel = await client.channels.fetch(channelId)
                // @ts-ignore
                if (channel["send"] !== undefined) {
                    await (channel as PartialTextBasedChannelFields).send({embeds: [message]});
                }
            } catch (e) {
                logger.warn(e);
            }
        }
    }
  }
}
