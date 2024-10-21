import pool from "./db.js";
import dotenv from "dotenv";
dotenv.config();

const SPOTIFY_TOKEN = process.env.SPOTIFY_TOKEN;


async function getSpotifyPlaylistData() {
    const url = "https://api.spotify.com/v1/playlists/7BHpzJG5H60Fb7Fv8HThio/tracks?fields=items(track(name,artists(name),external_urls),added_by.id)";

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${SPOTIFY_TOKEN}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch data from Spotify: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items;
}

async function insertPlaylistData(content) {
    try {
        const playlist = await pool.query(
            'INSERT INTO playlists (content) VALUES ($1) RETURNING *',
            [content]
        );
        return playlist.rows[0];
    } catch (err) {
        throw new Error(`Database insertion failed: ${err.message}`);
    }
}

async function fetchAndInsertPlaylist() {
    try {
        const spotifyData = await getSpotifyPlaylistData();

        const content = JSON.stringify(spotifyData);

        const insertedData = await insertPlaylistData(content);

        console.log('Data inserted successfully:', insertedData);
    } catch (err) {
        console.error(err.message);
    }
}

//fetchAndInsertPlaylist();
