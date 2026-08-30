import { useEffect, useState } from "react";

import api from "../services/api";

function Profile() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profileResponse = await api.get("/profile");

                const statsResponse = await api.get(
                    "/games/user/stats"
                );

                setUser(profileResponse.data.user);
                setStats(statsResponse.data.stats);

            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Errore durante il recupero del profilo"
                );
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    if (loading) {
        return <p>Caricamento profilo...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <h1>Profilo</h1>

            {user && (
                <div>
                    <h2>Dati utente</h2>

                    <p>
                        Username: {user.username}
                    </p>

                    <p>
                        Email: {user.email}
                    </p>

                    <p>
                        Registrato il:{" "}
                        {new Date(
                            user.created_at
                        ).toLocaleString()}
                    </p>
                </div>
            )}

            {stats && (
                <div>
                    <h2>Statistiche</h2>

                    <p>
                        Partite totali: {stats.total_games}
                    </p>

                    <p>
                        Vittorie: {stats.wins}
                    </p>

                    <p>
                        Partite abbandonate:{" "}
                        {stats.abandoned_games}
                    </p>

                    <p>
                        Partite in corso:{" "}
                        {stats.games_in_progress}
                    </p>

                    <p>
                        Tentativi totali:{" "}
                        {stats.total_attempts}
                    </p>

                    <p>
                        Tempo medio vittorie:{" "}
                        {stats.average_win_time_seconds === null
                            ? "Nessuna vittoria"
                            : `${Math.floor(
                                stats.average_win_time_seconds / 60
                            )} min ${
                                stats.average_win_time_seconds % 60
                            } sec`
                        }
                    </p>
                </div>
            )}
        </div>
    );
}

export default Profile;