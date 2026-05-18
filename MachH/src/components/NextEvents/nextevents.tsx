import { component$, useContext, useStore, useVisibleTask$ } from '@builder.io/qwik';
import type { Event } from '../../contract';
import EventTile from "./eventtile";
import { MainContext } from '~/routes/layout';
import MachHTitle from '../shared/machhtitle';

export interface Props {
    events: Event[];
}


const NextEvents = component$<Props>(({ events }) => {

    const store = useStore<{ showArrows: boolean }>({
        showArrows: true,
    });

    const mainCtx = useContext(MainContext);

    useVisibleTask$(({ track }) => {
        switch (mainCtx.screenSize) {
            case "my-xs":
            case "md":
            case "sm":
                store.showArrows = true;
                break;
            default:
                store.showArrows = false;
        }
        track(() => mainCtx.screenSize);
    });

    return (
        <section class="nextevents w-full text-machh-primary border-b-[3px] border-machh-primary pt-6 font-semibold uppercase">
            <MachHTitle class="mb-6">
                Komende activiteiten
            </MachHTitle>
            <div class="flex justify-between relative overflow-x-auto py-8">
                {
                    events.slice(0, 3).map((event, i) => (
                        <EventTile event={event} key={`etile${i}`} />
                    ))
                }
            </div>
        </section>
    );
});

export default NextEvents;