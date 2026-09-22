import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

function Games() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const loadGames = async () => {
            try {
                const response = await api.get("/games");
                setGames(response.data.games);

            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Errore durante il recupero delle partite"
                );
            } finally {
                setLoading(false);
            }
        };

        loadGames();
    }, []);

    if (loading) {
        return <p>Caricamento partite...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <main className="games-page">

            <section className="games-header">

                <h1>Le mie partite</h1>

                <p className="games-description">
                    Qui trovi tutte le partite che hai iniziato,
                    completato o abbandonato.
                </p>

            </section>


            {games.length > 0 && (
                <section className="games-stats">

                    <div className="games-stat-box">
                        <span>TOTALE</span>
                        <strong>{games.length}</strong>
                    </div>

                    <div className="games-stat-box games-stat-won">
                        <span>VINTE</span>
                        <strong>
                            {
                                games.filter(
                                    game => game.status === "won"
                                ).length
                            }
                        </strong>
                    </div>

                    <div className="games-stat-box games-stat-abandoned">
                        <span>ABBANDONATE</span>
                        <strong>
                            {
                                games.filter(
                                    game => game.status === "abandoned"
                                ).length
                            }
                        </strong>
                    </div>

                    <div className="games-stat-box">
                        <span>IN CORSO</span>
                        <strong>
                            {
                                games.filter(
                                    game => game.status === "in_progress"
                                ).length
                            }
                        </strong>
                    </div>

                </section>

            )}


            {games.length === 0 ? (

                <section className="games-empty">

                    <h2>Nessuna partita</h2>

                    <p>
                        Non hai ancora iniziato nessuna partita.
                    </p>

                    <button
                        onClick={() => navigate("/play")}
                    >
                        Inizia a giocare
                    </button>

                </section>

            ) : (

                <section className="games-list">

                    {games.map((game) => (

                        <article
                            key={game.id}
                            className="game-history-card"
                        >

                            <div className="game-history-main">

                                <div className="game-history-top">

                                    <div>
                                        <p className="game-history-id">
                                            PARTITA #{game.id}
                                        </p>

                                        <h2>
                                            {game.status === "in_progress"
                                                ? "Articolo nascosto"
                                                : game.article_title
                                            }
                                        </h2>
                                    </div>


                                    <span
                                        className={`game-status-badge ${
                                            game.status
                                        }`}
                                    >
                                        {game.status === "won"
                                            ? "VINTA"
                                            : game.status === "abandoned"
                                                ? "ABBANDONATA"
                                                : "IN CORSO"
                                        }
                                    </span>

                                </div>


                                <div className="game-history-info">

                                    <span>
                                        <strong>
                                            {game.attempts}
                                        </strong>
                                        {" "}tentativi
                                    </span>

                                    <span>
                                        Iniziata il{" "}
                                        {new Date(
                                            game.started_at
                                        ).toLocaleDateString("it-IT")}
                                    </span>

                                    {game.finished_at && (
                                        <span>
                                            Terminata il{" "}
                                            {new Date(
                                                game.finished_at
                                            ).toLocaleDateString("it-IT")}
                                        </span>
                                    )}

                                </div>

                            </div>


                            <div className="game-history-action">

                                <button
                                    onClick={() =>
                                        navigate(`/game/${game.id}`)
                                    }
                                >
                                    {game.status === "in_progress"
                                        ? "Riprendi"
                                        : "Visualizza"
                                    }
                                </button>

                            </div>

                        </article>

                    ))}

                </section>
            )}

        </main>
    );
}

export default Games;