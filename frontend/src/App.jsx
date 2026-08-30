import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Play from "./pages/Play";
import Game from "./pages/Game";
import Games from "./pages/Games";
import Classification from "./pages/Classification";
import Profile from "./pages/Profile";

function App() {
    return (
        <>
            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route path="/play" element={<Play />} />

                <Route path="/game/:id" element={<Game />} />

                <Route path="/games" element={<Games />} />

                <Route path="/classification" element={<Classification />} />

                <Route path="/profile" element={<Profile />} />

            </Routes>
        </>
    );
}

export default App;