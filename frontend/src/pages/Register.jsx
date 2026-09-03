import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import api from "../services/api";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await api.post("/register", {
                username,
                email,
                password
            });

            setMessage(response.data.message);

            // Login automatico dopo la registrazione
            const loginResponse = await api.post("/login", {
                email,
                password
            });

            // Salviamo token e utente
            localStorage.setItem(
                "token",
                loginResponse.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(loginResponse.data.user)
            );

            if (location.state?.startGameAfterRegister) {
                navigate("/play");
            } else {
                navigate("/");
            }

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Errore durante la registrazione"
            );
        }
    };

    return (
        <main className="register-page">

            <section className="register-card">

                <p className="register-label">
                    WIKIBLANK
                </p>

                <h1>Registrati</h1>

                <p className="register-description">
                    Crea il tuo account per iniziare a giocare.
                </p>

                <form
                    className="register-form"
                    onSubmit={handleSubmit}
                >

                    <div className="register-field">
                        <label htmlFor="username">
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                            placeholder="Scegli uno username"
                            required
                        />
                    </div>

                    <div className="register-field">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="nome@email.it"
                            required
                        />
                    </div>

                    <div className="register-field">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Crea una password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="register-button"
                    >
                        Registrati
                    </button>

                </form>

                {message && (
                    <p className="register-success">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="register-error">
                        {error}
                    </p>
                )}

                <p className="register-login">
                    Hai già un account?{" "}

                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                    >
                        Accedi
                    </button>
                </p>

            </section>

        </main>
    );
}

export default Register;