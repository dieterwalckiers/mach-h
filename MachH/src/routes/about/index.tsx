import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import sanityClient from '~/cms/sanityClient';
import HtmlBlock from '~/components/HtmlBlock/htmlblock';
import MachHTitle from '~/components/shared/machhtitle';
import type { AboutUs } from '~/contract';
import { normalizeAboutUs } from '~/util/normalizing';

export const useAboutUs = routeLoader$(async () => {
    const rawAboutUs = await sanityClient.fetch(`*[_type == "about"][0]`);
    return normalizeAboutUs(rawAboutUs) as AboutUs;
})

export default component$(() => {
    const aboutUs = useAboutUs();
    return (
        <div class="w-full">
            <div class="header flex items-center justify-between w-full py-8 border-b-[3px] border-machh-primary">
                <MachHTitle size="text-6xl">
                    {aboutUs.value.title}
                </MachHTitle>
            </div>
            <div class="w-full flex justify-center py-12 text-machh-primary text-justify">
                <HtmlBlock value={aboutUs.value.bodyHtml} />
            </div>
        </div>
    );
});
