import { component$, useComputed$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import type { Event } from '~/contract';

export interface CalendarDayEventProps {
  event: Event;
  mI: number;
  y: number;
}

const CalendarDayEvent = component$<CalendarDayEventProps>(({ event, mI, y }) => {

  const firstLinkedProject = useComputed$(() => {
    return [...(event.linkedProjects) || []].shift();
  });
  const projectColor = useComputed$(() => {
    return firstLinkedProject.value?.hexColor || "#009548"
  });

  return (
    <Link
      class="text-white p-1 flex flex-col text-center overflow-hidden rounded-md cursor-pointer hover:opacity-80 transition-all duration-300"
      style={{ backgroundColor: projectColor.value }}
      href={`/event/${event.slug}?s=m&y=${y}&mI=${mI}`}
    >
      <label class="whitespace-nowrap font-semibold overflow-hidden text-overflow-ellipsis pointer-events-none">
        {event.title}
      </label>
      <label class="overflow-hidden text-overflow-ellipsis whitespace-nowrap pointer-events-none">
        {event.time ?? ""}
      </label>
    </Link >
  );
});


export default CalendarDayEvent;