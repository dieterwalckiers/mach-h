import { ComponentType } from "react";

export function createIcon(caption: string): ComponentType {
    return () => <span>{caption}</span>
} 