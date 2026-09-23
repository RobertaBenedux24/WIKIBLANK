# WIKIBLANK

WIKIBLANK è un'applicazione web ispirata al gioco dell'impiccato e basata su articoli di Wikipedia.
Durante una partita viene selezionato casualmente un articolo tramite MediaWiki API. Il giocatore deve provare a scoprirne il contenuto indovinando parole e, infine, il titolo dell'articolo.

## Configurazione del database

Creare un database 'wikiblank' PostgreSQL dedicato al progetto.

Successivamente eseguire il file per creare le tabelle necessarie:

database/schema.sql
  
## Configurazione del back-end

Entrare nella directory: backend

Installare le dipendenze: npm install

Creare un file `.env` all'interno della directory `backend`, utilizzando come riferimento il file `.env.example` e sistituire i valore della variabili con i propri dati.

Avviare il server: npm start

Il back-end viene eseguito sulla porta 3000.

## Configurazione del front-end

Entrare nella directory: frontend

Installare le dipendenze: npm install

Avviare il front-end: npm run dev

L'applicazione sarà disponibile all'indirizzo indicato da Vite,
normalmente http://localhost:5173.

## Test End-to-End

Dalla directory principale del progetto installare le dipendenze: npm install

Installare il browser utilizzato da Playwright: npx playwright install chromium

Assicurarsi che back-end e front-end siano in esecuzione.

Eseguire quindi: npx playwright test

La suite contiene 10 test automatici.
