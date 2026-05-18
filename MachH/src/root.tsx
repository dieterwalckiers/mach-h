import { component$ } from '@builder.io/qwik';
import {
    QwikCityProvider,
    RouterOutlet,
    ServiceWorkerRegister,
} from '@builder.io/qwik-city';
import { RouterHead } from './components/router-head/router-head';

import './global.css';

export default component$(() => {
    /**
     * The root of a QwikCity site always start with the <QwikCityProvider> component,
     * immediately followed by the document's <head> and <body>.
     *
     * Don't remove the `<head>` and `<body>` elements.
     */

    return (
        <QwikCityProvider>
            <head>
                <meta charSet="utf-8" />
                <link rel="manifest" href="/manifest.json" />

                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=Architects+Daughter&family=Cabin+Sketch&family=Darumadrop+One&family=Gloria+Hallelujah&family=Gochi+Hand&family=Homemade+Apple&family=Leckerli+One&family=Neucha&family=Permanent+Marker&family=Reenie+Beanie&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,400&family=Rock+3D&family=Rock+Salt&family=Special+Elite&family=Zeyada&display=swap"
                    rel="stylesheet"
                />

                <RouterHead />
            </head>
            <body lang="en">
                <RouterOutlet />
                <ServiceWorkerRegister />
            </body>
        </QwikCityProvider>
    );
});
