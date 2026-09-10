function getVisibleHintWords(text, articleTitle = "") {

    const titleWords = new Set(
        articleTitle
            .toLowerCase()
            .match(/[\p{L}\p{M}]+/gu) || []
    );

    const alwaysVisibleWords = new Set([
        "il", "lo", "la", "i", "gli", "le",
        "un", "uno", "una",

        "di", "a", "da", "in", "con", "su",
        "per", "tra", "fra",

        "del", "dello", "della", "dei", "degli", "delle",
        "al", "allo", "alla", "ai", "agli", "alle",
        "dal", "dallo", "dalla", "dai", "dagli", "dalle",
        "nel", "nello", "nella", "nei", "negli", "nelle",
        "sul", "sullo", "sulla", "sui", "sugli", "sulle",

        "e", "o", "ma", "che", "se", "anche",
        "come", "quando", "mentre",

        "suo", "sua", "suoi", "sue",
        "questo", "questa", "questi", "queste",
        "cui", "chi",

        "è", "era", "sono", "fu",
        "ha", "hanno", "aveva",
        "essere", "stato", "stata"
    ]);

    const words = text.match(/[\p{L}\p{M}]+/gu) || [];

    const significantWords = [];
    const seen = new Set();

    for (const word of words) {

        const normalizedWord = word.toLowerCase();

        if (seen.has(normalizedWord)) {
            continue;
        }

        seen.add(normalizedWord);

        if (normalizedWord.length < 4) {
            continue;
        }

        if (alwaysVisibleWords.has(normalizedWord)) {
            continue;
        }

        if (titleWords.has(normalizedWord)) {
            continue;
        }

        significantWords.push(normalizedWord);
    }

    const hintWords = new Set();

    // Aggiungiamo le parole grammaticali
    // SOLO se sono realmente presenti nell'articolo
    for (const word of words) {

        const normalizedWord = word.toLowerCase();

        if (alwaysVisibleWords.has(normalizedWord)) {
            hintWords.add(normalizedWord);
        }
    }

    // Aggiungiamo gli indizi automatici
    significantWords.forEach((word, index) => {

        if (index % 4 === 0) {
            hintWords.add(word);
        }

    });

    return hintWords;
}


function maskText(text, guessedWords = [], articleTitle = "") {

    const guessedSet = new Set(
        guessedWords.map(word => word.trim().toLowerCase())
    );

    const visibleHintWords = getVisibleHintWords(
        text,
        articleTitle
    );

    return text.replace(/[\p{L}\p{M}]+/gu, (word) => {

        const normalizedWord = word.toLowerCase();

        if (guessedSet.has(normalizedWord)) {
            return word;
        }

        if (visibleHintWords.has(normalizedWord)) {
            return word;
        }

        return "_".repeat(word.length);
    });
}

module.exports = {
    maskText,
    getVisibleHintWords
};