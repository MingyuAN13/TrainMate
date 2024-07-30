/**
 * Type for the Files
 */
export interface File {
    /**
     * The Id of the file
     */
    id: string;
    /**
     * The index of the file, the file path in dCache.
     * Most of the time this is just going to be the file name.
     */
    index: string;
    /**
     * The type of the file.
     */
    type?: "file" | "folder";
    /**
     * The tags associated with the file.
     */
    tags: Tag[];
}

/**
 * Tag component interface
 */
export interface Tag {
    /**
     * The unique identifier of the tag.
     */
    id: string;
    /**
     * The name of the tag.
     */
    name: string;
    /**
     * The type of the tag.
     * Valid values are "user" and "custom".
     */
    type: "user" | "custom";
}

/**
 * User component interface
 */
export interface User {
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
    roles: Role[];
}

/**
 * A role that can be assigned to a user.
 */
export type Role = string;
