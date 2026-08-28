function normalizeText(text) {
    return text
        .trim() //elimina gli spazi all'inizio e alla fine
        .toLowerCase() //rende irrilevanti maiuscole/minuscole
        .normalize("NFD") //serve per rimuovere gli accenti
        .replace(/[\u0300-\u036f]/g, "") //elimina i segni diacritici che abbiamo separato con normalize("NFD").
        .replace(/[^\p{L}\p{N}\s]/gu, "") //elimina la punteggiatura
        .replace(/\s+/g, " "); //sistema gli spazi multipli
}

module.exports = normalizeText;