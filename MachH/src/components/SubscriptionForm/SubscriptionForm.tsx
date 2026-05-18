import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import type { ActionStore } from "@builder.io/qwik-city";
import { Form } from "@builder.io/qwik-city";
import type { Event } from "~/contract";
import { Input, Textarea } from "../ui";
import MachHButton from "../shared/machhbutton";
import { summarizeErrors } from "./helpers";

interface Props {
    event: Event;
    subscribeAction: ActionStore<any, any>;
}

const SubscriptionForm = component$<Props>(({ event, subscribeAction }) => {

    const formRef = useSignal<HTMLFormElement>();
    const isSubmitting = useSignal(false);

    const mathNumber1 = Math.floor(Math.random() * 10) + 1;
    const mathNumber2 = Math.floor(Math.random() * 10) + 1;

    const mathQuestion = `Hoeveel is ${mathNumber1} + ${mathNumber2}?`;
    const mathSolution = mathNumber1 + mathNumber2;

    useTask$(({ track }) => {
        const actionValue = track(() => subscribeAction.value);
        
        if (actionValue?.success) {
            if (actionValue.paymentUrl) {
                // Redirect to Mollie payment page
                window.location.href = actionValue.paymentUrl;
            } else if (formRef.value) {
                // Free event - just reset form
                formRef.value.reset();
                isSubmitting.value = false;
            }
        }

        if (actionValue?.failed || actionValue?.error) {
            isSubmitting.value = false;
        }
    });

    return (
        <div class="flex flex-col gap-4 text-machh-primary">
            <h2>Schrijf je in voor "{event.title}"</h2>
            {event.subscriptionIsPaid && event.subscriptionPrice && (
                <div class="text-lg font-semibold">
                    Prijs: €{event.subscriptionPrice.toFixed(2)}
                </div>
            )}
            <div class="flex flex-col gap-4 text-sm">
                <Form
                    id="subscription-form"
                    action={subscribeAction}
                    /* data={{ slug: event.slug }}*/
                    class="flex flex-col gap-2"
                    ref={formRef}
                    onSubmit$={(ev) => {
                        if (isSubmitting.value) {
                            ev.preventDefault();
                            return;
                        }
                        isSubmitting.value = true;
                    }}
                >
                    <div>
                        <label class="text-machh-primary">Voornaam</label>
                        <Input name="firstName" />
                    </div>
                    <div>
                        <label class="text-machh-primary">Achternaam</label>
                        <Input name="lastName" />
                    </div>
                    <div>
                        <label class="text-machh-primary">Email</label>
                        <Input name="email" type="email" />
                    </div>
                    <div>
                        <label class="text-machh-primary">{mathQuestion}</label>
                        <Input name="mathQuestion" type="number" />
                    </div>
                    {event.remarksCaption && (
                        <div>
                            <label class="text-machh-primary">{event.remarksCaption}</label>
                            <Textarea name="remarks" rows={4} />
                        </div>
                    )}
                    <div class="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            name="subscribeToNewsletter"
                            id="subscribeToNewsletter"
                            value="true"
                            class="h-5 w-5 rounded border border-input accent-machh-primary cursor-pointer"
                        />
                        <label for="subscribeToNewsletter" class="text-machh-primary cursor-pointer">
                            Schrijf me in voor de nieuwsbrief
                        </label>
                    </div>
                    <input type="hidden" name="mathSolution" value={mathSolution} />
                    <input type="hidden" name="eventSlug" value={event.slug} />
                    <input type="hidden" name="eventConfirmationMailSubject" value={event.confirmationMailSubject} />
                    <input type="hidden" name="eventConfirmationMailBody" value={event.confirmationMailBody} />
                    {subscribeAction.value?.failed && (
                        <div class="text-red-500">
                            {summarizeErrors(subscribeAction.value.fieldErrors)}
                        </div>
                    )}
                    {subscribeAction.value?.error && (
                        <div class="text-red-500 my-4">
                            Inschrijving mislukt :( Stuur ons gerust een mailtje
                        </div>
                    )}
                    {subscribeAction.value?.success ? (
                        subscribeAction.value.paymentUrl ? (
                            <div class="text-blue-500 my-4">
                                Je wordt doorgestuurd naar de betaalpagina...
                            </div>
                        ) : (
                            <div class="text-green-500 my-4">
                                Je bent ingeschreven voor "{event.title}"!
                            </div>
                        )
                    ) : (
                        <div class="flex justify-end">
                            <MachHButton
                                type="submit"
                                disabled={isSubmitting.value}
                                aria-busy={isSubmitting.value}
                                onClick$={(ev) => {
                                    if (isSubmitting.value) {
                                        ev.preventDefault();
                                        return;
                                    }
                                    const formEl = formRef.value;
                                    if (!formEl) return;
                                    if (!formEl.checkValidity()) {
                                        return;
                                    }
                                    ev.preventDefault();
                                    isSubmitting.value = true;
                                    formEl.requestSubmit();
                                }}
                            >
                                {isSubmitting.value ? "Wordt geladen..." : "Inschrijven"}
                            </MachHButton>
                        </div>
                    )}
                </Form>
            </div>
        </div>
    );
});

export default SubscriptionForm;