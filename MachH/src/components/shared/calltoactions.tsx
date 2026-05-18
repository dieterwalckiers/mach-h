import type { CallToAction } from "~/contract";
import MachHButton from "../shared/machhbutton";
import { component$ } from "@builder.io/qwik";

interface Props {
    callToActions: CallToAction[];
}

const CallToActions = component$<Props>(({ callToActions }) => {
    return (
        <div class="callToActions flex flex-col">
            {callToActions.map((cta, i) => (
                <MachHButton
                    onClick$={() => { window.open(cta.href!, '_blank'); }}
                    class="text-sm mt-2"
                    key={`cta${i}`}
                >
                    <label class="pointer-events-none">{cta.text}</label>
                </MachHButton>
            ))}
        </div>
    )
})

export default CallToActions;