import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

export default {
    name: "project",
    title: "Project",
    type: "document",
    orderings: [orderRankOrdering],
    fields: [
        {
            name: "name",
            title: "Name",
            type: "string",
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: "tileCaption",
            title: "Tile caption",
            type: "string",
            description: "Caption that appears on the tile on the home page (spaces become line breaks)"
        },
        {
            name: "gridImage",
            title: "Grid image",
            type: "image",
            description: "Image displayed on the project tile in the grid",
            validation: (Rule: unknown) => Rule.required(),
        },
        {
            name: "detailImage",
            title: "Detail image",
            type: "image",
            description: "Image displayed on the project detail page",
        },
        {
            name: "description",
            title: "Description",
            type: "array",
            of: [{ type: "block" }],
        },
        {
            name: "gallery",
            title: "Gallery",
            type: "array",
            of: [{ type: "image" }],
        },
        {
            name: "events",
            title: "Events",
            type: "array",
            of: [{ type: "reference", to: [{ type: "event" }] }],
        },
        {
            name: "slug",
            title: "Slug",
            type: "slug",
            options: {
                source: (doc: any, { parent }: any) => parent && parent.name,
                maxLength: 96
            },
            validation: (Rule: any) => Rule.required(),
            description: "Id to create a unique project-link (eg. mach-h.be/{slug}). You can generate this or manually fill this in.",
        },
        {
            name: "hexColor",
            title: "Color",
            type: "string",
            description: "Hex color code (eg. #d3d30a)",
        },
        {
            name: "callToActions",
            title: "Call-to-action's",
            type: "array",
            of: [{ type: "callToAction" }],
        },
        {
            name: "isFocused",
            title: "Is a focused project",
            type: "boolean",
            description: "If checked, this project will be shown in the focused projects section on top of the home page",
        },
        orderRankField({ type: "project" }),
    ],
};
