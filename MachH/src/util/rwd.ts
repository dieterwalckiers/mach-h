export const MY_XS_BREAKPOINT = 500;
export const SM_BREAKPOINT = 640;
export const MD_BREAKPOINT = 768;
export const LG_BREAKPOINT = 1024;
export const XL_BREAKPOINT = 1280;
export const XXL_BREAKPOINT = 1536;

export type ScreenSize = "my-xs" | "md" | "lg" | "xl" | "xxl" | "sm";

export function isMyXs() {
    return window.innerWidth <= MY_XS_BREAKPOINT;
}

export function isSm() {
    return window.innerWidth <= SM_BREAKPOINT;
}

export function isMd() {
    return window.innerWidth <= MD_BREAKPOINT;
}

export function isLg() {
    return window.innerWidth <= LG_BREAKPOINT;
}

export function isXl() {
    return window.innerWidth <= XL_BREAKPOINT;
}

export function isXxl() {
    return window.innerWidth <= XXL_BREAKPOINT;
}

export function isMobile(screenSize: ScreenSize): boolean {
    return screenSize === "my-xs" || screenSize === "sm";
}

export function getScreenSize(): ScreenSize {
    if (isMyXs()) {
        return "my-xs";
    } else if (isSm()) {
        return "sm";
    } else if (isMd()) {
        return "md";
    } else if (isLg()) {
        return "lg";
    } else if (isXl()) {
        return "xl";
    } else {
        return "xxl";
    }
}