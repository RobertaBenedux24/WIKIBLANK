import { useEffect, useState } from "react";

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
        <div>
            <h1>Partite concluse</h1>

            {games.length === 0 ? (
                <p>Non ci sono ancora partite concluse.</p>
            ) : (
                games.map((game) => (
                    <div key={game.id}>

                        <h2>
                            {game.article_title}
                        </h2>

                        <p>
                            Giocatore: {game.username}
                        </p>

                        <p>
                            Stato: {game.status}
                        </p>

                        <p>
                            Tentativi: {game.attempts}
                        </p>

                        <p>
                            Tempo impiegato:{" "}
                            {Math.floor(
                                game.duration_seconds / 60
                            )} min{" "}
                            {game.duration_seconds % 60} sec
                        </p>

                        <h3>
                            Testo scoperto
                        </h3>

                        <p>
                            {game.masked_text}
                        </p>

                        <p>
                            Terminata il:{" "}
                            {new Date(
                                game.finished_at
                            ).toLocaleString()}
                        </p>

                        <hr />

                    </div>
                ))
            )}
        </div>
    );
}

export default CompletedGames;