export default {
    name: "about",
    title: "About",
    type: "document",
    fields: [
        {
            name: "title",
            title: "Title",
            type: "string",
        },
        {
            name: "body",
            title: "Body",
            type: "array",
            of: [{ type: "block" }],
        },
    ],
    preview: {
        prepare() {
            return {
                title: "About",
            };
        },
    },
};