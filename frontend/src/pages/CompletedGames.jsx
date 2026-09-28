import { useEffect, useState } from "react";
import { formatTime } from "../utils/formatTime";

import api from "../services/api";

function CompletedGames() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadCompletedGames = async () => {
            try {
                const response = await api.get("/completed-games");

                setGames(response.data.games);

            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Errore durante il recupero delle partite concluse"
                );
            } finally {
                setLoading(false);
            }
        };

        loadCompletedGames();
    }, []);

    if (loading) {
        return <p>Caricamento partite concluse...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <main className="completed-page">

            <section className="completed-header">
                <h1>Partite concluse</h1>

                <p>
                    Esplora le partite terminate dagli altri giocatori
                    e scopri come hanno risolto gli articoli.
                </p>
            </section>


            {games.length === 0 ? (

                <section className="completed-empty">
                    <h2>Nessuna partita conclusa</h2>

                    <p>
                        Non ci sono ancora partite da mostrare.
                    </p>
                </section>

            ) : (

                <section className="completed-list">

                    {games.map((game) /*Ttrasformo ogni oggetto in una card */ => (

                        <article
                            key={game.id}
                            className="completed-card"
                        >

                            <div className="completed-card-top">

                                <div>
                                    <p className="completed-game-id">
                                        PARTITA #{game.id}
                                    </p>

                                    <h2>
                                        {game.article_title}
                                    </h2>

                                    <p className="completed-player">
                                        Giocata da{" "}
                                        <strong>{game.username}</strong>
                                    </p>
                                </div>


                                <span
                                    className={`completed-status ${
                                        game.status
                                    }`}
                                >
                                    {game.status === "won"
                                        ? "VINTA"
                                        : "ABBANDONATA"
                                    }
                                </span>

                            </div>


                            <div className="completed-meta">

                                <span>
                                    <strong>{game.attempts}</strong>
                                    {" "}tentativi
                                </span>

                                <span>
                                    {formatTime(game.duration_seconds)}
                                </span>

                                <span>
                                    {new Date(
                                        game.finished_at
                                    ).toLocaleDateString("it-IT")}
                                </span>

                            </div>


                            <div className="completed-preview">

                                <p className="completed-preview-label">
                                    TESTO SCOPERTO
                                </p>

                                <p className="completed-preview-text">
                                    {game.masked_text}
                                </p>

                            </div>

                        </article>

                    ))}

                </section>
            )}

        </main>
    );
}

export default CompletedGames;