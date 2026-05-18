import type { Signal } from "@builder.io/qwik";
import { $, useContext, useOnDocument, useSignal } from "@builder.io/qwik";
import { MainContext } from "~/routes/layout";



//function useCloseOnOutsideClick(callbackQrl: QRL<() => void>): Signal<Element | undefined> {
function useCloseOnOutsideClick(): Signal<Element | undefined> {

    const mainCtx = useContext(MainContext);

    const outputRef = useSignal<Element>();

    useOnDocument(
        'click',
        $(async (event) => {
            if (outputRef.value && !outputRef.value.contains(event.target as Node)) {
                // const callback = await callbackQrl.resolve();
                // callback();
                mainCtx.showMobileMenu = false;
            }
        })
    );

    return outputRef;
}

export default useCloseOnOutsideClick;