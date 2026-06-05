export const extractNumber = (str = '') => {
    const match = str.match(/\d+/);
    return match ? Number(match[0]) : null; // ← aquí el cambio
};