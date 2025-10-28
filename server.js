import database from './config/database.js'
import {createServer} from "http";
import express from "express";
import cron from 'node-cron';
import {readFile, writeFile} from 'fs/promises';
import axios from "axios";
import moment from 'moment';

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

    const result = await connection.request().query(`SELECT * FROM dbo.ThumbLogs WHERE synced = 0`)

    const payload = {
        values: result.recordset.map(v => ({
            userid: v.userid.toString(),
            username: v.username || '',
            machine: v.machine,
            status: v.status,
            logdateTime: moment(v.logdateTime).format('YYYY-MM-DD HH:mm:ss')
        }))
    }

    const authPayload = {
        email: "itadmin@mindbridge.net",
        password: "123"
    }

    if (result.recordset.length > 0) {

        console.log("records found")

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

            await connection.request().query(`UPDATE ThumbLogs SET synced = 1 WHERE synced = 0`)

            const res = response.data
            await writeFile(FILE, JSON.stringify({ ID: res.last_inserted_id }, null, 2), 'utf8');

        } catch (error) {
            console.error(error);
        }
    } else {
        console.log("Already updated no more records to be updated")
    }
}

server.listen(5000, async () => {

    cron.schedule('*/60 * * * *', automation, {
        scheduled: true,
    });

})
