function getVisibleHintWords(text, articleTitle = "") {

    const titleWords = new Set(
        articleTitle
            .toLowerCase()
            .match(/[\p{L}\p{M}]+/gu) || []
    );

    const words = text.match(/[\p{L}\p{M}]+/gu) || [];

    const normalizedWords = words.map(
        word => word.toLowerCase()
    );

    /*
        Contiamo quante volte compare ogni parola
        all'interno dell'articolo.
    */
    const frequencies = new Map();

    for (const word of normalizedWords) {

        frequencies.set(
            word,
            (frequencies.get(word) || 0) + 1
        );
    }


    /*
        Creiamo l'elenco delle parole che possono
        essere mostrate automaticamente.

        Le parole del titolo vengono escluse.
    */
    const candidateWords = [];

    for (const [word, frequency] of frequencies) {

        if (titleWords.has(word)) {
            continue;
        }

        candidateWords.push({
            word,
            frequency
        });
    }


    /*
        Ordine deterministico.

        Non usiamo Math.random(), così facendo refresh
        le parole visibili rimangono sempre le stesse.
    */
    candidateWords.sort((a, b) => {

        const hashA = simpleHash(a.word);
        const hashB = simpleHash(b.word);

        return hashA - hashB;
    });


    /*
        Vogliamo rendere visibile circa il 70%
        delle occorrenze del testo.
    */
    const targetVisibleOccurrences =
        Math.floor(normalizedWords.length * 0.70);


    const hintWords = new Set();

    let visibleOccurrences = 0;


    for (const candidate of candidateWords) {

        if (visibleOccurrences >= targetVisibleOccurrences) {
            break;
        }

        hintWords.add(candidate.word);

        visibleOccurrences += candidate.frequency;
    }


    return hintWords;
}


/*
    Genera un numero sempre uguale per la stessa parola.

    Serve per avere una distribuzione stabile delle
    parole visibili senza usare Math.random().
*/
function simpleHash(word) {

    let hash = 0;

    for (let i = 0; i < word.length; i++) {

        hash =
            ((hash << 5) - hash) +
            word.charCodeAt(i);

        hash |= 0;
    }

    return Math.abs(hash);
}


function maskText(text, guessedWords = [], articleTitle = "") {

    const guessedSet = new Set(
        guessedWords.map(
            word => word.trim().toLowerCase()
        )
    );

    const visibleHintWords = getVisibleHintWords(
        text,
        articleTitle
    );


    return text.replace(
        /[\p{L}\p{M}]+/gu,
        (word) => {

            const normalizedWord =
                word.toLowerCase();


            /*
                Parola già indovinata dal giocatore.
            */
            if (guessedSet.has(normalizedWord)) {
                return word;
            }


            /*
                Parola mostrata automaticamente.
            */
            if (visibleHintWords.has(normalizedWord)) {
                return word;
            }


            /*
                Parola ancora nascosta.
            */
            return "_".repeat(word.length);
        }
    );
}


module.exports = {
    maskText,
    getVisibleHintWords
};