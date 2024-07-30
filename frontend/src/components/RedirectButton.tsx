import React from "react";
import { Button as NextUIButton } from "@nextui-org/button";
import { usePathname, useRouter } from "next/navigation";

/**
 * Props for the redirect button
 */
interface Props {
    /**
     * The link to redirect to
     */
    href: string;
    /**
     * The children of the button
     */
    children: React.ReactNode;
    /**
     * The color of the button
     */
    color: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined;
    /**
     * The rounding of the button
     */
    radius: "none" | "sm" | "md" | "lg" | "full" | undefined;
    /**
     * The style of the button
     */
    variant: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "ghost" | undefined;
    /**
     * Any additional props for the button
     */
    [key: string]: unknown;
}

export default function RedirectButton({ href, children, color, radius, variant, ...otherProps }: Props) {
    // Checks what our current page is
    const pathname = usePathname();
    const isCurrentPage = pathname === href;
    // should the button be solid or not
    const buttonVariant = isCurrentPage ? "solid" : variant;
    // Initializes the router for pages
    const router = useRouter();

    // Redirects to desired pagebased off of input.
    const redirect = () => {
        router.push(href);
    };

    // Reusable button to redirect
    return (
        <NextUIButton variant={buttonVariant} color={color} radius={radius} onClick={redirect} {...otherProps}>
            {children}
        </NextUIButton>
    );
}
