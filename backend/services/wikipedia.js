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
        "Riferimenti"
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
        throw new Error("Errore nel recupero dell'articolo casuale");
    }

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
        throw new Error("Errore nel recupero del contenuto dell'articolo");
    }

    const contentData = await contentResponse.json();

    const pages = contentData.query.pages;
    const page = Object.values(pages)[0];

    const cleanedText = cleanWikipediaText(page.extract);

    return {
        title: page.title,
        text: shortenText(cleanedText, 1800)
    };

}

module.exports = getRandomArticle;