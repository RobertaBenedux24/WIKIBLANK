import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

function Play() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const startGame = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.post("/games");

            const gameId = response.data.game.id;

            navigate(`/game/${gameId}`);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Errore durante la creazione della partita"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Nuova partita</h1>

            <p>
                Avvia una nuova partita e prova a indovinare
                il titolo dell'articolo Wikipedia.
            </p>

            <button
                onClick={startGame}
                disabled={loading}
            >
                {loading ? "Creazione partita..." : "Inizia partita"}
            </button>

            {error && (
                <p>{error}</p>
            )}
        </div>
    );
}

export default Play;