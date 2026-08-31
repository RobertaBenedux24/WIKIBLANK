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

    return (
        <div className="page">

            <h1>WIKIBLANK</h1>

            <p>
                Stato: {game.status}
            </p>

            <p>
                Tentativi: {game.attempts}
            </p>

            <h2>Articolo</h2>

            <div className="game-text">
                {game.masked_text}
            </div>


            {game.status === "in_progress" && (
                <>
                    <h2>Prova una parola</h2>

                    <form onSubmit={handleWordGuess}>
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


                    <h2>Prova il titolo</h2>

                    <form onSubmit={handleTitleGuess}>
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


                    <button onClick={handleAbandon}>
                        Abbandona partita
                    </button>
                </>
            )}


            {game.status !== "in_progress" && (
                <div>
                    <h2>Partita terminata</h2>

                    <p>
                        Titolo corretto: {game.article_title}
                    </p>

                    <button onClick={() => navigate("/play")}>
                        Nuova partita
                    </button>
                </div>
            )}


            {message && (
                <p>{message}</p>
            )}

            {error && (
                <p>{error}</p>
            )}

        </div>
    );
}

export default Game;