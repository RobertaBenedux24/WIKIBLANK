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

dotenv.config(); //dice a Node di caricare le variabili presenti nel futuro file

const app = express(); //crea la nostra applicazione Express
const PORT = 3000;

app.use(cors());
app.use(express.json()); //permette al backen di ricevere JSON

// collega le rotte di autenticazione
app.use("/api", authRoutes);

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

app.post("/api/games", authToken, async (req, res) => {
    try {
        const article = await getRandomArticle();

        const result = await pool.query(
            `INSERT INTO games (
                user_id,
                article_title,
                article_text
            )
            VALUES ($1, $2, $3)
            RETURNING id, user_id, status, attempts, guessed_words, started_at`,
            [
                req.user.userId,
                article.title,
                article.text
            ]
        );

        res.status(201).json({
            message: "Partita creata con successo",
            game: result.rows[0]
        });

    } catch (error) {
        console.error("Errore creazione partita:", error);

        res.status(500).json({
            message: "Errore durante la creazione della partita"
        });
    }
});

app.get("/api/games/:id", authToken, async (req, res) => {
    try {
        const gameId = req.params.id;

        const result = await pool.query(
            `SELECT *
             FROM games
             WHERE id = $1 AND user_id = $2`,
            [gameId, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Partita non trovata"
            });
        }

        const game = result.rows[0];

        const maskedText = maskText(
            game.article_text,
            game.guessed_words
        );

        const responseGame = {
            id: game.id,
            status: game.status,
            attempts: game.attempts,
            guessed_words: game.guessed_words,
            started_at: game.started_at,
            finished_at: game.finished_at,
            masked_text: maskedText
        };

        if (game.status !== "in_progress") {
            responseGame.article_title = game.article_title;
        }

        res.status(200).json({
            game: responseGame
        });

    } catch (error) {
        console.error("Errore recupero partita:", error);

        res.status(500).json({
            message: "Errore durante il recupero della partita"
        });
    }
});

app.post("/api/games/:id/guess", authToken, async (req, res) => {
    try {
        const gameId = req.params.id;
        const { word } = req.body;

        // Controllo che sia stata inserita una parola
        if (!word || !word.trim()) {
            return res.status(400).json({
                message: "Inserisci una parola valida"
            });
        }

        // Recuperiamo la partita dell'utente autenticato
        const gameResult = await pool.query(
            `SELECT *
             FROM games
             WHERE id = $1 AND user_id = $2`,
            [gameId, req.user.userId]
        );

        if (gameResult.rows.length === 0) {
            return res.status(404).json({
                message: "Partita non trovata"
            });
        }

        const game = gameResult.rows[0];

        // Non permettiamo tentativi su partite già terminate
        if (game.status !== "in_progress") {
            return res.status(400).json({
                message: "La partita è già terminata"
            });
        }

        const normalizedWord = word.trim().toLowerCase();

        // Controlliamo se la parola era già stata tentata correttamente
        const alreadyGuessed = game.guessed_words.some(
            guessedWord => guessedWord.toLowerCase() === normalizedWord
        );

        if (alreadyGuessed) {
            return res.status(400).json({
                message: "Questa parola è già stata indovinata"
            });
        }

        // Cerchiamo tutte le parole presenti nell'articolo
        const articleWords = game.article_text.match(
            /[\p{L}\p{M}]+/gu
        ) || [];

        const wordExists = articleWords.some(
            articleWord => articleWord.toLowerCase() === normalizedWord
        );

        let updatedGuessedWords = game.guessed_words;

        if (wordExists) {
            updatedGuessedWords = [
                ...game.guessed_words,
                normalizedWord
            ];
        }

        // Aumentiamo sempre il numero di tentativi
        const updateResult = await pool.query(
            `UPDATE games
             SET guessed_words = $1,
                 attempts = attempts + 1
             WHERE id = $2
             RETURNING *`,
            [updatedGuessedWords, gameId]
        );

        const updatedGame = updateResult.rows[0];

        const maskedText = maskText(
            updatedGame.article_text,
            updatedGame.guessed_words
        );

        res.status(200).json({
            correct: wordExists,
            message: wordExists
                ? "Parola corretta!"
                : "Parola non presente nell'articolo",
            attempts: updatedGame.attempts,
            guessed_words: updatedGame.guessed_words,
            masked_text: maskedText
        });

    } catch (error) {
        console.error("Errore tentativo parola:", error);

        res.status(500).json({
            message: "Errore durante il tentativo"
        });
    }
});

app.post("/api/games/:id/title", authToken, async (req, res) => {
    try {
        const gameId = req.params.id;
        const { title } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Inserisci un titolo valido"
            });
        }

        const gameResult = await pool.query(
            `SELECT *
             FROM games
             WHERE id = $1 AND user_id = $2`,
            [gameId, req.user.userId]
        );

        if (gameResult.rows.length === 0) {
            return res.status(404).json({
                message: "Partita non trovata"
            });
        }

        const game = gameResult.rows[0];

        if (game.status !== "in_progress") {
            return res.status(400).json({
                message: "La partita è già terminata"
            });
        }

        const guessedTitle = normalizeText(title);
        const correctTitle = normalizeText(game.article_title);

        if (guessedTitle !== correctTitle) {
            return res.status(200).json({
                correct: false,
                message: "Titolo non corretto"
            });
        }

        const updateResult = await pool.query(
            `UPDATE games
             SET status = 'won',
                 finished_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING id, status, article_title, started_at, finished_at, attempts`,
            [gameId]
        );

        res.status(200).json({
            correct: true,
            message: "Titolo corretto! Hai vinto!",
            game: updateResult.rows[0]
        });

    } catch (error) {
        console.error("Errore tentativo titolo:", error);

        res.status(500).json({
            message: "Errore durante il tentativo del titolo"
        });
    }
});

app.post("/api/games/:id/abandon", authToken, async (req, res) => {
    try {
        const gameId = req.params.id;

        const gameResult = await pool.query(
            `SELECT *
             FROM games
             WHERE id = $1 AND user_id = $2`,
            [gameId, req.user.userId]
        );

        if (gameResult.rows.length === 0) {
            return res.status(404).json({
                message: "Partita non trovata"
            });
        }

        const game = gameResult.rows[0];

        if (game.status !== "in_progress") {
            return res.status(400).json({
                message: "La partita è già terminata"
            });
        }

        const updateResult = await pool.query(
            `UPDATE games
             SET status = 'abandoned',
                 finished_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING id,
                       status,
                       article_title,
                       attempts,
                       guessed_words,
                       started_at,
                       finished_at`,
            [gameId]
        );

        res.status(200).json({
            message: "Partita abbandonata",
            game: updateResult.rows[0]
        });

    } catch (error) {
        console.error("Errore abbandono partita:", error);

        res.status(500).json({
            message: "Errore durante l'abbandono della partita"
        });
    }
});

app.get("/api/games", authToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                id,
                status,
                attempts,
                guessed_words,
                started_at,
                finished_at
             FROM games
             WHERE user_id = $1
             ORDER BY started_at DESC`,
            [req.user.userId]
        );

        res.status(200).json({
            games: result.rows
        });

    } catch (error) {
        console.error("Errore recupero partite:", error);

        res.status(500).json({
            message: "Errore durante il recupero delle partite"
        });
    }
});

app.get("/api/completed-games", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                g.id,
                g.status,
                g.article_title,
                g.article_text,
                g.guessed_words,
                g.attempts,
                g.started_at,
                g.finished_at,
                u.username
             FROM games g
             JOIN users u ON g.user_id = u.id
             WHERE g.status IN ('won', 'abandoned')
             ORDER BY g.finished_at DESC`
        );

        const games = result.rows.map(game => {
            const maskedText = maskText(
                game.article_text,
                game.guessed_words
            );

            const durationSeconds = Math.floor(
                (new Date(game.finished_at) - new Date(game.started_at)) / 1000
            );

            return {
                id: game.id,
                username: game.username,
                status: game.status,
                article_title: game.article_title,
                masked_text: maskedText,
                attempts: game.attempts,
                duration_seconds: durationSeconds,
                started_at: game.started_at,
                finished_at: game.finished_at
            };
        });

        res.status(200).json({
            games: games
        });

    } catch (error) {
        console.error("Errore recupero partite concluse:", error);

        res.status(500).json({
            message: "Errore durante il recupero delle partite concluse"
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

app.get("/api/stats", authToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                COUNT(*) AS total_games,
                COUNT(*) FILTER (WHERE status = 'won') AS wins,
                COUNT(*) FILTER (WHERE status = 'abandoned') AS abandoned_games,
                COUNT(*) FILTER (WHERE status = 'in_progress') AS games_in_progress,
                COALESCE(SUM(attempts), 0) AS total_attempts,
                AVG(
                    CASE
                        WHEN status = 'won'
                        THEN EXTRACT(EPOCH FROM (finished_at - started_at))
                    END
                ) AS average_win_time_seconds
             FROM games
             WHERE user_id = $1`,
            [req.user.userId]
        );

        const stats = result.rows[0];

        res.status(200).json({
            stats: {
                total_games: Number(stats.total_games),
                wins: Number(stats.wins),
                abandoned_games: Number(stats.abandoned_games),
                games_in_progress: Number(stats.games_in_progress),
                total_attempts: Number(stats.total_attempts),
                average_win_time_seconds:
                    stats.average_win_time_seconds !== null
                        ? Math.round(Number(stats.average_win_time_seconds))
                        : null
            }
        });

    } catch (error) {
        console.error("Errore statistiche utente:", error);

        res.status(500).json({
            message: "Errore durante il recupero delle statistiche"
        });
    }
});

//avvia il server
app.listen(PORT, () => {
    console.log(`Server WIKIBLANK avviato sulla porta ${PORT}`);
});