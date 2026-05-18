import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import sanityClient from '~/cms/sanityClient';
import HtmlBlock from '~/components/HtmlBlock/htmlblock';
import MachHTitle from '~/components/shared/machhtitle';
import type { PrivacyPolicy } from '~/contract';
import { normalizePrivacyPolicy } from '~/util/normalizing';

export const usePrivacyPolicy = routeLoader$(async () => {
    const rawPrivacyPolicy = await sanityClient.fetch(`*[_type == "privacyPolicy"][0]`);
    return normalizePrivacyPolicy(rawPrivacyPolicy) as PrivacyPolicy;
})

export default component$(() => {
    const privacyPolicy = usePrivacyPolicy();
    return (
        <div class="w-full">
            <div class="header flex items-center justify-between w-full py-8 border-b-[3px] border-machh-primary">
                <MachHTitle size="text-6xl">
                    {privacyPolicy.value.title}
                </MachHTitle>
            </div>
            <div class="w-full flex justify-center py-12 text-machh-primary text-justify">
                <HtmlBlock value={privacyPolicy.value.bodyHtml} />
            </div>
        </div>
    );
});
