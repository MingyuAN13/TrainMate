import { Tag } from "@lib/types";

/**
 * Response format for the most common endpoints
 */
export interface GenericResponse {
    /**
     * The success of the request.
     */
    success: boolean;
    /**
     * The message of the request.
     */
    message?: string;
}

export interface UserResponse {
    /**
     * The unique identifier of the user.
     */
    id: string;
    /**
     * The email of the user.
     */
    email: string;
    /**
     * The roles of the user.
     */
    roles: string[];
    /**
     * The tag associated with the user.
     */
    tag: Tag;
}

/**
 * Fetch the user currently logged in.
 * @returns current user
 */
export async function fetchCurrentUser(): Promise<UserResponse> {
    const responds = await fetch("/api/users/current", { credentials: "include" });
    if (!responds.ok) {
        throw new Error(`Failed to fetch user: ${responds.statusText}`);
    }
    const user = (await responds.json()) as UserResponse;
    return user;
}

/**
 * Fetch all tags, user and custom.
 * @returns array of tags
 */
export async function fetchTags(): Promise<Tag[]> {
    const tags = await fetch("/api/tags", { credentials: "include" });
    if (!tags.ok) {
        throw new Error(`Failed to fetch tags: ${tags.statusText}`);
    }
    const tagData: Tag[] = (await tags.json()) as Tag[];
    return tagData;
}

/**
 * Posts form data holding file paths as keys and blobs as values.
 * @returns response from server
 */
export async function postFile(body: FormData): Promise<Response> {
    return fetch("/api/files/upload", {
        method: "POST",
        body: body,
        credentials: "include",
    });
}

/**
 * Creates an event source for server events that gives infromation about upload progress.
 * @returns the event source
 */
export function eventSourceFileUpload(uid: string): EventSource {
    return new EventSource(`/api/files/statusstream/${uid}`);
}

/**
 * Modifies the properties of a file
 * @returns response from server
 */
export async function downloadFile(fileId: string): Promise<Response> {
    return fetch(`/api/files/download/${fileId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
}

/**
 * Update File
 * @param fileId the id of the file
 * @param data the data to update the file with
 * @returns response from server
 */
export async function updateFile(fileId: string, data: { tags: string[] }): Promise<Response> {
    return fetch(`/api/files/${fileId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
    });
}
