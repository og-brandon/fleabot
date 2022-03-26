#Assign your Genius.com credentials and select your artist
import lyricsgenius as genius
import json

geniusCreds = "TOKEN HERE"
artist_name = "Red Hot Chili Peppers"

api = genius.Genius(geniusCreds)
artist = api.search_artist(artist_name, max_songs=278)

rhcp = []
for song in artist.songs:
    rhcp.append({'title': song.title, 'lyrics': song.lyrics, 'art': song.song_art_image_thumbnail_url, 'url': song.url, 'state': song.lyrics_state})

with open('test.json', 'w') as fout:
    json.dump(rhcp , fout)