const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export function generatePassword(length, complexity) {
    // complexity 0 → 0% symbols, complexity 10 → 70% symbols
    const symbolRatio = (complexity / 10) * 0.70;
    const symbolCount = Math.floor(length * symbolRatio);
    const alphanumCount = length - symbolCount;

    const lowerCount = Math.floor(alphanumCount / 3);
    const upperCount = Math.floor(alphanumCount / 3);
    const digitCount = alphanumCount - lowerCount - upperCount;

    const pick = (charset, n) =>
        Array.from({length: n}, () => charset[Math.floor(Math.random() * charset.length)]);

    const chars = [
        ...pick(LOWER, lowerCount),
        ...pick(UPPER, upperCount),
        ...pick(DIGITS, digitCount),
        ...pick(SYMBOLS, symbolCount),
    ];

    // Fisher-Yates shuffle
    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join('');
}
