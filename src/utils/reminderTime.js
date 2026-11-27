export const IST_TIME_ZONE = "Asia/Kolkata";

export function toIstInputValue(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: IST_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    }).formatToParts(date);

    const values = Object.fromEntries(
        parts.map((part) => [part.type, part.value])
    );

    return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

export function istNowInputValue() {
    return toIstInputValue(new Date());
}

export function formatReminderTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    const formatted = new Intl.DateTimeFormat("en-IN", {
        timeZone: IST_TIME_ZONE,
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);

    return `${formatted} IST`;
}
