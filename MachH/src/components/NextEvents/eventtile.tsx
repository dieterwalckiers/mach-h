import { component$ } from '@builder.io/qwik';
import type { Event } from '../../contract';
import Ball from '../Ball';
import { Link } from '@builder.io/qwik-city';

export interface Props {
    event: Event;
}


const EventTile = component$<Props>(({ event }) => {

    const hexColor = event.linkedProjects?.[0]?.hexColor;

    return (
        <Link href={`/event/${event.slug}`} class="w-full flex" style={{ minWidth: "250px" }}>
            <div class="mr-6">
                <Ball hexColor={hexColor} />
            </div>
            <div>
                <label>{`${event.date}`}</label>
                <h4>{event.title}</h4>
            </div>
        </Link>
    );
});

export default EventTile;