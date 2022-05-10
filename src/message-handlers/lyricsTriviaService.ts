import { logger } from "../logger";
import retry from "async-retry";
import { Client } from "genius-lyrics";
import fs from "fs";
import { getRandomInt, nth_occurrence } from "../utils";

const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
const geniusClient = new Client(config.geniusToken);

async function getArtistID(artist: any) {
  const searches = await geniusClient.songs.search(artist);
  if (searches.length === 0) {
    return null;
  }
  const firstSong = searches[getRandomInt(1, 3)]; // max 10, coldplay returns coldplay and chainsmokers at 1 so we start at second entry.
  return {
    artistId: firstSong.artist?.id,
    artistName: firstSong?.artist?.name,
  };
}

// Choose a song title from the most popular 50 songs from given ID
async function getSongNameAndTitle(artistObject: any) {
  const artist = await geniusClient.artists.get(artistObject.artistId);
  if (!artist) {
    return null;
  }
  const totalPagesToLoad = 3;

  const foundSongs = [];

  for (let pageIndex = 1; pageIndex <= totalPagesToLoad; pageIndex++) {
    let popularSongs = await artist.songs({
      perPage: 50,
      sort: "popularity",
      page: pageIndex,
    });
    let filteredByArtist = popularSongs.filter(
      (song: any) =>
        song.artist.name.toLowerCase() === artistObject.artistName.toLowerCase()
    );
    foundSongs.push(...filteredByArtist);
    if (foundSongs.length >= 30) {
      break;
    }
  }

  if (foundSongs.length === 0) {
    return null;
  }

  const randomNumb = await getRandomInt(0, foundSongs.length);
  return {
    songTitle: foundSongs[randomNumb].title,
    songArtist: foundSongs[randomNumb].artist.name,
  };
}

async function getSongObject(song: any, artist: any) {
  const searches = await geniusClient.songs.search(song + " " + artist);

  if (!searches || searches.length === 0) {
    return null;
  }

  // Pick first one
  const chosenSong = searches[0];

  // Ok lets get the lyrics
  const songLyrics = await chosenSong.lyrics();
  const songTitle = chosenSong.title;
  const songArt = chosenSong.thumbnail;
  const songUrl = chosenSong.url;
  return {
    lyrics: songLyrics,
    title: songTitle,
    art: songArt,
    url: songUrl,
    artist: artist,
  };
}

function getSectionFromSongObject(songObject: any) {
  // purifies lyrics string a bit
  songObject.lyrics = songObject.lyrics.replace("]\n\n[", "");
  try {
    songObject.lyrics = songObject.lyrics.replace("Embed", "");
  } catch (error) {}

  // counts how many sections in the song with lyrics are there
  const count = (songObject.lyrics.match(/]\n/g) || []).length;

  const randomSectionNumber = getRandomInt(0, count);

  // locates and slices section
  const position1 =
    nth_occurrence(songObject.lyrics, "]\n", randomSectionNumber) + 1; // Plus one is needed to delete ']' character
  const position2 = nth_occurrence(
    songObject.lyrics,
    "\n[",
    randomSectionNumber
  );

  return songObject.lyrics.slice(position1, position2);
}

export async function getRandomSongSectionByArtist(messageArguments: any) {
  logger.info(`Getting random song for message ${messageArguments}`);
  try {
    return await retry(
      async () => {
        logger.info(`Retrieving random song for message ${messageArguments}`);
        const artistId = await getArtistID(messageArguments);
        if (!artistId) {
          let msg = `No Artist ID for message ${messageArguments} found. Aborting or retrying...`;
          logger.error(msg);
          throw new Error(msg);
        }
        logger.info(
          `Artist ID for message ${messageArguments} is ${artistId.artistId}`
        );
        const songChosen = await getSongNameAndTitle(artistId);
        if (!songChosen) {
          let msg = `No song found for Artist ID ${artistId.artistId}. Aborting or retrying...`;
          logger.error(msg);
          throw new Error(msg);
        }
        logger.info(
          `Song title found for artist id ${artistId.artistId}: ${songChosen.songTitle}`
        );
        const songObject = await getSongObject(
          songChosen.songTitle,
          songChosen.songArtist
        );
        if (!songObject) {
          let msg = `No song object found for song title ${songChosen.songTitle}. Aborting or retrying...`;
          logger.error(msg);
          throw new Error(msg);
        }
        logger.info(`Retrieving section from song ${songChosen.songTitle}`);
        let section = await getSectionFromSongObject(songObject);
        if (!section) {
          let msg = `No section found for song title ${songChosen.songTitle}. Aborting or retrying...`;
          logger.error(msg);
          throw new Error(msg);
        }
        return {
          ...songObject,
          section,
        };
      },
      {
        minTimeout: 100,
        retries: 10,
        factor: 1,
      }
    );
  } catch (e) {
    logger.error("Retrieving songs failed for the last time");
    logger.error(e);
    return null;
  }
}
