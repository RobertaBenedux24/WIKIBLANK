const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../db");
const authToken = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Tutti i campi sono obbligatori"
            });
        }

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1 OR username = $2",
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "Username o email già utilizzati"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, username, email, created_at`,
            [username, email, passwordHash]
        );

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

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email e password sono obbligatorie"
            });
        }

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Email o password non corretti"
            });
        }

        const user = result.rows[0];

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

router.get("/profile", authToken, async (req, res) => {
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

module.exports = router;