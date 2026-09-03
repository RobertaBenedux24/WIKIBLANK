function maskText(text, guessedWords = [], articleTitle = "") {

    // Parole indovinate dal giocatore
    const guessedSet = new Set(
        guessedWords.map(word => word.trim().toLowerCase())
    );

    // Parole presenti nel titolo
    // Non devono essere mostrate automaticamente
    const titleWords = new Set(
        (articleTitle.toLowerCase().match(/[\p{L}\p{M}]+/gu) || [])
    );

    // Parole comuni sempre visibili
    const alwaysVisibleWords = new Set([
        // Articoli
        "il", "lo", "la", "i", "gli", "le",
        "un", "uno", "una",

        // Preposizioni
        "di", "a", "da", "in", "con", "su",
        "per", "tra", "fra",

        // Preposizioni articolate
        "del", "dello", "della", "dei", "degli", "delle",
        "al", "allo", "alla", "ai", "agli", "alle",
        "dal", "dallo", "dalla", "dai", "dagli", "dalle",
        "nel", "nello", "nella", "nei", "negli", "nelle",
        "sul", "sullo", "sulla", "sui", "sugli", "sulle",

        // Congiunzioni e parole comuni
        "e", "o", "ma", "che", "se", "anche",
        "come", "quando", "mentre", "cui", "chi",

        // Pronomi
        "suo", "sua", "suoi", "sue",
        "questo", "questa", "questi", "queste",

        // Verbi molto frequenti
        "è", "era", "sono", "fu",
        "ha", "hanno", "aveva",
        "essere", "stato", "stata"
    ]);

    let significantWordIndex = 0;

    return text.replace(/[\p{L}\p{M}]+/gu, (word) => {

        const normalizedWord = word.toLowerCase();

        // 1. PRIORITÀ MASSIMA:
        // se l'utente ha indovinato la parola, MOSTRALA SEMPRE
        if (guessedSet.has(normalizedWord)) {
            return word;
        }

        // 2. Parole grammaticali sempre visibili
        if (alwaysVisibleWords.has(normalizedWord)) {
            return word;
        }

        // 3. Non regaliamo automaticamente parole del titolo
        if (titleWords.has(normalizedWord)) {
            return "_".repeat(word.length);
        }

        // 4. Per parole significative di almeno 4 lettere
        // mostriamo circa una parola ogni 4
        if (normalizedWord.length >= 4) {

            const showAsHint = significantWordIndex % 4 === 0;

            significantWordIndex++;

            if (showAsHint) {
                return word;
            }
        }

        // 5. Tutto il resto rimane nascosto
        return "_".repeat(word.length);
    });
}

module.exports = maskText;