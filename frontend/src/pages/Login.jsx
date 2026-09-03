import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import api from "../services/api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        try {
            const response = await api.post("/login", {
                email,
                password
            });

            const token = response.data.token;

            localStorage.setItem("token", token);

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            if (location.state?.startGameAfterLogin) {
                navigate("/play");
            } else {
                navigate("/");
            }

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Errore durante il login"
            );
        }
    };

    return (
        <main className="login-page">

            <section className="login-card">

                <p className="login-label">
                    WIKIBLANK
                </p>

                <h1>Accedi</h1>

                <p className="login-description">
                    Accedi al tuo account per iniziare a giocare.
                </p>

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >

                    <div className="login-field">

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


                    <div className="login-field">

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
                            placeholder="Inserisci la password"
                            required
                        />

                    </div>


                    <button
                        type="submit"
                        className="login-button"
                    >
                        Accedi
                    </button>

                </form>


                {error && (
                    <p className="login-error">
                        {error}
                    </p>
                )}


                <p className="login-register">
                    Non hai ancora un account?{" "}

                    <button
                        type="button"
                        onClick={() => navigate("/register")}
                    >
                        Registrati
                    </button>
                </p>

            </section>

        </main>
    );
}

export default Login;