//importazione delle librerie installate
const express = require("express");
const cors = require("cors"); //permette al frontend e backend di comunicare tra loro
const dotenv = require("dotenv") //serve per leggere configurazioni riservate da un file .env, come i dati di connessione a PostgreSQ
//const pool = require("./db"); //importa ciò che viene esportato dal dile db.js e lo chiamiamo pool

const authRoutes = require("./routes/authRoutes");
const gameRoutes = require("./routes/gameRoutes");
const publicRoutes = require("./routes/publicRoutes");

dotenv.config(); //dice a Node di caricare le variabili presenti nel futuro file

const app = express(); //crea la nostra applicazione Express
const PORT = 3000;

app.use(cors());
app.use(express.json()); //permette al backen di ricevere JSON

// collega le rotte di autenticazione
app.use("/api", authRoutes);

//collega le rotte relativa alle partite
app.use("/api/games", gameRoutes);

//collega le rotte pubbliche
app.use("/api", publicRoutes);

//quando qualcuno effettua una richiesta (GET) all'indirizzo / risponde con JSON
app.get("/", (req, res) => {
    res.json({
        message: "Backend WIKIBLANK funzionante!"
    });
});

// app.get("/db-test", async (req, res) => {
//     try {
//         const result = await pool.query("SELECT NOW()");

//         res.json({
//             message: "Connessione a PostgreSQL riuscita!",
//             databaseTime: result.rows[0].now
//         });
//     } catch (error) {
//         console.error("Errore connessione database:", error);

//         res.status(500).json({
//             message: "Errore nella connessione a PostgreSQL"
//         });
//     }
// });

//avvia il server
app.listen(PORT, () => {
    console.log(`Server WIKIBLANK avviato sulla porta ${PORT}`);
});