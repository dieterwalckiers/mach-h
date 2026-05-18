import { component$ } from "@builder.io/qwik";
import type { SanityImageProps } from "./SanityImage/SanityImage";
import SanityImage from "./SanityImage/SanityImage";
import type { Image } from "~/contract";

type Props = Omit<SanityImageProps, "image"> & {
    image?: Image;
}

const MachHImage = component$<Props>((props) => {
    return !props.image ? (
        <div></div>
    ) : (
        <SanityImage {...props as SanityImageProps} />
    )
})

export default MachHImage;