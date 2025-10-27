import database from './config/database.js'
import {createServer} from "http";
import express from "express";
import cron from 'node-cron';
import { readFile, writeFile } from 'fs/promises';
import axios from "axios";

const MYJSON = {
    "values": [
        {
            "userid": "U1008",
            "username": "Abdul Rehman",
            "machine": "B21",
            "status": "OFF",
            "logdateTime": "2025-10-27 10:01:00"
        },
        {
            "userid": "U0017",
            "username": "Salman",
            "machine": "B51",
            "status": "ON",
            "logdateTime": "2025-10-27 02:10:00"
        },
        {
            "userid": "U0182",
            "username": "Omer",
            "machine": "B21",
            "status": "ON",
            "logdateTime": "2025-10-27 03:10:00"
        },
        {
            "userid": "U0912",
            "username": "Raiz",
            "machine": "B21",
            "status": "ON",
            "logdateTime": "2025-10-27 12:10:00"
        }
    ]
}

const FILE = "record.json"

const app = express();
const server = createServer(app);

async function automation () {
    const connection = await database

    let data = await readFile(FILE, 'utf-8')
    const jsonID = JSON.parse(data)
    console.log(jsonID)

    const payload = {
        values: MYJSON.values.map(v => ({
            userid: v.userid,
            username: v.username || '',
            machine: v.machine,
            status: v.status,
            logdateTime: v.logdateTime
        }))
    }

    console.log(payload)

    const authPayload = {
        email: "itadmin@mindbridge.net",
        password: "123"
    }

    const authResponse = await await fetch("https://buildinglogs75e.asimmajid.com/api/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(authPayload),
    });

    const authRes = await authResponse.json()

    console.log(authRes)

    try {
        const response = await axios.post(
            "https://buildinglogs75e.asimmajid.com/api/machine-logs",
            payload, // Axios automatically serializes this to JSON
            {
                headers: {
                    // Axios uses 'Authorization' correctly and will handle the redirect gracefully
                    'Authorization': `${authRes.token_type} ${authRes.token}`,
                    'Content-Type': 'application/json'
                }
                // Axios's default behavior is often configured to handle this type of redirect
            }
        );

        // Axios rejects the Promise on 3xx, 4xx, and 5xx statuses automatically,
        // but often handles redirects gracefully before rejecting.

        // Response data is directly available on the 'data' property
        console.log("✅ Axios POST Successful. Status:", response.status);
        console.log("Successful API Response Data:", response.data);

    } catch (error) {
        // If an error still occurs (e.g., 401 Unauthorized or network issue)
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("❌ API Call Failed with Status:", error.response.status);
            console.error("❌ Response Data:", error.response.data);
        } else {
            // Something else happened (network error, etc.)
            console.error("❌ Axios Error:", error.message);
        }
    }
}

server.listen(5000, async () => {

    cron.schedule('*/1 * * * *', automation, {
        scheduled: true,
    });

})
