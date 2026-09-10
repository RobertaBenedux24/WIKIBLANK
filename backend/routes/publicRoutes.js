const express = require("express");

const pool = require("../db");
const getRandomArticle = require("../services/wikipedia");
const { maskText } = require("../utils/secretText");

const router = express.Router();


// articolo casuale da Wikipedia
router.get("/wiki/random", async (req, res) => {
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


// partite concluse pubbliche
router.get("/completed-games", async (req, res) => {
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
                game.guessed_words,
                game.article_title
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


// classifica pubblica
router.get("/classification", async (req, res) => {
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

        const classification = result.rows.map((row, index) => ({
            position: index + 1,
            user_id: row.user_id,
            username: row.username,
            wins: Number(row.wins),
            average_time_seconds: Math.round(
                Number(row.average_time_seconds)
            )
        }));

        res.status(200).json({
            classification: classification
        });

    } catch (error) {
        console.error("Errore classifica:", error);

        res.status(500).json({
            message: "Errore durante il recupero della classifica"
        });
    }
});

module.exports = router;