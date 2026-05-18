import type { Event } from "~/contract";
import MachHTitle from "~/components/shared/machhtitle";
import { component$ } from "@builder.io/qwik";
import type { RequestEventLoader } from "@builder.io/qwik-city";
import { Link, routeLoader$ } from "@builder.io/qwik-city";
import sanityClient from "~/cms/sanityClient";
import EventCard from "~/components/EventCard/EventCard";
import { normalizeEvent } from "~/util/normalizing";
import Calendar from "../../svg/calendar.svg?jsx";

const EVENTS_ON_PAGE = 6;


export const useEvents = routeLoader$(async (requestEvent: RequestEventLoader) => {
  const from = parseInt(requestEvent.query.get("from") ?? "0");
  const to = parseInt(requestEvent.query.get("to") ?? `${EVENTS_ON_PAGE}`);
  const fromMinusOne = Math.max(from - 1, 0);
  const toPlusOne = to + 1;
  const rawEvents = await sanityClient.fetch(`*[_type == "event" && date >= now()]|order(date asc){date,time,endTime,place,price,title,slug,"imageUrl": image.asset->url,"imageRef": image.asset._ref,linkedProjects[]->{name, slug, hexColor}}[${fromMinusOne}...${toPlusOne}]`);
  const events = rawEvents.map((e: any) => normalizeEvent(e)) as Event[];
  const hasPrevPeek = from !== fromMinusOne;
  const forwardCount = events.length - (hasPrevPeek ? 1 : 0);
  let moreFurther;
  if (forwardCount > (to - from)) {
    moreFurther = true;
    events.pop();
  }
  if (hasPrevPeek) {
    events.shift();
  }
  return {
    events,
    pagingInfo: {
      isFirstPage: from === 0,
      isLastPage: !moreFurther,
      from,
      to,
    }
  }
})

export default component$(() => {

  const useEventsResult = useEvents();
  const { events, pagingInfo } = useEventsResult.value;


  const prevLink = pagingInfo.isFirstPage ?
    null :
    `/calendar?from=${Math.max(0, pagingInfo.from - EVENTS_ON_PAGE)}&to=${Math.max(0, pagingInfo.to - EVENTS_ON_PAGE)}`;

  const nextLink = pagingInfo.isLastPage ?
    null :
    `/calendar?from=${pagingInfo.to}&to=${pagingInfo.to + EVENTS_ON_PAGE}`;

  return (
    <div class="w-full">
      <div class="header flex flex-col md:flex-row items-center justify-between w-full py-8 border-b-[3px] border-machh-primary">
        <MachHTitle size="text-6xl" class="self-start md:self-auto">
          Kalender
        </MachHTitle>
        <Link href="/calendar-overview" class="flex text-machh-primary items-center cursor-pointer hover:opacity-70 transition-all duration-300 mt-4 md:mt-0 self-end md:self-auto">
          <label class="font-normal text-md pointer-events-none">naar maandoverzicht</label>&nbsp;
          <Calendar class="w-8 h-8 fill-current" />
        </Link>
      </div>
      {events.map((event, i) => (
        <EventCard
          event={event}
          key={`evtc${i}`}
          clickable
          noBottomBorder={i === events.length - 1 && pagingInfo.isFirstPage && pagingInfo.isLastPage}
          from={pagingInfo.from}
          to={pagingInfo.to}
        />
      ))}
      {
        pagingInfo.isFirstPage && pagingInfo.isLastPage ? null : (
          <div class="my-12 flex justify-between w-full text-machh-primary text-5xl">
            <Link class={`cursor-pointer ${prevLink ? "" : "invisible"}`} href={prevLink ?? ""}>
              &#x2190;
            </Link>
            <Link class={`cursor-pointer ${nextLink ? "" : "invisible"}`} href={nextLink ?? ""}>
              &#x2192;
            </Link>
          </div>
        )

      }
    </div>
  );
});
