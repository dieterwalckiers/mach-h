import { component$ } from '@builder.io/qwik';
import Banner from '~/components/header/banner.svg?jsx'
import type { Settings } from '~/contract';

type Props = {
    settings: Settings;
}

const Header = component$<Props>(({ settings }) => {
    return (
        <div class="text-machh-primary w-full mb-4 flex flex-col items-center text-2xl">
            <label class="font-black">{settings.tagline}</label>
            <Banner />
        </div>
    );
});

export default Header;