function maskText(text, guessedWords = []) {
    const guessedSet = new Set(
        guessedWords.map(word => word.toLowerCase())
    );

    return text.replace(/\b[\p{L}\p{M}]+\b/gu, (word) => {
        if (guessedSet.has(word.toLowerCase())) {
            return word;
        }

        return "_".repeat(word.length);
    });
}

module.exports = maskText;