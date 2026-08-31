import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <nav>
            <Link to="/">WIKIBLANK</Link>

            <div>
                <Link to="/">Home </Link>
                <Link to="/completed-games"> Partite concluse </Link>
                <Link to="/classification"> Classifica </Link>

                {!token && (
                    <>
                        <Link to="/login"> Accedi </Link>
                        <Link to="/register"> Registrati </Link>
                    </>
                )}

                {token && (
                    <>
                        <Link to="/play"> Gioca </Link>
                        <Link to="/games"> Le mie partite </Link>
                        <Link to="/profile"> Profilo </Link>

                        {user && (
                            <span>
                                Ciao, {user.username}
                            </span>
                        )}

                        <button onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;