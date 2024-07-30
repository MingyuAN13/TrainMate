"use client";

import React, { useState } from "react";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import { FaFile, FaFolder, FaTrash } from "react-icons/fa";
import Inspector from "@components/Inspector";
import TagViewer from "@components/TagViewer";
import Modal from "@components/Modal";
import AssignUsers from "@components/AssignUsers";
import { Tag, File } from "@lib/types";
import { updateFile } from "@lib/network";
import { useCurrentUserTag } from "@lib/hooks";

// Defines the props for the side menu
interface Props {
    file: File;
    refreshFile: (file: File) => void;
    deleteFile: (file: File) => void;
    onClose: () => void;
}

/**
 * Update File Tags for a certain tag type
 * @param originalFile the file object with the original tags
 * @param newTags the new tags with the tag type
 * @param tagType the tag type
 * @param refresh the function to refresh the data
 * @returns response from server
 */
async function updateFileTags(file: File, newTags: Tag[], tagType: string, refresh: (file: File) => void) {
    const tags = [...file.tags.filter((tag) => tag.type !== tagType), ...newTags];
    const response = await updateFile(file.id, { tags: tags.map((tag) => tag.id) });
    if (!response.ok) {
        throw new Error(`Failed to update file tags: ${response.statusText}`);
    }

    refresh({
        ...file,
        tags: tags,
    });
}

/**
 * Filters the tags by type
 * @param tags the tags to filter
 * @param tagType the tag type to filter by
 * @returns the filtered tags
 */
function filterTagsByType(tags: Tag[], tagType: string): Tag[] {
    return tags.filter((tag) => tag.type === tagType);
}

// The inspector for the file explorer
export default function FileExplorerSideMenu({ file, refreshFile, deleteFile, onClose }: Props) {
    const currentUserTag = useCurrentUserTag();

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    return (
        <Inspector onClose={onClose} dataCy="file">
            <div className="flex flex-col h-full">
                <div className=" flex-grow">
                    {/* Icons for file or folder */}
                    <div className="flex gap-2 self-start items-center mt-2">
                        {file.type == "file" ? <FaFile color="gray" size={25} /> : <FaFolder color="gray" size={25} />}
                        <h1
                            className="overflow-ellipsis overflow-hidden whitespace-nowrap"
                            data-cy="file-inspector-name"
                        >
                            {file.index}
                        </h1>
                    </div>
                    {/* Assigner for the tags */}
                    <h1 className="mt-6 mb-1 text-lg">File Tags</h1>
                    <div className="min-h-28">
                        <TagViewer
                            selected={filterTagsByType(file.tags, "custom")}
                            onAddTag={(tag) => {
                                updateFileTags(
                                    file,
                                    [...filterTagsByType(file.tags, "custom"), tag],
                                    "custom",
                                    refreshFile,
                                ).catch(() => console.error("Failed to add tag"));
                            }}
                            onTagRemove={(id) => {
                                updateFileTags(
                                    file,
                                    file.tags.filter((tag) => tag.id !== id && tag.type == "custom"),
                                    "custom",
                                    refreshFile,
                                ).catch(() => console.error("Failed to remove tag"));
                            }}
                            dataCy="file"
                        />
                    </div>
                    {/* Assigner for the users */}
                    <h1 className="mt-6 mb-1 text-lg">Users With Access</h1>
                    <AssignUsers
                        minHeight={100}
                        maxHeight={250}
                        selectedUserTags={file.tags.filter((tag) => tag.type == "user" && tag.id != currentUserTag?.id)}
                        setSelectedUserTags={(tags) => {
                            if (!currentUserTag) return;
                            updateFileTags(file, [...tags, currentUserTag], "user", refreshFile).catch(() =>
                                console.error("Failed to add tag"),
                            );
                        }}
                        removeSelectedUserTag={(id) => {
                            updateFileTags(
                                file,
                                file.tags.filter((tag) => tag.id !== id && tag.type == "user"),
                                "user",
                                refreshFile,
                            ).catch(() => console.error("Failed to remove tag"));
                        }}
                    />
                </div>
                {/* Buttons for editing or deleting the file */}
                <div className="flex justify-between">
                    <Button
                        onClick={() => setShowDeleteModal(true)}
                        color="danger"
                        startContent={<FaTrash />}
                        data-cy="delete-file-button"
                    >
                        Delete
                    </Button>

                    <Link href={`/api/files/download/${file.id}`} download="" data-cy="download-file-link">
                        Download
                    </Link>
                </div>
                {/* Modal for deleting the file */}
                <Modal
                    title={`Delete ${file.index}?`}
                    body={"This file will be permanently deleted."}
                    action={"Delete"}
                    onClose={() => setShowDeleteModal(false)}
                    isVisible={showDeleteModal}
                    onClick={() => {
                        setShowDeleteModal(false);
                        deleteFile(file);
                    }}
                    dataCy="file-delete-modal"
                    color="danger"
                ></Modal>
            </div>
        </Inspector>
    );
}
