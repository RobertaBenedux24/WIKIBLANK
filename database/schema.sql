
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, /*password non in chiaro*/
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP /*salva automaticamente la data e l'ora di registrazione*/
);

CREATE TABLE games (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    article_title VARCHAR(255) NOT NULL, /*titolo dell'articolo*/
    article_text TEXT NOT NULL, /*contenuto dell'articolo*/

    guessed_words TEXT[] DEFAULT '{}', /*array delle parola indovinate*/

    attempts INTEGER DEFAULT 0, /*tentativi effettuati*/

    status VARCHAR(20) NOT NULL DEFAULT 'in_progress', /*stato della partita*/

	/*inizio e fine partita, per verificare il tempo impiegato*/
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,
	
	/*crea una relazione tra la tabella delle partite e degli utente
	dove un utente può avere molte partite,
	ma una partita appartiene a un utente*/
    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

SELECT * FROM games;

SELECT
    g.id AS game_id,
    g.user_id,
    u.username,
    g.status,
    g.started_at
FROM games g
JOIN users u ON g.user_id = u.id;

SELECT
    id,
    user_id,
    article_title,
    status,
    attempts,
    guessed_words,
    started_at
FROM games;

SELECT id, article_title
FROM games;

SELECT
    id,
    user_id,
    article_title,
    status,
    attempts,
    started_at,
    finished_at
FROM games
ORDER BY id;

DELETE FROM users WHERE username = 'giulio';
SELECT * FROM users;

ALTER TABLE games
ADD COLUMN wrong_guesses TEXT[] DEFAULT '{}';

SELECT * FROM games;
SELECT id, guessed_words, wrong_guesses
FROM games;