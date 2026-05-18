import { component$ } from "@builder.io/qwik";


export interface Props {
    value: string;
    class?: string;
}

const HtmlBlock = component$<Props>(({
    value,
    class: _class,
}) => {

    return (
        <div
            class={`w-full ${_class}`}
            dangerouslySetInnerHTML={value}
        />
    );
});

export default HtmlBlock;