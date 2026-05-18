import { component$, useContext } from "@builder.io/qwik";
import type { RequestEventLoader } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import sanityClient from "~/cms/sanityClient";
import Gallery from "~/components/Gallery/gallery";
import MachHTitle from "~/components/shared/machhtitle";
import { normalizeProject } from "~/util/normalizing";
import type { Project } from "~/contract";
import MachHImage from "~/components/MachHImage";
import CallToActions from "~/components/shared/calltoactions";
import { isMobile } from "~/util/rwd";
import { MainContext } from "../layout";
import HtmlBlock from "~/components/HtmlBlock/htmlblock";

export const useProject = routeLoader$(async (requestEvent: RequestEventLoader) => {
    const [project] = await sanityClient.fetch(`*[_type == "project" && slug.current == "${requestEvent.params.slug}"]{...,name,hexColor,"gridImageUrl": coalesce(gridImage.asset->url, photo.asset->url),"gridImageRef": coalesce(gridImage.asset._ref, photo.asset._ref),"detailImageUrl": detailImage.asset->url,"detailImageRef": detailImage.asset._ref,description,"galleryPhotoUrls": gallery[].asset->url,"galleryPhotoRefs": gallery[].asset._ref}`);
    return project && normalizeProject(project);
})

const ProjectComponent = component$(() => {
    const projectSignal = useProject();
    const project = projectSignal.value as Project | undefined;
    const mainCtx = useContext(MainContext);

    if (!project) {
        return null;
    }

    return (
        <div class="w-full" key={`project${project.slug}`}>
            <div class="header flex items-center justify-between w-full py-8 border-b-[3px] border-machh-primary">
                <MachHTitle size="text-6xl" style={project.hexColor ? { color: project.hexColor } : {}}>
                    {isMobile(mainCtx.screenSize) ? project.tileCaption : project.name}
                </MachHTitle>
            </div>
            <div class="textContainer w-full py-8 text-machh-primary text-justify">
                <MachHImage
                    image={project.detailImage ?? project.gridImage}
                    alt={`${project.name} main image`}
                    // eslint-disable-next-line qwik/no-react-props
                    className="float-left mr-8 mb-4"
                    // width={360} height={360}
                    maxDim={360}
                    resolutionsOverride={[360]}
                />
                <HtmlBlock value={project.descriptionHtml} class="text-justify" />
                {project.callToActions?.length && (
                    <div class="flex justify-end">
                        <CallToActions callToActions={project.callToActions} />
                    </div>
                )}
                <Gallery images={project.galleryImages || []} />
            </div>
        </div>
    )
})

export default ProjectComponent;