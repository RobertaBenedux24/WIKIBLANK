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


async function getRandomArticle() {
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

    const randomResponse = await fetch(randomUrl);

    if (!randomResponse.ok) {
        throw new Error(
            "Errore nel recupero dell'articolo casuale"
        );
    }
/*DEBUG
const randomResponse = await fetch(randomUrl);

if (!randomResponse.ok) {
    const errorText = await randomResponse.text();

    console.error("ERRORE WIKIPEDIA RANDOM");
    console.error("Status:", randomResponse.status);
    console.error("Status text:", randomResponse.statusText);
    console.error("Risposta:", errorText);

    throw new Error(
        `Errore Wikipedia: ${randomResponse.status} ${randomResponse.statusText}`
    );
}*/

    const randomData = await randomResponse.json();

    const randomPage = randomData.query.random[0];

    const title = randomPage.title;


    const contentUrl =
        "https://it.wikipedia.org/w/api.php" +
        "?action=query" +
        "&prop=extracts" +
        "&explaintext=1" +
        "&exsectionformat=plain" +
        "&titles=" + encodeURIComponent(title) +
        "&format=json" +
        "&origin=*";

    const contentResponse = await fetch(contentUrl);

    if (!contentResponse.ok) {
        throw new Error(
            "Errore nel recupero del contenuto dell'articolo"
        );
    }
/*DEBUG
const contentResponse = await fetch(contentUrl);

if (!contentResponse.ok) {
    const errorText = await contentResponse.text();

    console.error("ERRORE WIKIPEDIA CONTENT");
    console.error("Status:", contentResponse.status);
    console.error("Status text:", contentResponse.statusText);
    console.error("Risposta:", errorText);

    throw new Error(
        `Errore Wikipedia: ${contentResponse.status} ${contentResponse.statusText}`
    );
}*/

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


module.exports = getRandomArticle;