import {RedditListener} from "./redditListener";
import {TwitterListener} from "./twitterListener";

export const listeners = [
    new RedditListener(),
    new TwitterListener()
]