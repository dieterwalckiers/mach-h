import { component$ } from "@builder.io/qwik";

const PaymentCancelled = component$(() => {
    return (
        <div class="w-full">
            <div class="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div class="text-orange-600 mb-4">
                    <svg class="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                </div>
                <h2 class="text-2xl font-semibold mb-4 text-machh-primary">
                    Je betaling is geannuleerd
                </h2>
                <p class="text-lg mb-8 text-machh-primary">
                    Je inschrijving is niet voltooid. Je kunt op elk moment opnieuw proberen in te schrijven voor deze activiteit.
                </p>
            </div>
        </div>
    );
});

export default PaymentCancelled;