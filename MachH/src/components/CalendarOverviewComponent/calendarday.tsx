
import type { Event } from "~/contract";
import CalendarDayEvent from "./calendardayevent";
import { component$ } from "@builder.io/qwik";
import { compareTimeString } from "./helpers";

interface CalendarDayProps {
    dayLbl: number;
    noRightBorder?: boolean;
    events?: Event[];
    y: number;
    mI: number;
    isToday?: boolean;
}

const CalendarDay = component$<CalendarDayProps>(({ dayLbl, noRightBorder, events, y, mI, isToday }) => {

    const sortedEvents = [...(events || [])].sort((a, b) => {
        if (!a.time || !b.time) {
            return 0;
        }
        return compareTimeString(a.time, b.time);
    });

    if (isToday) {
        console.log(dayLbl, "is today");
    }

    return (
        <div class={`w-[14.2857143%] border-b ${noRightBorder ? "" : "border-r "} aspect-square ${isToday ? "outline outline-4 outline-machh-greenaccent" : ""}`}>
            <div class="w-full text-center text-gray-400 text-sm font-semibold mt-2">
                {dayLbl <= 0 ? "" : dayLbl} {/* "filler" days are negative (days before the first) */}
            </div>
            <div class="eventslist text-xs p-1">
                {sortedEvents.map((event, i) => (
                    <CalendarDayEvent event={event} key={`evt${event.date}${i}`} y={y} mI={mI} />
                ))}
            </div>
        </div>
    );
});

export default CalendarDay;