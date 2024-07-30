const { defineConfig } = require("cypress");
const { Client } = require("pg");
require("dotenv").config();

const couchDbUrl = `http://${process.env.COUCHDB_USER}:${process.env.COUCHDB_PASSWORD}@${process.env.COUCHDB_SERVER}:${process.env.COUCHDB_PORT}`;
console.log(couchDbUrl);
const nano = require("nano")(couchDbUrl);

const couchDbName = process.env.COUCHDB_NAME;
const database = nano.db.use(couchDbName);

module.exports = defineConfig({
    env: {
        hostAddress: process.env.FRONTEND_HOST_ADDRESS,
        frontPort: process.env.FRONTEND_PORT,
    },
    e2e: {
        projectId: "xqzf7f",
        baseUrl: `http://${process.env.FRONTEND_HOST_ADDRESS}:${process.env.FRONTEND_PORT}`,
        pageLoadTimeout: 30_000,
        video: true,
        experimentalMemoryManagement: true,
        experimentalStudio: true,
        experimentalRunAllSpecs: true,
        viewportWidth: 1280,
        viewportHeight: 720,
        setupNodeEvents(on, config) {
            on("task", {
                async runQuery(query) {
                    const clientConfig = {
                        host: process.env.DB_SERVER,
                        database: process.env.DB_NAME,
                        user: process.env.DB_USER,
                        password: process.env.DB_PASS,
                        port: process.env.DB_PORT,
                        ssl: false,
                        connectionTimeoutMillis: 10_000,
                    };

                    const client = new Client(clientConfig);

                    try {
                        await client.connect();
                        const res = await client.query(query);
                        await client.end();
                        // console.log(`Query <${query}> result: ${JSON.stringify({ rows: res.rows, rowCount: res.rowCount })}`);
                        return res;
                    } catch (err) {
                        console.error("Database connection error:", err);
                        await client.end();
                        throw err;
                    }
                },
                async saveDoc(doc) {
                    const db = database;

                    try {
                        const response = await db.insert(doc);
                        return response;
                    } catch (error) {
                        console.error("Error saving document to CouchDB:", error);
                        throw error;
                    }
                },
                async getDoc({ id }) {
                    const nanoInstance = nano(couchDbUrl);
                    const db = nanoInstance.use(couchDbName);

                    try {
                        const doc = await db.get(id);
                        return doc;
                    } catch (error) {
                        console.error("Error getting document from CouchDB:", error);
                        throw error;
                    }
                },
                async deleteDoc({ id, rev }) {
                    const nanoInstance = nano(couchDbUrl);
                    const db = nanoInstance.use(couchDbName);

                    try {
                        const response = await db.destroy(id, rev);
                        return response;
                    } catch (error) {
                        console.error("Error deleting document from CouchDB:", error);
                        throw error;
                    }
                },
            });

            return config;
        },
    },
});
