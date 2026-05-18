import type { AboutUs, Event, PlainOldTitleAndBody, Post, PrivacyPolicy, Project } from "~/contract";
import { toHTML } from "./portableText";

type AssetInfo = {
    assetId: string;
    dimensions: { width: number, height: number };
    format: string;
}

const pattern = /^image-([a-f\d]+)-(\d+x\d+)-(\w+)$/

function decodeAssetId(id: string): AssetInfo {
    const result = pattern.exec(id);
    if (result === null) {
        throw new Error("decodeAssetId: Invalid asset ID format (" + id + ")");
    }
    const [, assetId, dimensions, format] = result;
    const [width, height] = dimensions.split("x").map((v: string) => parseInt(v, 10));
    return {
        assetId,
        dimensions: { width, height },
        format,
    };
}

function extractOrigDims(ref: string): { origWidth: number, origHeight: number } {
    const { dimensions: { width: w, height: h } } = decodeAssetId(ref);
    return {
        origWidth: w,
        origHeight: h,
    }
}

export function normalizeEvent(
    event: any,
    skipLinkedProjects = false,
    extraProps: Partial<Event> = {},
): Event {
    const [y, m, d] = event.date.split('-');
    const image = event.imageUrl && {
        url: event.imageUrl,
        ...extractOrigDims(event.imageRef),
    };
    const photoUrls = (event.photoUrls || []) as string[];
    const photoRefs = (event.photoRefs || []) as string[];
    const photos = photoUrls.map((url: string, i: number) => ({
        url,
        ...extractOrigDims(photoRefs[i]),
    }));
    const jsDate = new Date(y, m - 1, d);
    const dayOfWeek = jsDate.toLocaleDateString('nl-NL', { weekday: 'short' });
    const month = jsDate.toLocaleDateString('nl-NL', { month: 'short' });
    return {
        ...event,
        image,
        photos,
        date: `${d}/${m}/${y}`,
        dateNotation1: `${dayOfWeek} ${d} ${month}`.toUpperCase(),
        timeNotation1: event.time ? `${event.time}${event.endTime ? ` - ${event.endTime}` : ""}` : "",
        slug: event.slug?.current,
        ...(!skipLinkedProjects ? { linkedProjects: event.linkedProjects?.map((p: any) => normalizeProject(p)) } : {}),
        descriptionHtml: toHTML(event.description),
        ...extraProps,
    }
}

export function normalizePost(post: any, skipLinkedProjects = false): Post {
    const [y, m, d] = post.date.split('-');
    const image = post.imageUrl && {
        url: post.imageUrl,
        ...extractOrigDims(post.imageRef),
    };
    return {
        ...post,
        image,
        date: `${d}/${m}/${y}`,
        ...(!skipLinkedProjects ? { linkedProjects: post.linkedProjects?.map((p: any) => normalizeProject(p)) } : {}),
        bodyHtml: toHTML(post.body),
    }
}

export function normalizeProject(project: unknown): Project {
    const p = project as Record<string, unknown>;
    const gridImage = p.gridImageUrl && {
        url: p.gridImageUrl as string,
        ...extractOrigDims(p.gridImageRef as string),
    }

    const detailImage = p.detailImageUrl && {
        url: p.detailImageUrl as string,
        ...extractOrigDims(p.detailImageRef as string),
    }

    const galleryPhotoUrls = (p.galleryPhotoUrls || []) as string[];
    const galleryPhotoRefs = (p.galleryPhotoRefs || []) as string[];
    const galleryImages = galleryPhotoUrls.map((url: string, i: number) => ({
        url,
        ...extractOrigDims(galleryPhotoRefs[i]),
    }));

    return {
        ...p,
        gridImage,
        detailImage,
        galleryImages,
        slug: (p.slug as { current?: string })?.current,
        descriptionHtml: toHTML(p.description as unknown[]),
    } as Project;
}

function normalizePlainOldTitleAndBody<T extends PlainOldTitleAndBody>(thang: any): T {
    return {
        ...thang,
        bodyHtml: toHTML(thang.body),
    }
}

export function normalizeAboutUs(aboutUs: unknown): AboutUs {
    return normalizePlainOldTitleAndBody<AboutUs>(aboutUs);
}

export function normalizePrivacyPolicy(privacyPolicy: unknown): PrivacyPolicy {
    return normalizePlainOldTitleAndBody<PrivacyPolicy>(privacyPolicy);
}