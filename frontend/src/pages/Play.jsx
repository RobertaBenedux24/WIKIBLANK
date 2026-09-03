import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

function Play() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [authRequired, setAuthRequired] = useState(false);

    const navigate = useNavigate();

    const startGame = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setAuthRequired(true);
            return;
        }

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
        <main className="play-page">

            <section className="play-header">

                <p className="play-label">
                    WIKIBLANK
                </p>

                <h1>Come si gioca?</h1>

                <p className="play-description">
                    Scopri progressivamente il contenuto
                    dell'articolo e prova a indovinarne il titolo.
                </p>

            </section>


            <section className="play-steps">

                <article className="play-step">

                    <span className="play-number">
                        01
                    </span>

                    <h2>Prova una parola</h2>

                    <p>
                        Inserisci una parola che pensi possa
                        essere presente nell'articolo.
                    </p>

                </article>


                <article className="play-step">

                    <span className="play-number">
                        02
                    </span>

                    <h2>Scopri il testo</h2>

                    <p>
                        Se la parola è presente, tutte le sue
                        occorrenze verranno rivelate nel testo.
                    </p>

                </article>


                <article className="play-step">

                    <span className="play-number">
                        03
                    </span>

                    <h2>Indovina il titolo</h2>

                    <p>
                        Usa gli indizi che hai scoperto e prova
                        a indovinare il titolo dell'articolo.
                    </p>

                </article>

            </section>


            <section className="play-start">

                <p>
                    Sei pronto?
                </p>

                <button
                    className="play-start-button"
                    onClick={startGame}
                    disabled={loading}
                >
                    {loading
                        ? "Preparazione partita..."
                        : "Inizia partita"
                    }
                </button>


                {authRequired && (
                    <div className="auth-warning">

                        <p>
                            Per iniziare una partita devi prima accedere
                            oppure creare un account.
                        </p>

                        <div className="auth-warning-actions">

                            <button
                                onClick={() => navigate("/login", {
                                state: { startGameAfterLogin: true }
                            })}
                            >
                                Accedi
                            </button>

                            <button
                                onClick={() =>
                                    navigate("/register", {
                                        state: {
                                            startGameAfterRegister: true
                                        }
                                    })
                                }
                            >
                                Registrati
                            </button>

                        </div>

                    </div>
                )}


                {error && (
                    <p className="play-error">
                        {error}
                    </p>
                )}

            </section>

        </main>
    );
}

export default Play;