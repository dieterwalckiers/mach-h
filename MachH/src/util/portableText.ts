import { toHTML as _toHTML } from "@portabletext/to-html";

export function toPlainText(blocks: any[] = []): string {
    return blocks
        // loop through each block
        .map(block => {
            // if it"s not a text block with children, 
            // return nothing
            if (block._type !== "block" || !block.children) {
                return ""
            }
            // loop through the children spans, and join the
            // text strings
            return block.children.map((child: any) => child.text).join("")
        })
        // join the paragraphs leaving split by two linebreaks
        .join("\n\n")
}

// This reverts the heading resets that tailwind does, for the rich text coming from the CMS
const revertHeadingStyleAttr = `style="font-size: revert; margin: revert; font-weight: revert;"`;
const revertPStyleAttr = `style="margin: revert;"`;

export function toHTML(blocks: any[] | undefined): string {
    if (!blocks) return "";
    return _toHTML(blocks, {
        components: {
            block: (props: any) => {
                switch (props.node.style) {
                    case "h1":
                        return `<h1 ${revertHeadingStyleAttr}>${props.children}</h1>`
                    case "h2":
                        return `<h2 ${revertHeadingStyleAttr}>${props.children}</h2>`
                    case "h3":
                        return `<h3 ${revertHeadingStyleAttr}>${props.children}</h3>`
                    case "h4":
                        return `<h4 ${revertHeadingStyleAttr}>${props.children}</h4>`
                    case "h5":
                        return `<h5 ${revertHeadingStyleAttr}>${props.children}</h5>`
                    case "h6":
                        return `<h6 ${revertHeadingStyleAttr}>${props.children}</h6>`
                    default:
                        return `<p ${revertPStyleAttr}>${props.children}</p>`
                }
            },
            // image: (props: any) => {
            //     return `<img src="${props.node.asset.url}" alt="${props.node.alt}" />`
            // },
            // link: (props: any) => {
            //     return `<a href="${props.mark.href}">${props.children}</a>`
            // }
        }
    });

}