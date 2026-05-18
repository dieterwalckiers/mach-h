export interface Event {
    title: string,
    date: string, // 26/10/2023
    dateNotation1: string; // DO 26 OKT
    time?: string;
    endTime?: string;
    timeNotation1?: string; // eg "20:00" or "20:00 - 22:00" in case of an end time
    place?: string;
    price?: string;
    slug: string;
    linkedProjects?: Project[],
    image?: Image,
    photos?: Image[],
    descriptionHtml?: string;
    callToActions?: CallToAction[];
    subscribable?: boolean;
    subscriptionMaxParticipants?: number;
    subscriptionIsPaid?: boolean;
    subscriptionPrice?: number;
    isFull?: boolean;
    confirmationMailSubject?: string;
    confirmationMailBody?: string;
    remarksCaption?: string;
}

export interface CallToAction {
    href: string;
    text: string;
}

export interface PlainOldTitleAndBody {
    title: string;
    bodyHtml: string;
}

export type AboutUs = PlainOldTitleAndBody;
export type PrivacyPolicy = PlainOldTitleAndBody;

export interface Image {
    url: string;
    origWidth: number;
    origHeight: number;
}

export interface Project {
    name: string,
    descriptionHtml: string,
    tileCaption?: string,
    gridImage?: Image,
    detailImage?: Image,
    galleryImages?: Image[],
    events: Event[],
    slug: string,
    hexColor?: string;
    callToActions?: CallToAction[];
    isFocused?: boolean;
}

export interface Post {
    title: string,
    date: string,
    bodyHtml: string,
    image?: Image,
    linkedProjects?: Project[],
    callToActions?: CallToAction[];
}

export interface Tile {
    backgroundImageUrl?: string;
    caption?: string;
    textHtml?: string;
    href?: string;
    isFocused?: boolean;
}

export interface Settings {
    tagline: string;
    isLinkToNewsPageInMenu: boolean;
}

export interface Attendee {
    id: number,
    subscribedAt: Date,
    firstName: string,
    lastName: string,
    email: string,
    eventSlug: string,
    remarks?: string,
    paymentStatus?: 'pending_payment' | 'confirmed' | 'failed',
    paymentId?: string,
    paidAt?: Date,
}