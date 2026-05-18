export default {
    name: "privacyPolicy",
    title: "Privacy policy",
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
                title: "Privacy policy",
            };
        },
    },
};