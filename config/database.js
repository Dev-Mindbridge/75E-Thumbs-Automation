import sql from "mssql";
import dotEnv from "dotenv";

dotEnv.config();

const config = {
    user: `${process.env.MSSQL_USER}`,
    password: `${process.env.MSSQL_PASSWORD}`,
    server: `${process.env.MSSQL_SERVER}`,
    database: `${process.env.MSSQL_DATABASE}`,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function database() {
    try {
        const pool = await sql.connect(config);
        console.log("MSSQL Connection Pool established successfully.");
        return pool;
    } catch (err) {
        console.error("MSSQL Database Connection Error:", err.message);
    }
}

export default database();