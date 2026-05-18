import MachHTitle from "../shared/machhtitle";
import type { Post } from "~/contract";
import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import MachHImage from "../MachHImage";
import CallToActions from "../shared/calltoactions";
import HtmlBlock from "../HtmlBlock/htmlblock";

interface Props {
    post: Post;
    noBottomBorder?: boolean;
}

const PostCard = component$<Props>(({ post, noBottomBorder }) => {
    return (
        <div
            class={`flex flex-col justify-between text-machh-primary
                 text-lg ${noBottomBorder ? "" : "border-b-[3px] border-machh-primary"} py-8`}
        >
            <MachHTitle size="text-3xl">
                {post.title}
            </MachHTitle>
            <div class="pt-4 pb-3 md:pt-6 md:pb-12">
                {post.date}
            </div>
            <div class="flex flex-col-reverse md:flex-row text-justify">
                <div class="font-semibold">
                    {post.image && (
                        <div class="min-w-fit float-none md:float-left mr-0 mb-4 md:mr-8">
                            <MachHImage
                                image={post.image}
                                fit="fill"
                                objectFit="contain"
                                maxDim={460}
                                alt="post-image"
                                resolutionsOverride={[230, 460]}
                            />
                        </div>
                    )}
                    <HtmlBlock value={post.bodyHtml} />
                </div>
            </div>
            <div class="flex mt-8 justify-between items-center uppercase font-semibold">
                <div class="flex text-sm">
                    {post.linkedProjects?.map((project, i) => (
                        <Link href={`/${project.slug}`} key={`projlink${i}`}>
                            <label style={{ color: project.hexColor ?? "inherit" }} class={`block cursor-pointer hover:opacity-75 ${i !== 0 ? "ml-4" : ""}`}>
                                {project.name}
                            </label>
                        </Link>
                    ))}
                </div>
                {post.callToActions?.length && (
                    <CallToActions callToActions={post.callToActions} />
                )}
            </div>
        </div >
    )
})

export default PostCard;