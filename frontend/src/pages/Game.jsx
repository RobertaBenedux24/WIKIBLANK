import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import api from "../services/api";

import winGif from "../assets/win.gif";

import abandonGif from "../assets/abb.gif";

function Game() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [game, setGame] = useState(null);
    const [word, setWord] = useState("");
    const [title, setTitle] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGame();
    }, [id]);

    const loadGame = async () => {
        try {
            const response = await api.get(`/games/${id}`);

            setGame(response.data.game);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Errore durante il recupero della partita"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleWordGuess = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await api.post(
                `/games/${id}/guess`,
                {
                    word: word
                }
            );

            setMessage(response.data.message);

            setGame((previousGame) => ({
                ...previousGame,
                attempts: response.data.attempts,
                guessed_words: response.data.guessed_words,
                wrong_guesses: response.data.wrong_guesses,
                masked_text: response.data.masked_text
            }));

            setWord("");

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Errore durante il tentativo"
            );
        }
    };

    const handleTitleGuess = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await api.post(
                `/games/${id}/title`,
                {
                    title: title
                }
            );

            setMessage(response.data.message);

            if (response.data.correct) {
                await loadGame();
            }

            setTitle("");

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Errore durante il tentativo del titolo"
            );
        }
    };

    const handleAbandon = async () => {
        setMessage("");
        setError("");

        try {
            const response = await api.post(
                `/games/${id}/abandon`
            );

            setMessage(response.data.message);

            await loadGame();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Errore durante l'abbandono della partita"
            );
        }
    };

    if (loading) {
        return <p>Caricamento partita...</p>;
    }

    if (error && !game) {
        return <p>{error}</p>;
    }

    if (!game) {
        return <p>Partita non trovata</p>;
    }

    const renderMaskedText = () => {

        if (!game?.masked_text) {
            return null;
        }

        const guessedWords = new Set(
            (game.guessed_words || []).map(
                word => word.toLowerCase()
            )
        );

        const parts = game.masked_text.split(
            /([\p{L}\p{M}]+)/gu
        );

        return parts.map((part, index) => {

            if (
                guessedWords.has(
                    part.toLowerCase()
                )
            ) {
                return (
                    <span
                        key={index}
                        className="correct-word"
                    >
                        {part}
                    </span>
                );
            }

            return part;
        });
    };

    return (
        <main
            className={`game-page ${
                game.status === "won" ? "game-page-won" : ""
            }`}
        >

            {/* =========================
                PARTITA IN CORSO
            ========================= */}

            {game.status === "in_progress" && (
                <>
                    <section className="game-header">

                        <div className="game-header-text">

                            <p className="game-status-label">
                                • PARTITA IN CORSO
                            </p>

                            <h1>
                                Indovina l'articolo
                            </h1>

                            <p className="game-description">
                                Scopri le parole nascoste e prova a trovare il titolo.
                            </p>

                        </div>

                        <div className="attempts-box">
                            <span>TENTATIVI</span>
                            <strong>{game.attempts}</strong>
                        </div>

                    </section>


                    <section className="game-article-section">

                        <div className="game-text">
                            {renderMaskedText()}
                        </div>

                    </section>


                    <section className="game-interaction-layout">

                        {/* TROVA UNA PAROLA */}

                        <div className="game-word-panel">

                            <p className="panel-label">
                                TROVA UNA PAROLA
                            </p>

                            <h2>Scopri nuovi indizi</h2>

                            <p className="panel-description">
                                Inserisci una parola che pensi possa
                                essere presente nell'articolo.
                            </p>

                            <form
                                className="game-word-form"
                                onSubmit={handleWordGuess}
                            >
                                <input
                                    type="text"
                                    value={word}
                                    onChange={(event) =>
                                        setWord(event.target.value)
                                    }
                                    placeholder="Inserisci una parola"
                                    required
                                />

                                <button type="submit">
                                    Prova parola
                                </button>
                            </form>


                            {message && (
                                <p className="word-feedback">
                                    {message}
                                </p>
                            )}


                            {game.wrong_guesses &&
                                game.wrong_guesses.length > 0 && (

                                <div className="wrong-guesses">

                                    <p className="wrong-guesses-title">
                                        Parole già provate
                                    </p>

                                    <div className="wrong-guesses-list">

                                        {game.wrong_guesses.map(
                                            (wrongWord, index) => (
                                                <span
                                                    key={index}
                                                    className="wrong-word"
                                                >
                                                    {wrongWord}
                                                </span>
                                            )
                                        )}

                                    </div>

                                </div>
                            )}

                        </div>


                        {/* INDOVINA IL TITOLO */}

                        <aside className="game-title-panel">

                            <p className="panel-label">
                                SOLUZIONE
                            </p>

                            <h2>Indovina il titolo</h2>

                            <p className="panel-description">
                                Hai capito di quale articolo si tratta?
                            </p>

                            <form
                                className="game-title-form"
                                onSubmit={handleTitleGuess}
                            >
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(event) =>
                                        setTitle(event.target.value)
                                    }
                                    placeholder="Titolo dell'articolo"
                                    required
                                />

                                <button type="submit">
                                    Prova titolo
                                </button>
                            </form>

                            <button
                                className="game-abandon-button"
                                onClick={handleAbandon}
                            >
                                Abbandona partita
                            </button>

                        </aside>

                    </section>
                </>
            )}


            {/* =========================
                PARTITA VINTA
            ========================= */}

            {game.status === "won" && (
                <section className="game-win-screen">

                    <img
                        src={winGif}
                        alt="Vittoria"
                        className="game-win-gif"
                    />

                    <p className="game-win-label">
                        TITOLO INDOVINATO
                    </p>

                    <h1 className="game-win-title">
                        {game.article_title}
                    </h1>


                    <div className="game-win-article">
                        {game.masked_text}
                    </div>


                    <div className="game-win-result">

                        <p className="game-win-result-label">
                            PARTITA TERMINATA
                        </p>

                        <h2>
                            Hai indovinato!
                        </h2>

                        <p>
                            Soluzione trovata in{" "}
                            <strong>
                                {game.attempts} tentativi
                            </strong>.
                        </p>

                        <button
                            onClick={() => navigate("/play")}
                        >
                            Nuova partita
                        </button>

                    </div>

                </section>
            )}

            {/*PARTITA ABBANDONATA */}

            {game.status === "abandoned" && (
                <section className="game-abandoned-screen">

                    <img
                        src={abandonGif}
                        alt="Partita abbandonata"
                        className="game-abandoned-gif"
                    />

                    <p className="game-abandoned-label">
                        PARTITA ABBANDONATA
                    </p>

                    <p className="game-abandoned-text">
                        Il titolo corretto è:
                    </p>

                    <h1 className="game-abandoned-title">
                        {game.article_title}
                    </h1>

                    <div className="game-abandoned-actions">

                        <button
                            className="abandoned-exit-button"
                            onClick={() => navigate("/")}
                        >
                            Esci
                        </button>

                        <button
                            className="abandoned-new-button"
                            onClick={() => navigate("/play")}
                        >
                            Nuova partita
                        </button>

                    </div>

                </section>
            )}


            {/* ERRORE */}

            {error && (
                <p className="game-error">
                    {error}
                </p>
            )}

        </main>
    );
}

export default Game;