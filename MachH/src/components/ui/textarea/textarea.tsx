import { $, component$, type PropsOf } from "@builder.io/qwik";
import { cn } from "@qwik-ui/utils";

type TextareaProps = PropsOf<"textarea"> & {
    error?: string;
};

export const Textarea = component$<TextareaProps>(
    ({
        name,
        error,
        id,
        ["bind:value"]: valueSig,
        value,
        onInput$,
        ...props
    }) => {
        const textareaId = id || name;

        return (
            <>
                <textarea
                    {...props}
                    aria-errormessage={`${textareaId}-error`}
                    aria-invalid={!!error}
                    // workaround to support two way data-binding on the Textarea component
                    value={valueSig ? valueSig.value : value}
                    onInput$={
                        valueSig ? $((__, el) => (valueSig.value = el.value)) : onInput$
                    }
                    class={cn(
                        "flex min-h-[80px] w-full rounded-base border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                        props.class,
                    )}
                    id={textareaId}
                    name={name}
                />
                {error && (
                    <div id={`${textareaId}-error`} class="mt-1 text-sm text-alert">
                        {error}
                    </div>
                )}
            </>
        );
    },
);