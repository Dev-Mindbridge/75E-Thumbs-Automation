import database from './config/database.js'
import {createServer} from "http";
import express from "express";
import cron from 'node-cron';
import {readFile, writeFile} from 'fs/promises';
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

async function automation() {
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
            payload,
            {
                headers: {
                    'Authorization': `${authRes.token_type} ${authRes.token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log("Successful API Response Data:", response.data);

    } catch (error) {
        console.error(error.message);
    }
}

server.listen(5000, async () => {

    cron.schedule('*/1 * * * *', automation, {
        scheduled: true,
    });

})
