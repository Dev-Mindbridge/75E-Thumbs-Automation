import database from './config/database.js'
import {createServer} from "http";
import express from "express";

const app = express();
const server = createServer(app);

server.listen(5000, async () => {
    const connection = await database

    const result = await connection.request().query('SELECT * FROM ThumbLogs');

    const payload = {
        values: result.recordset.map(v => ({
            userid: v.userid,
            username: v.username || '',
            machine: v.machine,
            status: v.status,
            logdateTime: v.logdateTime
        }))
    }

    // console.log("Sending payload to target URL...");
    // const response = await fetch("TARGET_URL", {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(payload),
    // });
    //
    // if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    // }
    //
    // console.log("✅ Payload successfully posted!");
    // console.log("Target URL Response Status:", response.status);
})
