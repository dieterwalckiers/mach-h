export default {
    name: "post",
    title: "Post",
    type: "document",
    fields: [
        {
            name: "title",
            title: "Title",
            type: "string",
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: "date",
            title: "Date",
            type: "date",
            default: Date.now,
            validation: (Rule: any) => Rule.required(),
        },
        // {
        //     name: "body",
        //     title: "Body",
        //     type: "array",
        //     of: [
        //         { type: "block" },
        //         { type: "image" }, // note to self: so this is possible: array of both blocks and images... skipping it for now though for dev speed
        //     ],
        //     validation: (Rule: any) => Rule.required(),
        // },
        {
            name: "body",
            title: "Body",
            type: "array",
            of: [{ type: "block" }],
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: "image",
            title: "Image",
            type: "image",
        },
        {
            name: "linkedProjects",
            title: "Linked Projects",
            type: "array",
            of: [{ type: "reference", to: [{ type: "project" }] }],
        },
        {
            name: "callToActions",
            title: "Call-to-action's",
            type: "array",
            of: [{ type: "callToAction" }],
        },
    ],
    preview: {
        select: {
            title: "title",
            date: "date",
        },
        prepare(selection: any) {
            const { title, date } = selection;
            return {
                title: `${date}: ${title || "Untitled"}`,
            };
        },
    },
    orderings: [
        {
            title: 'Date',
            name: 'date',
            by: [
                { field: 'date', direction: 'desc' }
            ]
        },
    ],
};
