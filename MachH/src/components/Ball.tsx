import { component$ } from "@builder.io/qwik";

export default component$<{
    class?: string,
    hexColor?: string,
}>(({ class: _class, hexColor }) => (
    <div class={`w-[2.5rem] h-[2.5rem] min-w-[2.5rem] min-h-[2.5rem] max-w-[2.5rem] max-h-[2.5rem] rounded-full ${_class || ""}`} style={{ backgroundColor: hexColor || "#009548" }} />
));