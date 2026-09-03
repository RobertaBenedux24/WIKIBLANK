import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import api from "../services/api";

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
        <main className="game-page">

            <section className="game-header">

                <p className="game-label">
                    WIKIBLANK
                </p>

                <div className="game-meta">
                    <span>
                        Stato: {game.status}
                    </span>

                    <span>
                        Tentativi: {game.attempts}
                    </span>
                </div>

            </section>


            <section className="game-article-section">

                <h1>Articolo</h1>

                <div className="game-text">
                    {renderMaskedText
                        ? renderMaskedText()
                        : game.masked_text
                    }
                </div>

            </section>


            {game.status === "in_progress" && (

                <section className="game-controls">

                    <div className="game-control-card">

                        <h2>Prova una parola</h2>

                        <p>
                            Inserisci una parola che pensi sia presente
                            nell'articolo.
                        </p>

                        <form
                            className="game-form"
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

                    </div>


                    <div className="game-control-card">

                        <h2>Indovina il titolo</h2>

                        <p>
                            Quando pensi di aver capito l'articolo,
                            prova a indovinarne il titolo.
                        </p>

                        <form
                            className="game-form"
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

                    </div>

                </section>
            )}


            {game.status === "in_progress" && (

                <div className="game-abandon">

                    <button onClick={handleAbandon}>
                        Abbandona partita
                    </button>

                </div>
            )}


            {game.status !== "in_progress" && (

                <section className="game-finished">

                    <h2>Partita terminata</h2>

                    <p>
                        Titolo corretto:
                        <strong> {game.article_title}</strong>
                    </p>

                    <button onClick={() => navigate("/play")}>
                        Nuova partita
                    </button>

                </section>
            )}


            {message && (
                <p className="game-message">
                    {message}
                </p>
            )}

            {error && (
                <p className="game-error">
                    {error}
                </p>
            )}

        </main>
    );
}

export default Game;