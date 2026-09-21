function shortenText(text, maxLength = 1800) {
    if (!text) {
        return "";
    }

    if (text.length <= maxLength) {
        return text;
    }

    const shortened = text.slice(0, maxLength);

    const lastPeriod = shortened.lastIndexOf(".");
    const lastExclamation = shortened.lastIndexOf("!");
    const lastQuestion = shortened.lastIndexOf("?");

    const lastSentenceEnd = Math.max(
        lastPeriod,
        lastExclamation,
        lastQuestion
    );

    if (lastSentenceEnd !== -1) {
        return shortened
            .slice(0, lastSentenceEnd + 1)
            .trim();
    }

    return shortened.trim() + "...";
}


function cleanWikipediaText(text) {
    if (!text) {
        return "";
    }

    const sectionsToRemove = [
        "Note",
        "Bibliografia",
        "Voci correlate",
        "Altri progetti",
        "Collegamenti esterni",
        "Fonti",
        "Riferimenti",
        "Collegamenti",
        "Galleria",
        "Voci correlate e altri progetti"
    ];

    let cleanedText = text;

    for (const section of sectionsToRemove) {
        const sectionIndex = cleanedText.indexOf(`\n${section}\n`);

        if (sectionIndex !== -1) {
            cleanedText = cleanedText.slice(0, sectionIndex);
        }
    }

    return cleanedText.trim();
}


function removeUselessLines(text) {
    if (!text) {
        return "";
    }

    const lines = text.split("\n");

    const cleanedLines = [];

    for (const line of lines) {
        const trimmed = line.trim();

        // manteniamo le righe vuote per separare i paragrafi
        if (!trimmed) {
            cleanedLines.push("");
            continue;
        }

        const wordCount = trimmed.split(/\s+/).length;

        const hasSentencePunctuation =
            /[.!?]$/.test(trimmed);

        /*
            Elimina intestazioni isolate tipo:

            Uomini
            Donne
            Geografia
            Storia
            Carriera
            Premi

            Sono generalmente righe corte senza punteggiatura.
        */
        if (
            trimmed.length <= 35 &&
            wordCount <= 5 &&
            !hasSentencePunctuation
        ) {
            continue;
        }

        /*
            Elimina frammenti estremamente corti
            che non hanno abbastanza contenuto per il gioco.
        */
        if (
            trimmed.length < 45 &&
            wordCount < 8 &&
            !hasSentencePunctuation
        ) {
            continue;
        }

        cleanedLines.push(trimmed);
    }

    return cleanedLines.join("\n");
}


function removeShortParagraphs(text) {
    if (!text) {
        return "";
    }

    const paragraphs = text
        .split(/\n\s*\n/)
        .map(paragraph => paragraph.trim())
        .filter(Boolean);

    const usefulParagraphs = paragraphs.filter(paragraph => {

        const words = paragraph.split(/\s+/);

        /*
            Se un paragrafo ha meno di 12 parole,
            probabilmente è troppo piccolo per essere utile
            nel gioco.
        */
        return words.length >= 12;
    });

    return usefulParagraphs.join("\n\n");
}

const WIKIPEDIA_HEADERS = {
    "User-Agent":
        `WIKIBLANK/1.0 (${process.env.WIKIPEDIA_CONTACT_EMAIL})`,
    "Accept": "application/json"
};


function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function wikipediaFetch(url, maxRetries = 3) {

    for (let attempt = 0; attempt <= maxRetries; attempt++) {

        const response = await fetch(url, {
            headers: WIKIPEDIA_HEADERS
        });

        if (response.ok) {
            return response;
        }

        console.log(
            `Wikipedia status: ${response.status} ${response.statusText}`
        );

        /*
            Se Wikimedia ci sta limitando,
            aspettiamo prima di riprovare.
        */
        if (response.status === 429 && attempt < maxRetries) {

            const retryAfter =
                response.headers.get("retry-after");

            let waitTime;

            if (retryAfter && !Number.isNaN(Number(retryAfter))) {
                waitTime = Number(retryAfter) * 1000;
            } else {
                // 2s → 4s → 8s
                waitTime = 5000 * Math.pow(2, attempt);
            }

            console.log(
                `Rate limit Wikipedia. Nuovo tentativo tra ${waitTime / 1000}s...`
            );

            await wait(waitTime);

            continue;
        }

        throw new Error(
            `Wikipedia API error: ${response.status}`
        );
    }

    throw new Error(
        "Wikipedia non disponibile dopo diversi tentativi"
    );
}

async function getRandomArticle() {

    const MAX_TITLE_LENGTH = 60;
    const MAX_ATTEMPTS = 5;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {

        const randomUrl =
            "https://it.wikipedia.org/w/api.php" +
            "?action=query" +
            "&list=random" +
            "&rnnamespace=0" +
            "&rnfilterredir=nonredirects" +
            "&rnminsize=2000" +
            "&rnmaxsize=20000" +
            "&rnlimit=1" +
            "&format=json" +
            "&origin=*";

        const randomResponse = await wikipediaFetch(randomUrl);

        const randomData = await randomResponse.json();

        const randomPage = randomData.query.random[0];

        const title = randomPage.title;


        // Se il titolo è troppo lungo, prova con un altro articolo
        if (title.length > MAX_TITLE_LENGTH) {

            console.log(
                `Titolo troppo lungo (${title.length} caratteri): ${title}`
            );

            console.log(
                `Nuovo tentativo ${attempt}/${MAX_ATTEMPTS}`
            );

            continue;
        }


        const contentUrl =
            "https://it.wikipedia.org/w/api.php" +
            "?action=query" +
            "&prop=extracts" +
            "&explaintext=1" +
            "&exsectionformat=plain" +
            "&titles=" + encodeURIComponent(title) +
            "&format=json" +
            "&origin=*";

        const contentResponse = await wikipediaFetch(contentUrl);

        const contentData = await contentResponse.json();

        const pages = contentData.query.pages;
        const page = Object.values(pages)[0];


        let cleanedText = page.extract;

        // 1. Elimina sezioni finali inutili
        cleanedText = cleanWikipediaText(cleanedText);

        // 2. Elimina intestazioni e righe inutili
        cleanedText = removeUselessLines(cleanedText);

        // 3. Elimina paragrafi troppo piccoli
        cleanedText = removeShortParagraphs(cleanedText);

        // 4. Accorcia il testo finale
        cleanedText = shortenText(cleanedText, 1800);


        return {
            title: page.title,
            text: cleanedText
        };
    }


    throw new Error(
        "Impossibile trovare un articolo con un titolo adatto"
    );
}


module.exports = getRandomArticle;