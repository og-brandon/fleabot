import {Listener} from "./listener";
import {ConfigModel} from "../config/configModel";
import cron from "node-cron";
import fetch from "node-fetch";
import decodeN from "html-entities";
import {client} from "../utils";
import {MessageEmbed} from "discord.js";
import {logger} from "../logger";

const rhcpURL = "https://www.reddit.com/r/RedHotChiliPeppers/new.json?t=hour";

type Post = {
    title: string;
    reddit_url: string;
    media_url: string;
    is_spoiler: string;
    thumbnail_image: string;
    user: string;
    self: string;
};


export class RedditListener extends Listener<"rhcp_subreddit_toggle"> {
    configKey(): "rhcp_subreddit_toggle" {
        return "rhcp_subreddit_toggle";
    }

    async start(config: ConfigModel): Promise<void> {
        logger.info("Setting up cron for RedditListener");
        cron.schedule("* * * * *", () => {
            try {
                let postsDate: number[] = [];

                fetch(rhcpURL)
                    .then((response) => response.json())
                    .then((postsJSON) => {
                        const subredditDate = Math.floor(Date.now() / 1000);

                        for (var i = 0; i < postsJSON["data"]["children"].length; i++) {
                            const utc_post =
                                postsJSON["data"]["children"][i]["data"]["created_utc"];
                            const seconds_since = subredditDate - utc_post;
                            postsDate.push(seconds_since);
                        }

                        // returns list with indexes of new posts last minute
                        const postsIndexes = postsDate.reduce((arr, e, i) => {
                            if (e <= 62) arr.push(i);
                            return arr;
                        }, [] as number[]);

                        let lastMinutePosts: Post[] = [];

                        let post: Post | null = null;

                        postsIndexes.forEach((i: any) => {
                            post = {
                                title: decodeN.decode(
                                    postsJSON["data"]["children"][i]["data"]["title"].substring(
                                        0,
                                        255
                                    )
                                ),
                                reddit_url:
                                    "https://www.reddit.com/" +
                                    postsJSON["data"]["children"][i]["data"]["permalink"],
                                media_url: postsJSON["data"]["children"][i]["data"]["url"],
                                is_spoiler: postsJSON["data"]["children"][i]["data"]["spoiler"],
                                thumbnail_image:
                                    postsJSON["data"]["children"][i]["data"]["thumbnail"],
                                user: postsJSON["data"]["children"][i]["data"]["author"],
                                self: decodeN.decode(
                                    postsJSON["data"]["children"][i]["data"]["selftext"].substring(
                                        0,
                                        4000
                                    )
                                ),
                            };

                            if (!post.thumbnail_image.startsWith("http")) {
                                post.thumbnail_image =
                                    "https://github.com/og-brandon/fleabot/blob/master/images/snoo.png?raw=true";
                            }

                            // replaces cases where self posts is just preview link broken
                            if (post.self.startsWith("&amp")) {
                                // @ts-ignore
                                post.media_url = Object.values(
                                    postsJSON["data"]["children"][0]["data"]["media_metadata"]
                                )[0]["p"][0]["u"].replace("preview", "i");
                                post.self = "";
                            }

                            lastMinutePosts.push(post);
                        });

                        const channel = client.channels.cache.get(
                            config.rhcp_subreddit_channel_ID
                        );

                        lastMinutePosts.forEach((post) => {
                            const subredditEmbed = new MessageEmbed()
                                .setColor("#ff0019")
                                .setTitle(post.title)
                                .setDescription(post.self)
                                .setTimestamp()
                                .setThumbnail(post.media_url)
                                .setURL(post.reddit_url)
                                .setFooter({
                                    text: "/u/" + post.user,
                                    iconURL:
                                        "https://github.com/og-brandon/fleabot/blob/master/images/snoo.png?raw=true",
                                });

                            // if post has title but nothing else then add logo
                            if (
                                post.self ||
                                (!post.self &&
                                    post.media_url.startsWith(
                                        "https://www.reddit.com/r/RedHotChiliPeppers/comments"
                                    ))
                            ) {
                                subredditEmbed.setThumbnail(
                                    "https://github.com/og-brandon/fleabot/blob/master/images/snoo.png?raw=true"
                                );
                            }
                            // if thumbnails is spoiler
                            else if (post?.media_url?.startsWith("http") === false) {
                                subredditEmbed.setThumbnail(
                                    "https://github.com/og-brandon/fleabot/blob/master/images/snoo.png?raw=true"
                                );
                            } else {
                                subredditEmbed.setThumbnail(post.thumbnail_image);
                                subredditEmbed.setDescription(post.media_url);
                            }

                            // if thumnbail is an image
                            if (
                                post.media_url.endsWith("jpg") ||
                                post.media_url.endsWith("png") ||
                                post.media_url.endsWith("jpeg") ||
                                post.media_url.endsWith("webp") ||
                                post.media_url.endsWith("gif")
                            ) {
                                subredditEmbed.setThumbnail(post.media_url);
                                subredditEmbed.setDescription(post.media_url);
                            }

                            // if self contains preview reddit image that doesnt work
                            if (post.self.includes("https://preview.redd.it")) {
                                post.self.replace("https://preview.redd.it", "https://i.redd.it");
                                subredditEmbed.setThumbnail(
                                    "https://github.com/og-brandon/fleabot/blob/master/images/snoo.png?raw=true"
                                );
                            }

                            if (!post.thumbnail_image.startsWith("http")) {
                                subredditEmbed.setThumbnail(
                                    "https://github.com/og-brandon/fleabot/blob/master/images/snoo.png?raw=true"
                                );
                            }

                            // @ts-ignore
                            channel?.send({ embeds: [subredditEmbed] });
                        });
                    });
            } catch (error) {
                logger.error(error);
            }
        })
    }

}