/**
 * Retry helper with exponential backoff
 */
export async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000,
    backoffFactor: number = 2
): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[RETRY] Attempt ${attempt + 1}/${maxRetries + 1}`);
            return await operation();
        } catch (error) {
            lastError = error;

            if (attempt < maxRetries) {
                const delay = initialDelay * Math.pow(backoffFactor, attempt);
                console.log(`[RETRY] Failed, retrying in ${delay}ms...`, error);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error(`[RETRY] All attempts failed after ${attempt + 1} tries`, error);
            }
        }
    }

    throw lastError;
}