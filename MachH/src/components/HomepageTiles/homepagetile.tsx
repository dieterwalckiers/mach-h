import type { Tile } from "~/contract";
import { component$, useContext } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { MainContext } from "~/routes/layout";
import { isMobile } from "~/util/rwd";
import HtmlBlock from "../HtmlBlock/htmlblock";

export interface Props {
    tile: Tile;
}

const HomepageTile = component$<Props>(({
    tile
}) => {
    const { backgroundImageUrl, caption, textHtml } = tile;
    const mainCtx = useContext(MainContext);
    const backgroundImageBestFitUrl = isMobile(mainCtx.screenSize) ?
        `${backgroundImageUrl}?w=450&h=450&fit=crop&auto=format` :
        `${backgroundImageUrl}?w=245&h=245&fit=crop&auto=format`;

    return (
        <Link href={tile.href} class={`w-full md:w-1/3 mb-4 md:mb-[2rem] md:relative
            md:[&:nth-child(3n)]:left-[2rem]
            md:[&:nth-child(3n+1)]:right-[2rem]
            `}>
            <div
                style={{
                    backgroundImage: `url(${backgroundImageBestFitUrl})`,
                    backgroundSize: 'cover',
                }}
                class={`aspect-square overflow-hidden relative ${backgroundImageUrl ? "hover:opacity-80 transition-opacity duration-300 cursor-pointer" : ""}`}
            >
                {
                    caption ? (
                        <div class="flex items-center justify-center text-center w-full h-full">
                            <label class="text-white text-3xl font-extrabold uppercase whitespace-break-spaces cursor-pointer">
                                {caption.replace(" ", "\n")}
                            </label>
                        </div>
                    ) : (textHtml ? (
                        <div class="cursor-pointer text-justify">
                            <label class="text-machh-primary font-bold cursor-pointer">
                                <HtmlBlock value={textHtml} class="text-justify" />
                            </label>
                            <label class="absolute bottom-[-8px] right-0 fill-current text-machh-primary text-3xl font-black py-0 px-2 bg-white cursor-pointer">
                                &#x2192;
                            </label>
                        </div>
                    ) : null)
                }
            </div>
        </Link>

    );
});

export default HomepageTile;