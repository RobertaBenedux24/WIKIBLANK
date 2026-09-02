import { Link } from "react-router-dom";
import hangmanGif from "../assets/hangman.gif";

function Home() {
    return (
        <main className="home-page">

            <section className="home-hero">

                <div className="home-gif-container">
                    <img
                        src={hangmanGif}
                        alt="Omino WIKIBLANK"
                         className="home-gif"
                />

                <div className="gif-watermark-cover"></div>
                 
                </div>

                <p className="home-label">
                    IL GIOCO DEGLI ARTICOLI NASCOSTI
                </p>

                <h1>
                    Scopri l'articolo.
                    <br />
                    Indovina il titolo.
                </h1>

                <p className="home-description">
                    WIKIBLANK trasforma un articolo di Wikipedia in una sfida:
                    <br />
                    scopri le parole nascoste e prova a indovinare il titolo
                    nel minor tempo possibile.
                </p>

                <div className="home-actions">

                    <Link
                        to="/play"
                        className="home-primary-button"
                    >
                        Inizia a giocare
                    </Link>

                    <Link
                        to="/completed-games"
                        className="home-secondary-button"
                    >
                        Esplora le partite
                    </Link>

                </div>

            </section>

        </main>
    );
}

export default Home;