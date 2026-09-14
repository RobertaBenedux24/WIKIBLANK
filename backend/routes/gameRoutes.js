const express = require("express");

const pool = require("../db");
const authToken = require("../middleware/auth");
const getRandomArticle = require("../services/wikipedia");
const {
    maskText,
    getVisibleHintWords
} = require("../utils/secretText");
const normalizeText = require("../utils/normalizeText");

const router = express.Router();


// crea una nuova partita
router.post("/", authToken, async (req, res) => {
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


// lista delle partite dell'utente
router.get("/", authToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                id,
            CASE 
                WHEN status = 'in_progess' THEN NULL
                ELSE article_title
            END AS article_title,
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


// recupera una partita specifica
router.get("/:id", authToken, async (req, res) => {
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

        let maskedText;

        if (game.status === "won") {
            maskedText = game.article_text;
        } else {
            maskedText = maskText(
                game.article_text,
                game.guessed_words,
                game.article_title
            );
        }

        const responseGame = {
            id: game.id,
            status: game.status,
            attempts: game.attempts,
            guessed_words: game.guessed_words,
            wrong_guesses: game.wrong_guesses || [],
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


// tentativo con una parola
router.post("/:id/guess", authToken, async (req, res) => {
    try {
        const gameId = req.params.id;
        const { word } = req.body;

        if (!word || !word.trim()) {
            return res.status(400).json({
                message: "Inserisci una parola valida"
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

        const normalizedWord = word.trim().toLowerCase();

        const visibleHintWords = getVisibleHintWords(
            game.article_text,
            game.article_title
        );

        if (visibleHintWords.has(normalizedWord)) {
            return res.status(400).json({
                message: "Questa parola è già visibile nell'articolo"
            });
        }
        
        const alreadyGuessed = game.guessed_words.some(
            guessedWord => guessedWord.toLowerCase() === normalizedWord
        );

        if (alreadyGuessed) {
            return res.status(400).json({
                message: "Questa parola è già stata indovinata"
            });
        }

        const articleWords = game.article_text.match(
            /[\p{L}\p{M}]+/gu
        ) || [];

        const wordExists = articleWords.some(
            articleWord => articleWord.toLowerCase() === normalizedWord
        );

        /*DEBUG*/
        console.log("Parola inserita:", normalizedWord);
        console.log("Parola presente:", wordExists);
        console.log("Guessed prima:", game.guessed_words);

        let updatedGuessedWords = game.guessed_words || [];
        let updatedWrongGuesses = game.wrong_guesses || [];

        if (wordExists) {

            updatedGuessedWords = [
                ...updatedGuessedWords,
                normalizedWord
            ];

        } else {

            if (!updatedWrongGuesses.includes(normalizedWord)) {
                updatedWrongGuesses = [
                    ...updatedWrongGuesses,
                    normalizedWord
                ];
            }

        }
        const updateResult = await pool.query(
            `UPDATE games
            SET guessed_words = $1,
                wrong_guesses = $2,
                attempts = attempts + 1
            WHERE id = $3
            RETURNING *`,
            [
                updatedGuessedWords,
                updatedWrongGuesses,
                gameId
            ]
        );

        const updatedGame = updateResult.rows[0];
        /* DEBUG */
        console.log("Guessed dopo:", updatedGame.guessed_words);

        const maskedText = maskText(
            updatedGame.article_text,
            updatedGame.guessed_words,
            updatedGame.article_title
        );

        res.status(200).json({
            correct: wordExists,
            message: wordExists
                ? "Parola corretta!"
                : "Parola non presente nell'articolo",
            attempts: updatedGame.attempts,
            guessed_words: updatedGame.guessed_words,
            wrong_guesses: updatedGame.wrong_guesses,
            masked_text: maskedText
        });

    } catch (error) {
        console.error("Errore tentativo parola:", error);

        res.status(500).json({
            message: "Errore durante il tentativo"
        });
    }
});


// tentativo del titolo
router.post("/:id/title", authToken, async (req, res) => {
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


// abbandona una partita
router.post("/:id/abandon", authToken, async (req, res) => {
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


// statistiche personali
router.get("/user/stats", authToken, async (req, res) => {
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

module.exports = router;