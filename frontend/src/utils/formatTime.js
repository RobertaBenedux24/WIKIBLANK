export function formatTime(totalSeconds) {
    if (totalSeconds === null || totalSeconds === undefined) {
        return "-";
    }

    const seconds = Math.floor(Number(totalSeconds));

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
        return `${hours} h ${minutes} min ${remainingSeconds} sec`;
    }

    if (minutes > 0) {
        return `${minutes} min ${remainingSeconds} sec`;
    }

    return `${remainingSeconds} sec`;
}