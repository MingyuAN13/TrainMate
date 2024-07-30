"use-client";

import React from "react";
import { FaFile } from "react-icons/fa";
import { FaFolder } from "react-icons/fa";
import { File } from "@lib/types";
import { TagChip } from "@components/TagSelector";
import { ScrollShadow } from "@nextui-org/react";

/**
 * Display the primary file tags.
 * @param file The file to display.
 */
export function FileTags({ file, type }: { file: File; type: "user" | "custom" }) {
    const filteredTags = file.tags.filter((tag) => tag.type === type);

    return (
        <ScrollShadow hideScrollBar className="w-full flex py-0.5 gap-2" orientation="horizontal" data-cy="file-tags">
            {/* Map the tags to chips */}
            {filteredTags.map((tag, i) => (
                <TagChip key={i} tag={tag} />
            ))}
        </ScrollShadow>
    );
}

export function FileName({ file }: { file: File }) {
    return (
        <div className="flex items-center" data-cy="file-name">
            <div className="mr-2">
                {/* Based on the file type display an icon */}
                {file.type == "file" ? <FaFile color="gray" size={20} /> : <FaFolder color="gray" size={20} />}
            </div>
            <div>{file.index}</div>
        </div>
    );
}
