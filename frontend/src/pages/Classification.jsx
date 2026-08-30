import { useEffect, useState } from "react";

import api from "../services/api";

function Classification() {
    const [classification, setClassification] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadClassification = async () => {
            try {
                const response = await api.get("/classification");

                setClassification(response.data.classification);

            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Errore durante il recupero della classifica"
                );
            } finally {
                setLoading(false);
            }
        };

        loadClassification();
    }, []);

    if (loading) {
        return <p>Caricamento classifica...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <h1>Classifica</h1>

            {classification.length === 0 ? (
                <p>Non ci sono ancora giocatori in classifica.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Posizione</th>
                            <th>Utente</th>
                            <th>Vittorie</th>
                            <th>Tempo medio</th>
                        </tr>
                    </thead>

                    <tbody>
                        {classification.map((player) => (
                            <tr key={player.user_id}>
                                <td>{player.position}</td>

                                <td>{player.username}</td>

                                <td>{player.wins}</td>

                                <td>
                                    {Math.floor(
                                        player.average_time_seconds / 60
                                    )} min{" "}
                                    {player.average_time_seconds % 60} sec
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Classification;