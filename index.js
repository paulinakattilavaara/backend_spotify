/*
Jag vill:
hämta mina spellistor från spotify API ✅
spara dem i neon✅
skapa api endpoints för spellistor✅
senare i frontend (annat projekt) visa dem på sidan
*/

import express from "express";
import pool from "./db.js"
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

const apiEndpoints = {
    name: "Pau's Playlists API",
    description: "This API contains my Spotify playlists (or at least a fraction of them) 😅",
    version: "1.0",
    endpoints: {
        GET: {
            "/playlists": "Retrieve all playlists",
            "/playlists/:id": "Retrieve a specific playlist",
            "/songs": "Retrieve all songs in playlists",
            "/songs/:id": "Retrieve a single song",
            "/:id/songs": "Retrieve all songs from specific playlist"
        }
    }
};

// Visar tillgängliga endpoints för mitt API
app.get("/", (req, res) => {
    res.json(apiEndpoints);
});

// Hämta alla spellistor
app.get("/playlists", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM playlists");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Något gick fel vid hämtning av spellistor.");
    }
});

// Hämta spellista med visst id
app.get("/playlists/:id", async (req, res) => {
    const playlistId = req.params.id;
    try {
        const result = await pool.query("SELECT * FROM playlists WHERE id = $1", [playlistId]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Något gick fel vid hämtning av spellistan.");
    }
});

// Hämta alla sånger
app.get("/songs", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM songs");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Något gick fel vid hämtning av låtar.");
    }
});

// Hämta en individuell sång
app.get("/songs/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await pool.query("SELECT * FROM songs where id = $1", [id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Något gick fel vid hämtning av låten.");
    }
});

// Hämta alla sånger från specifik spellista
app.get("/:id/songs", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await pool.query("SELECT * FROM songs WHERE playlist_id = $1", [id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Något gick fel vid hämtning av låtar.");
    }
});

/* 
This function is for retrieving data from my neon database with my collected spotify playlists (from spotify API),
and turning them into songs with id, title, artist, spotify_url, added_by and playlist_id
*/
const getSongsFromPlaylists = async (playlist_id) => {
    const query = `
     INSERT INTO songs (title, artist, spotify_url, added_by, playlist_id)
        SELECT
            jsonb_array_elements(content::jsonb)->'track'->>'name' AS title,
            (jsonb_array_elements(content::jsonb)->'track'->'artists'->0->>'name') AS artist,
            jsonb_array_elements(content::jsonb)->'track'->'external_urls'->>'spotify' AS spotify_url,
            jsonb_array_elements(content::jsonb)->'added_by'->>'id' AS added_by,
            playlists.id AS playlist_id
        FROM playlists
        WHERE playlists.id = $1;
        `

    try {
        const res = await pool.query(query, [playlist_id]);
        console.log("Antal insatta låtar:", res.rowCount);
    } catch (err) {
        console.error("Fel vid insättning av låtar:", err);
    } finally {
        await pool.end();
    }
}

app.listen(PORT, () => {
    if (!process.env.PORT) {
        console.log(`Servern körs på http://localhost:${PORT}`);
    } else {
        console.log(`Servern körs på port ${PORT}`);
    }
});