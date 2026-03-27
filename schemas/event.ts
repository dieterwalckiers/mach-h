
export default {
    name: "event",
    title: "Event",
    type: "document",
    fields: [
        {
            name: "date",
            title: "Date",
            type: "date",
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: "time",
            title: "Time",
            type: "string",
            description: "hh:mm",
        },
        {
            name: "endTime",
            title: "End time",
            type: "string",
            description: "hh:mm",
        },
        {
            name: "place",
            title: "Place",
            type: "string",
        },
        {
            name: "price",
            title: "Price",
            description: "Price (free input)",
            type: "string",
        },
        {
            name: "title",
            title: "Title",
            type: "string",
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: "description",
            title: "Description",
            type: "array",
            of: [{ type: "block" }],
        },
        {
            name: "image",
            title: "Image",
            type: "image",
            description: "will be cropped to a square thumbnail on the events page"
        },
        {
            name: "photos",
            title: "Photos",
            type: "array",
            of: [{ type: "image", options: { hotspot: true } }],
            description: "Additional photos displayed on the event detail page",
        },
        {
            name: "callToActions",
            title: "Call-to-action's",
            type: "array",
            of: [{ type: "callToAction" }],
        },
        {
            name: "linkedProjects",
            title: "Linked Projects",
            type: "array",
            of: [{ type: "reference", to: [{ type: "project" }] }],
        },
        {
            name: "slug",
            title: "Slug",
            type: "slug",
            options: {
                source: (doc: any, { parent }: any) => parent && parent.title,
                maxLength: 96
            },
            validation: (Rule: any) => Rule.required(),
            description: "Id to create a unique event-link (eg. mach-h.be/events/{slug}). You can generate this or manually fill this in.",
        },
        {
            name: "subscribable",
            title: "Subscribable",
            type: "boolean",
            description: "If checked, visitors can subscribe to this event",
        },
        {
            name: "subscriptionMaxParticipants",
            title: "Max participants",
            type: "number",
            hidden: ({ document }: any) => !document.subscribable,
        },
        {
            name: "subscriptionIsPaid",
            title: "Paid event",
            type: "boolean",
            description: "If checked, visitors will be asked to pay when subscribing",
            hidden: ({ document }: any) => !document.subscribable,
        },
        {
            name: "subscriptionPrice",
            title: "Price",
            type: "number",
            description: "Price in € (number)",
            hidden: ({ document }: any) => !document.subscriptionIsPaid,
        },
        {
            name: "confirmationMailSubject",
            title: "Confirmation mail subject",
            type: "string",
            hidden: ({ document }: any) => !document.subscribable,
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: "confirmationMailBody",
            title: "Confirmation mail body",
            type: "text",
            hidden: ({ document }: any) => !document.subscribable,
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: "remarksCaption",
            title: "Remarks caption",
            type: "string",
            description: "If provided, an \"Opmerkingen\" field is included with this caption.",
            hidden: ({ document }: any) => !document.subscribable,
        }
    ],
    orderings: [
        {
            title: 'Date',
            name: 'date',
            by: [
                { field: 'date', direction: 'desc' }
            ]
        },
    ]

};