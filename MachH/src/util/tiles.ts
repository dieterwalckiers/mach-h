import type { Project, Tile } from "~/contract";

export function buildTiles(
    projects: Project[],
): Tile[] {
    return projects.map((project) => ({
        backgroundImageUrl: project.gridImage?.url,
        caption: project.tileCaption,
        text: project.name,
        href: `/${project.slug}`,
        isFocused: project.isFocused,
    }));
}