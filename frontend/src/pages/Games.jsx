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
        <div>
            <h1>Le mie partite</h1>

            {games.length === 0 ? (
                <p>Non hai ancora giocato nessuna partita.</p>
            ) : (
                games.map((game) => (
                    <div key={game.id}>

                        <h3>
                            Partita #{game.id}
                        </h3>

                        <p>
                            Stato: {game.status}
                        </p>

                        <p>
                            Tentativi: {game.attempts}
                        </p>

                        <p>
                            Iniziata: {
                                new Date(
                                    game.started_at
                                ).toLocaleString()
                            }
                        </p>

                        {game.finished_at && (
                            <p>
                                Terminata: {
                                    new Date(
                                        game.finished_at
                                    ).toLocaleString()
                                }
                            </p>
                        )}

                        {game.status === "in_progress" && (
                            <button
                                onClick={() =>
                                    navigate(`/game/${game.id}`)
                                }
                            >
                                Riprendi partita
                            </button>
                        )}

                        {game.status !== "in_progress" && (
                            <button
                                onClick={() =>
                                    navigate(`/game/${game.id}`)
                                }
                            >
                                Visualizza partita
                            </button>
                        )}

                        <hr />
                    </div>
                ))
            )}
        </div>
    );
}

export default Games;