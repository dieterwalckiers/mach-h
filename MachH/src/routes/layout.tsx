import { $, component$, createContextId, Slot, useContextProvider, useOnWindow, useStore, useTask$ } from "@builder.io/qwik";
import { routeLoader$, type RequestHandler } from "@builder.io/qwik-city";
import sanityClient from "~/cms/sanityClient";
import MainMenu from "~/components/MainMenu/mainmenu";
import Footer from "~/components/footer/footer";
import Header from "~/components/header/header";
import type { Project, Settings } from "~/contract";
import { normalizeProject } from "~/util/normalizing";
import type { ScreenSize } from "~/util/rwd";
import { getScreenSize } from "~/util/rwd";

export const onGet: RequestHandler = async ({ cacheControl }) => {
    // Control caching for this request for best performance and to reduce hosting costs:
    // https://qwik.builder.io/docs/caching/
    cacheControl({
        // Always serve a cached response by default, up to a week stale
        staleWhileRevalidate: 60 * 60 * 24 * 7,
        // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
        maxAge: 5,
    });
};

export type MainContextData = {
    showMobileMenu: boolean;
    screenSize: ScreenSize;
    projects?: Project[];
};
export const MainContext = createContextId<MainContextData>("mainContext");

export const useProjects = routeLoader$(async () => {
    const projects = await sanityClient.fetch('*[_type == "project"]{..., "gridImageUrl": coalesce(gridImage.asset->url, photo.asset->url), "gridImageRef": coalesce(gridImage.asset._ref, photo.asset._ref)}|order(orderRank)');
    return projects.map((p: any) => normalizeProject(p)) as Project[];
})

export const useSettings = routeLoader$(async () => {
    const settings = await sanityClient.fetch('*[_type == "settings"][0]');
    return settings as Settings;
})

export default component$(() => {

    const store = useStore<MainContextData>({
        showMobileMenu: false,
        screenSize: "md",
    });

    const projects = useProjects(); // fetch projects here, so we can use them in multiple places (main menu + homepage tiles)
    const settings = useSettings();

    useTask$(({ track }) => {
        store.projects = projects.value;
        track(() => [projects]);
    })

    useContextProvider(MainContext, store);

    useOnWindow(
        "load",
        $(() => {
            store.screenSize = getScreenSize();
        })
    );
    useOnWindow(
        "resize",
        $(() => {
            store.screenSize = getScreenSize()
        })
    );

    return (
        <div class="w-full flex flex-col py-4 items-center font-roboto text-xxl md:text-xl">
            <div class="w-[calc(100vw-1rem)] md:w-[50rem] flex flex-col items-center">
                <Header settings={settings.value} />
                <MainMenu settings={settings.value} />
                <Slot />
                <Footer />
            </div>
        </div>
    );
});