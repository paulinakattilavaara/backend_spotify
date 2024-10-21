import pool from "./db.js";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";

/* 
I don't use this function anymore, this was just a test for creating a json file for my data. 
*/

const fetchPlaylists = async () => {
    try {
        const result = await pool.query("SELECT * FROM playlists");
        const playlists = result.rows;

        console.log(playlists);

        if (playlists) {
            fs.writeFileSync("playlists.json", JSON.stringify(playlists, null, 2), "utf-8");
            console.log("Playlists have been saved to playlists.json");

        } else {
            console.log("No playlists found.")
        }
        return playlists;

    } catch (err) {
        console.error("Error fetching data", err)
    }
}

//fetchPlaylists();