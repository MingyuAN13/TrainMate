import { useEffect, useState } from "react";
import { Tag } from "@lib/types";
import { fetchCurrentUser } from "@lib/network";

/**
 * Gets the current user tag
 * @returns the current user tag
 */
export function useCurrentUserTag(): Tag | null {
    const [currentUserTag, setCurrentUserTag] = useState<Tag | null>(null);

    useEffect(() => {
        // Get the current user tag
        fetchCurrentUser()
            .then((user) => {
                setCurrentUserTag(user.tag);
            })
            .catch((e: unknown) => console.log(e));
    }, []);

    return currentUserTag;
}
