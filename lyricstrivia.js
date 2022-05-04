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
  var first_index = string.indexOf(char);
  var length_up_to_first_index = first_index + 1;

  if (nth == 1) {
    return first_index;
  } else {
    var string_after_first_occurrence = string.slice(length_up_to_first_index);
    var next_occurrence = nth_occurrence(
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

// Get ID from argument
async function getArtistID(artist) {
  const searches = await geniusClient.songs.search(artist);
  const firstSong = searches[0];
  artistID = await firstSong.artist.id;

  return artistID
}

// Choose a song title from the most popular 50 songs from given ID
async function getSongNameAndTitle(id) {
  const artist = await geniusClient.artists.get(id);
  const popularSongs = await artist.songs({
    perPage: 50,
    sort: 'popularity'
  });
  const randomNumb = await getRandomInt(0, popularSongs.length)
  const songChosen = await {
    songTitle: popularSongs[randomNumb].title,
    songArtist: popularSongs[randomNumb].artist.name,
  }

  return songChosen
}

async function getSongObject(song, artist) {
  const searches = await geniusClient.songs.search(song + ' ' + artist);

  // Pick first one
  const chosenSong = searches[0];

  // Ok lets get the lyrics
  const songLyrics = await chosenSong.lyrics();
	const songTitle = await chosenSong.title;
	const songArt = await chosenSong.thumbnail;
	const songUrl = await chosenSong.url;
  const songArtist = artist

  const songObject = await {
    lyrics: songLyrics,
    title: songTitle,
    art: songArt,
    url: songUrl,
    artist: songArtist
  }

  return songObject;
}

function getSectionFromSongObject(songObject){
  // purifies lyrics string a bit
  songObject.lyrics = songObject.lyrics.replace("]\n\n[", "");
  try {
    songObject.lyrics = songObject.lyrics.replace("Embed", "");
  } catch (error) {}

  // counts how many sections in the song with lyrics are there
  var count = (songObject.lyrics.match(/]\n/g) || []).length;

  randomSectionNumber = getRandomInt(0, count);

  // locates and slices section
  let position1 = nth_occurrence(songObject.lyrics, "]\n", randomSectionNumber) + 1; // Plus one is needed to delete ']' character
  let position2 = nth_occurrence(songObject.lyrics, "\n[", randomSectionNumber);

  sectionChosen = songObject.lyrics.slice(position1, position2);

  return sectionChosen;
}


// getArtistID('Red Hot Chili Peppers').then(artistID => {
//   getSongNameAndTitle(artistID).then(songChosen => {
//     getSongObject(songChosen.songTitle, songChosen.songArtist).then(songObject => {
//       console.log(getSectionFromSongObject(songObject))
//     })
//   })
// })

module.exports = { getArtistID, getSongNameAndTitle, getSongObject, getSectionFromSongObject};