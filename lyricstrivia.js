const { logger } = require("./logger");
const retry = require("async-retry");

const Genius = require("genius-lyrics");
const fs = require("fs");
const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
const geniusClient = new Genius.Client(config.geniusToken);

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// https://stackoverflow.com/questions/12744995/finding-the-nth-occurrence-of-a-character-in-a-string-in-javascript
function nth_occurrence(string, char, nth) {
  const first_index = string.indexOf(char);
  const length_up_to_first_index = first_index + 1;

  if (nth === 1) {
    return first_index;
  } else {
    const string_after_first_occurrence = string.slice(
      length_up_to_first_index
    );
    const next_occurrence = nth_occurrence(
      string_after_first_occurrence,
      char,
      nth - 1
    );

    if (next_occurrence === -1) {
      return -1;
    } else {
      return length_up_to_first_index + next_occurrence;
    }
  }
}

async function getArtistID(artist) {
  const searches = await geniusClient.songs.search(artist);
  if (searches.length === 0) {
    return null;
  }
  const firstSong = searches[getRandomInt(1, 3)]; // max 10, coldplay returns coldplay and chainsmokers at 1 so we start at second entry.
  const artistObject = {
    artistId: firstSong.artist?.id,
    artistName: firstSong?.artist?.name,
  };
  return artistObject;
}

// Choose a song title from the most popular 50 songs from given ID
async function getSongNameAndTitle(artistObject) {
  const artist = await geniusClient.artists.get(artistObject.artistId);
  if (!artist) {
    return null;
  }
  const totalPagesToLoad = 3;

  const foundSongs = [];

  // NOTE:
  // I'm not sure what happens if you ask for a page that is out of bounds, e.g. when there is only one page for an artist
  // Maybe it throws an error. In that case, you have to catch it of course
  // R: returns empty array
  for (let pageIndex = 1; pageIndex <= totalPagesToLoad; pageIndex++) {
    let popularSongs = await artist.songs({
      perPage: 50,
      sort: "popularity",
      page: pageIndex,
    });
    let filteredByArtist = popularSongs.filter(
      (song) =>
        song.artist.name.toLowerCase() === artistObject.artistName.toLowerCase()
    );
    foundSongs.push(...filteredByArtist);
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

async function getSongObject(song, artist) {
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

function getSectionFromSongObject(songObject) {
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

async function getRandomSongSectionByArtist(messageArguments) {
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
        logger.info(`Artist ID for message ${messageArguments} is ${artistId}`);
        const songChosen = await getSongNameAndTitle(artistId);
        if (!songChosen) {
          let msg = `No song found for Artist ID ${artistId}. Aborting or retrying...`;
          logger.error(msg);
          throw new Error(msg);
        }
        logger.info(
          `Song title found for artist id ${artistId}: ${songChosen.songTitle}`
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

module.exports = {
  getRandomSongSectionByArtist,
};
