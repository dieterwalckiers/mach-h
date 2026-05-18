import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";



const TempRedirect = component$(() => {
    const nav = useNavigate();

    useVisibleTask$(() => {
        nav("/"); // reason: old site used to have a /mach-h page, browsers might have it cached
    })

    return <div></div>;
})

export default TempRedirect;