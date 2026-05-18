import { component$ } from "@builder.io/qwik";

interface DayHeaderProps {
    dayLbl: string;
}

const DayHeader = component$<DayHeaderProps>(({ dayLbl }) => {
    return (


        <div class="p-2 w-[14.2857143%] text-xs font-bold text-center">
            <span class="xl:block lg:block md:block sm:block hidden">{dayLbl}</span>
        </div>

    );
});

export default DayHeader;