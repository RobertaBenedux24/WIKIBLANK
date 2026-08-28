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

    return {
        title: page.title,
        text: page.extract
    };
}

module.exports = getRandomArticle;