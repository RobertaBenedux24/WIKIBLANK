const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"]; //legge l'header

    const token = authHeader && authHeader.split(" ")[1]; //separa l'header dal token vero e proprio

    if (!token) {
        return res.status(401).json({
            message: "Token mancante"
        });
    }

    //controlla che il token sia formato JWT_SECRET,non sia stato modificato e che non sia scaduto
    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error) {
            return res.status(403).json({
                message: "Token non valido o scaduto"
            });
        }

        req.user = user; //se valido viene salvato in req.user

        next(); //autenticazione riuscita, continua con la rotta successiva
    });
}

module.exports = authenticateToken;