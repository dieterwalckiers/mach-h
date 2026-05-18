export const leapYears = [2020, 2024, 2028, 2032, 2036, 2040, 2044];

export function getMonths(year: number): { [monthIndex: number]: { name: string, nrDays: number } } {
    return {
        0: { name: "januari", nrDays: 31 },
        1: { name: "februari", nrDays: leapYears.includes(year) ? 29 : 28 },
        2: { name: "maart", nrDays: 31 },
        3: { name: "april", nrDays: 30 },
        4: { name: "mei", nrDays: 31 },
        5: { name: "juni", nrDays: 30 },
        6: { name: "juli", nrDays: 31 },
        7: { name: "augustus", nrDays: 31 },
        8: { name: "september", nrDays: 30 },
        9: { name: "oktober", nrDays: 31 },
        10: { name: "november", nrDays: 30 },
        11: { name: "december", nrDays: 31 },
    };
}

function ensureTwoDigits(nr: number): string {
    return nr < 10 ? `0${nr}` : `${nr}`;
}

export function getFromTo(
    year: number,
    monthIndex: number = new Date().getMonth()
) {
    return {
        dateStrFrom: buildDateLabel(year, monthIndex + 1, 1),
        dateStrTo: buildDateLabel(year, monthIndex + 1, getMonths(year)[monthIndex].nrDays),
    }
}

export function buildDateLabel(year: number, month: number, day: number): string {
    return `${ensureTwoDigits(day)}/${ensureTwoDigits(month)}/${year}`
}

export function compareTimeString(timeStr1: string, timeStr2: string): 1 | -1 | 0 {
    const [hour1, minute1] = timeStr1.split(":").map(str => parseInt(str));
    const [hour2, minute2] = timeStr2.split(":").map(str => parseInt(str));
    if (hour1 > hour2) return 1;
    if (hour1 < hour2) return -1;
    if (minute1 > minute2) return 1;
    if (minute1 < minute2) return -1;
    return 0;
}