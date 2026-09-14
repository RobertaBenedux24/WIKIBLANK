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
        <main className="classification-page">

            <section className="classification-header">
                <h1>Classifica</h1>

                <p>
                    I migliori giocatori di WIKIBLANK,
                    classificati per numero di vittorie e tempo medio.
                </p>
            </section>


            {classification.length === 0 ? (

                <section className="classification-empty">
                    <h2>Nessun giocatore in classifica</h2>

                    <p>
                        La classifica si aggiornerà appena verrà completata
                        la prima partita.
                    </p>
                </section>

            ) : (

                <>
                    <section className="classification-podium">

                        {/* SECONDO POSTO */}
                        {classification[1] && (
                            <article className="podium-card podium-second">

                                <div className="podium-medal podium-medal-silver">
                                    2°
                                </div>

                                <h2>{classification[1].username}</h2>

                                <div className="podium-info">

                                    <div>
                                        <span>VITTORIE</span>
                                        <strong>{classification[1].wins}</strong>
                                    </div>

                                    <div>
                                        <span>TEMPO MEDIO</span>
                                        <strong>
                                            {Math.floor(
                                                classification[1].average_time_seconds / 60
                                            )}m{" "}
                                            {classification[1].average_time_seconds % 60}s
                                        </strong>
                                    </div>

                                </div>

                            </article>
                        )}


                        {/* PRIMO POSTO */}
                        {classification[0] && (
                            <article className="podium-card podium-first">

                                <div className="podium-medal podium-medal-gold">
                                    1°
                                </div>

                                <h2>{classification[0].username}</h2>

                                <div className="podium-info">

                                    <div>
                                        <span>VITTORIE</span>
                                        <strong>{classification[0].wins}</strong>
                                    </div>

                                    <div>
                                        <span>TEMPO MEDIO</span>
                                        <strong>
                                            {Math.floor(
                                                classification[0].average_time_seconds / 60
                                            )}m{" "}
                                            {classification[0].average_time_seconds % 60}s
                                        </strong>
                                    </div>

                                </div>

                            </article>
                        )}


                        {/* TERZO POSTO */}
                        {classification[2] && (
                            <article className="podium-card podium-third">

                                <div className="podium-medal podium-medal-bronze">
                                    3°
                                </div>

                                <h2>{classification[2].username}</h2>

                                <div className="podium-info">

                                    <div>
                                        <span>VITTORIE</span>
                                        <strong>{classification[2].wins}</strong>
                                    </div>

                                    <div>
                                        <span>TEMPO MEDIO</span>
                                        <strong>
                                            {Math.floor(
                                                classification[2].average_time_seconds / 60
                                            )}m{" "}
                                            {classification[2].average_time_seconds % 60}s
                                        </strong>
                                    </div>

                                </div>

                            </article>
                        )}

                    </section>


                    <section className="classification-list">

                        <div className="classification-table-header">

                            <span>POS.</span>

                            <span>GIOCATORE</span>

                            <span>VITTORIE</span>

                            <span>TEMPO MEDIO</span>

                        </div>


                        {classification.map((player) => (

                            <div
                                key={player.user_id}
                                className="classification-row"
                            >

                                <div className="classification-position">
                                    {player.position}
                                </div>

                                <div className="classification-user">
                                    {player.username}
                                </div>

                                <div className="classification-wins">
                                    {player.wins}
                                </div>

                                <div className="classification-time">
                                    {Math.floor(
                                        player.average_time_seconds / 60
                                    )} min{" "}
                                    {player.average_time_seconds % 60} sec
                                </div>

                            </div>

                        ))}

                    </section>
                </>
            )}

        </main>
    );
}

export default Classification;