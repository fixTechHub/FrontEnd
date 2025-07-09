/**
 * Format duration in seconds to human-readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) {
        return '0s';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    let result = '';
    
    if (hours > 0) {
        result += `${hours}h `;
    }
    
    if (minutes > 0 || hours > 0) {
        result += `${minutes}m `;
    }
    
    result += `${remainingSeconds}s`;
    
    return result.trim();
};

/**
 * Format duration in seconds to MM:SS format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration in MM:SS format
 */
export const formatDurationMMSS = (seconds) => {
    if (!seconds || seconds < 0) {
        return '00:00';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}; 


export const formatCurrency = (number) => {
    return Math.round(number).toLocaleString('vi-VN');
};