/**
 * Get ISO8601 Date String
 * @param d {Date}
 * @returns string
 */
export const dateIsoString = (d: Date): string => {
  const pad = (number: number) => {
    if (number < 10) return `0${number}`;
    return number;
  };

  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T`
    +`${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
};

