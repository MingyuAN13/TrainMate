import { NextRequest, NextResponse } from "next/server";

/**
 * Authorized response
 */
interface AuthorizedResponse {
    /**
     * If the user is successfully authorized.
     */
    success: boolean;
    /**
     * Possible error message
     */
    message?: string;
    /**
     * Redirect to the given page
     */
    redirect?: string;
}

/**
 * Middleware function that checks if the user is authorized to access the page
 *
 * It will automatically redirect the user if they are not authorized
 */
export async function middleware(request: NextRequest) {
    const restAddress = process.env.REST_HOST_ADDRESS;
    if (!restAddress) {
        throw new Error("REST_HOST_ADDRESS is not set");
    }

    const restPort = process.env.REST_PORT;
    if (!restPort) {
        throw new Error("REST_PORT is not set");
    }

    const { pathname } = request.nextUrl;

    const response = await fetch(`http://${restAddress}:${restPort}/api/auth/user_authorized`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            sessionId: request.cookies.get("session-id")?.value,
            page: pathname,
        }),
    });

    const data: AuthorizedResponse = (await response.json()) as AuthorizedResponse;

    if (!data.success || !response.ok) {
        return NextResponse.redirect(new URL(data.redirect ?? "/app/401", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/app/:path*"],
};
