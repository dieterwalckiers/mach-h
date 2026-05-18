import { component$ } from '@builder.io/qwik';
import type { RequestEventLoader } from '@builder.io/qwik-city';
import { Link, routeLoader$ } from '@builder.io/qwik-city';
import sanityClient from '~/cms/sanityClient';
import PostCard from '~/components/PostCard/PostCard';
import MachHTitle from '~/components/shared/machhtitle';
import type { Post } from '~/contract';
import { normalizePost } from '~/util/normalizing';

const POSTS_ON_PAGE = 2;

export const usePosts = routeLoader$(async (requestEvent: RequestEventLoader) => {
  const from = parseInt(requestEvent.query.get("from") ?? "0");
  const to = parseInt(requestEvent.query.get("to") ?? `${POSTS_ON_PAGE}`);
  const fromMinusOne = Math.max(from - 1, 0);
  const toPlusOne = to + 1;
  const rawPosts = await sanityClient.fetch(`*[_type == "post"]|order(date desc){title,date,body,slug,callToActions,ctaText,"imageUrl": image.asset->url,"imageRef": image.asset._ref,linkedProjects[]->{name, slug, hexColor}}[${fromMinusOne}...${toPlusOne}]`);
  const posts = rawPosts.map((p: any) => normalizePost(p)) as Post[];
  let moreFurther;
  if (posts.length > (to - from)) {
    moreFurther = true;
    posts.pop();
  }
  if (from !== fromMinusOne) {
    posts.shift();
  }
  return {
    posts,
    pagingInfo: {
      isFirstPage: from === 0,
      isLastPage: !moreFurther,
      from,
      to,
    }
  }
})

export default component$(() => {

  const usePostsResult = usePosts();
  const { posts, pagingInfo } = usePostsResult.value;

  const prevLink = pagingInfo.isFirstPage ?
    null :
    `/news?from=${Math.max(0, pagingInfo.from - POSTS_ON_PAGE)}&to=${Math.max(0, pagingInfo.to - POSTS_ON_PAGE)}`;

  const nextLink = pagingInfo.isLastPage ?
    null :
    `/news?from=${pagingInfo.to}&to=${pagingInfo.to + POSTS_ON_PAGE}`;

  return (
    <div class="w-full">
      <div class="header flex items-center justify-between w-full py-8 border-b-[3px] border-machh-primary">
        <MachHTitle size="text-6xl">
          Nieuws
        </MachHTitle>
      </div>

      {posts.map((post, i) => (
        <PostCard
          post={post}
          key={`evtc${i}`}
          noBottomBorder={i === posts.length - 1 && pagingInfo.isFirstPage && pagingInfo.isLastPage}
        />
      ))}
      {
        pagingInfo.isFirstPage && pagingInfo.isLastPage ? null : (
          <div class="my-12 flex justify-between w-full text-machh-primary text-5xl">
            <Link class={`cursor-pointer ${prevLink ? "" : "invisible"}`} href={prevLink ?? ""}>
              &#x2190;
            </Link>
            <Link class={`cursor-pointer ${nextLink ? "" : "invisible"}`} href={nextLink ?? ""}>
              &#x2192;
            </Link>
          </div>
        )

      }
    </div>
  );
});
