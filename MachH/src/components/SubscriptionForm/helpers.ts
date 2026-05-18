export function summarizeErrors(fieldErrors: Record<string, string[]>) {
    const errors = Object.values(fieldErrors).flat();
    return errors.length > 0 ? errors.join(", ") : "";
} 