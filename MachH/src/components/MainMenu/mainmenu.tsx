import type { JSXChildren } from '@builder.io/qwik';
import { component$, useContext, useStore } from '@builder.io/qwik';
import { useLocation, useContent, Link, useNavigate } from '@builder.io/qwik-city';
import Stamp from '~/img/logo_mach_h_def_stamp.png?jsx'
import useCloseOnOutsideClick from '~/util/useCloseOnOutsideClick';
import { MainContext } from '~/routes/layout';
import { isMobile } from '~/util/rwd';
import type { Settings } from '~/contract';

type Props = {
    settings: Settings;
}

const MainMenu = component$<Props>(({ settings }) => {
    const { menu } = useContent();
    const { url } = useLocation();

    const mainCtx = useContext(MainContext);

    const ref = useCloseOnOutsideClick();

    const store = useStore<{ showProjectsSubmenu: boolean }>({
        showProjectsSubmenu: false,
    });

    const nav = useNavigate();

    return (
        <div class="w-full flex items-center justify-between border-machh-primary border-b-[3px] pb-6">
            <div>
                <Link href="/">
                    <Stamp style={{ width: "60px", height: "60px" }} />
                </Link>
            </div>
            <div class="flex items-center relative">
                <button
                    type="button"
                    class="block md:hidden text-gray-500 hover:text-white focus:text-white focus:outline-none"
                    onClick$={() => (mainCtx.showMobileMenu = !mainCtx.showMobileMenu)}
                >
                    <svg class="h-12 w-12 fill-machh-primary" viewBox="0 0 24 24">
                        {mainCtx.showMobileMenu ? (
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M19 13H5v-2h14v2zm0-5H5V6h14v2zm0 10H5v-2h14v2z"
                            />
                        ) : (
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"
                            />
                        )}
                    </svg>
                </button>
                <nav
                    ref={ref}
                    class={`${mainCtx.showMobileMenu ? 'block' : 'hidden'}
                    text-machh-primary lowercase text-3xl font-semibold
                    flex flex-col
                    absolute top-0 right-0
                    bg-white
                    py-4
                    border-2 border-machh-primary
                    md:flex-row
                    md:static md:border-none
                    md:flex md:items-center md:justify-between md:ml-12
                    md:text-xl
                    z-10
                    `}
                >
                    {menu ?
                        menu.items?.reduce((reduced, item, i) => {
                            reduced.push(
                                <h5
                                    class={`mt-4 ml-4 mr-4 md:mt-0 md:mr-0 md:ml-12 ${url.pathname === item.href ? "underline underline-offset-8" : ""}`}
                                    key={item.href}
                                >
                                    <Link href={item.href} onClick$={() => mainCtx.showMobileMenu = false}>
                                        {item.text}
                                    </Link>
                                </h5>
                            )

                            if (i === 0) { // hack menu to add projects link
                                reduced.push(
                                    <>
                                        <h5
                                            class={`mt-4 ml-4 mr-4 md:mt-0 md:mr-0 md:ml-12 relative`}
                                            key={item.href}
                                        >
                                            <label class="cursor-pointer projectsSubmenu-trigger"
                                                onClick$={() => {
                                                    if (isMobile(mainCtx.screenSize)) {
                                                        nav("/#projects");
                                                        mainCtx.showMobileMenu = false;
                                                    } else {
                                                        store.showProjectsSubmenu = !store.showProjectsSubmenu
                                                    }
                                                }}
                                                onMouseEnter$={() => isMobile(mainCtx.screenSize) ? {} : store.showProjectsSubmenu = true}
                                                onMouseLeave$={(e) => {
                                                    if (e.relatedTarget && (e.relatedTarget as HTMLElement).classList.contains("projectsSubmenu-wrapper")) {
                                                        return;
                                                    }
                                                    store.showProjectsSubmenu = false;
                                                }}
                                            >
                                                projects
                                            </label>
                                            {store.showProjectsSubmenu && (
                                                <div
                                                    class="projectsSubmenu-wrapper pt-4 absolute top-4 left-0"
                                                    onMouseLeave$={(e) => {
                                                        if (e.relatedTarget && (e.relatedTarget as HTMLElement).classList.contains("projectsSubmenu-trigger")) {
                                                            return;
                                                        }
                                                        store.showProjectsSubmenu = false;
                                                    }}
                                                >
                                                    <div class="bg-white border border-machh-primary flex flex-col p-2">
                                                        {(mainCtx.projects || []).map((project, i) => (
                                                            <Link
                                                                href={`/${project.slug}`}
                                                                onClick$={() => mainCtx.showMobileMenu = false}
                                                                key={`projItm${i}`}
                                                                style={project.hexColor ? { color: project.hexColor } : {}}
                                                            >
                                                                {project.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </h5>
                                    </>
                                )
                            }

                            if (settings.isLinkToNewsPageInMenu && i === menu.items!.length - 1) {
                                reduced.push(
                                    <h5
                                        class={`mt-4 ml-4 mr-4 md:mt-0 md:mr-0 md:ml-12 ${url.pathname === "/news" ? "underline underline-offset-8" : ""}`}
                                        key="/news"
                                    >
                                        <Link href="/news" onClick$={() => mainCtx.showMobileMenu = false}>
                                            Nieuws
                                        </Link>
                                    </h5>
                                )
                            }
                            return reduced;
                        }, [] as JSXChildren[])
                        : null}
                </nav>
            </div>
        </div>
    );
});

export default MainMenu;
