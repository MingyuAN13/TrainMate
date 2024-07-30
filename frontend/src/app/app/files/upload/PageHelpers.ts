import { Tag } from "@lib/types";
import { FileDisplay, FileKey } from "./page";

// Remove an entry from the upload batch
export const removeSelectedEntries = (
    setSelectedEntries: (input: (keys: FileKey[]) => FileKey[]) => void,
    entry: FileDisplay,
) => {
    if (entry.type === "dir") {
        // if the entry is a directory
        setSelectedEntries((selectedEntries) =>
            selectedEntries.filter((s) => s.path.substring(0, s.path.indexOf("/") + 1) !== entry.name),
        );
    } else {
        // if the entry is a file
        setSelectedEntries((selectedEntries) => selectedEntries.filter((s) => s.file.name !== entry.name));
    }
};

// Remove tags that are to be assigned
export const removeSelectedUserTag = (setSelectedUserTags: (input: (tags: Tag[]) => Tag[]) => void, id: string) => {
    setSelectedUserTags((selectedUserTags) => selectedUserTags.filter((userTag) => userTag.id !== id));
};
