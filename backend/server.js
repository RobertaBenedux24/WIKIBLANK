//importazione delle librerie installate
const express = require("express");
const cors = require("cors"); //permette al frontend e backend di comunicare tra loro
const dotenv = require("dotenv") //serve per leggere configurazioni riservate da un file .env, come i dati di connessione a PostgreSQ
const pool = require("./db"); //importa ciò che viene esportato dal dile db.js e lo chiamiamo pool
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authToken = require("./middleware/auth"); //importa il middleware
const getRandomArticle = require("./services/wikipedia"); //importa la funzione per l'articolo casuale
const maskText = require("./utils/secretText");
const normalizeText = require("./utils/normalizeText");
const authRoutes = require("./routes/authRoutes");
const gameRoutes = require("./routes/gameRoutes");

dotenv.config(); //dice a Node di caricare le variabili presenti nel futuro file

const app = express(); //crea la nostra applicazione Express
const PORT = 3000;

app.use(cors());
app.use(express.json()); //permette al backen di ricevere JSON

// collega le rotte di autenticazione
app.use("/api", authRoutes);

//collega le rotte relativa alle partite
app.use("/api/games", gameRoutes);

//quando qualcuno effettua una richiesta (GET) all'indirizzo / risponde con JSON
app.get("/", (req, res) => {
    res.json({
        message: "Backend WIKIBLANK funzionante!"
    });
});

app.get("/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Connessione a PostgreSQL riuscita!",
            databaseTime: result.rows[0].now
        });
    } catch (error) {
        console.error("Errore connessione database:", error);

        res.status(500).json({
            message: "Errore nella connessione a PostgreSQL"
        });
    }
});

app.get("/api/wiki/random", async (req, res) => {
    try {
        const article = await getRandomArticle();

        res.status(200).json(article);

    } catch (error) {
        console.error("Errore MediaWiki:", error);

        res.status(500).json({
            message: "Errore durante il recupero dell'articolo"
        });
    }
});

app.get("/api/classification", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                u.id AS user_id,
                u.username,
                COUNT(g.id) AS wins,
                AVG(
                    EXTRACT(EPOCH FROM (g.finished_at - g.started_at))
                ) AS average_time_seconds
             FROM users u
             JOIN games g ON g.user_id = u.id
             WHERE g.status = 'won'
             GROUP BY u.id, u.username
             ORDER BY
                average_time_seconds ASC,
                wins DESC`
        );

        const list = result.rows.map((row, index) => ({
            position: index + 1,
            user_id: row.user_id,
            username: row.username,
            wins: Number(row.wins),
            average_time_seconds: Math.round(
                Number(row.average_time_seconds)
            )
        }));

        res.status(200).json({
            list: list
        });

    } catch (error) {
        console.error("Errore classifica:", error);

        res.status(500).json({
            message: "Errore durante il recupero della classifica"
        });
    }
});

//avvia il server
app.listen(PORT, () => {
    console.log(`Server WIKIBLANK avviato sulla porta ${PORT}`);
});