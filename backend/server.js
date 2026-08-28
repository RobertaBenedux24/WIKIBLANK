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

dotenv.config(); //dice a Node di caricare le variabili presenti nel futuro file

const app = express(); //crea la nostra applicazione Express
const PORT = 3000;

app.use(cors());
app.use(express.json()); //permette al backen di ricevere JSON

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

app.post("/api/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Controllo che tutti i campi siano stati inseriti
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Tutti i campi sono obbligatori"
            });
        }

        // Controllo se esiste già un utente con lo stesso username o email
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1 OR username = $2",
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "Username o email già utilizzati"
            });
        }

        // Trasformiamo la password in un hash
        const passwordHash = await bcrypt.hash(password, 10);

        // Inseriamo il nuovo utente nel database
        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, username, email, created_at`,
            [username, email, passwordHash]
        );

        // Risposta al client
        res.status(201).json({
            message: "Utente registrato con successo",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Errore registrazione:", error);

        res.status(500).json({
            message: "Errore durante la registrazione"
        });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Controlliamo che email e password siano presenti
        if (!email || !password) {
            return res.status(400).json({
                message: "Email e password sono obbligatorie"
            });
        }

        // Cerchiamo l'utente tramite email
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        // Se non troviamo nessun utente
        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Email o password non corretti"
            });
        }

        const user = result.rows[0];

        // Confrontiamo la password inserita con l'hash salvato
        const passwordCorrect = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordCorrect) {
            return res.status(401).json({
                message: "Email o password non corretti"
            });
        }

        const token = jwt.sign(
        {
            userId: user.id,
            username: user.username
        },
         process.env.JWT_SECRET,
        {
            expiresIn: "2h"
        }
    );

        // Login riuscito
        res.status(200).json({
            message: "Login effettuato con successo",
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Errore login:", error);

        res.status(500).json({
            message: "Errore durante il login"
        });
    }
});

app.get("/api/profile", authToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, username, email, created_at FROM users WHERE id = $1",
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Utente non trovato"
            });
        }

        res.status(200).json({
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Errore profilo:", error);

        res.status(500).json({
            message: "Errore durante il recupero del profilo"
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

        res.status(200).json({
            game: {
                id: game.id,
                status: game.status,
                attempts: game.attempts,
                guessed_words: game.guessed_words,
                started_at: game.started_at,
                masked_text: maskedText
            }
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

//avvia il server
app.listen(PORT, () => {
    console.log(`Server WIKIBLANK avviato sulla porta ${PORT}`);
});