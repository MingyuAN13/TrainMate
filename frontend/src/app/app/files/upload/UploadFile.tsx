// Required to render the page and components on the client side
"use client";

import React from "react";
import { IoMdClose } from "react-icons/io";
import DropZone from "./DropZone";
import { FileDisplay, FileKey } from "./page";
import { FaFile, FaFolder } from "react-icons/fa";
import { CircularProgress } from "@nextui-org/react";
import { IoMdCheckmark } from "react-icons/io";

/**
 * The props for upload file.
 */
interface UploadFileProps {
    /**
     * A callback function to set the entries that are selected
     */
    setSelectedEntries: (input: FileKey[]) => void;
    /**
     * The selected entries.
     */
    selectedEntries: FileKey[];
    /**
     * The Entries to display in the dropzone.
     */
    entriesToDisplay: FileDisplay[];
    /**
     * A callback function to remove an entry from upload batch.
     */
    removeSelectedEntries: (file: FileDisplay) => void;
    /**
     * Whether the upload process started.
     */
    isUploading: boolean;
}

// Upload file component
export default function UploadFile({
    setSelectedEntries,
    selectedEntries,
    entriesToDisplay,
    removeSelectedEntries,
    isUploading,
}: UploadFileProps) {
    return (
        <div className="items-center space-y-4">
            {/* The header*/}
            <h1 className="text-2xl font-semibold text-center">Upload File</h1>
            {/* The file upload button and clickable area */}
            <div>
                <div className="bg-white p7 rounded w-full mx-auto">
                    <div className="relative flex flex-col p-4 text-gray-400 border border-gray-200 rounded-xl">
                        <div
                            data-cy="upload-list"
                            className="h-[250px] overflow-auto custom-scrollbar relative text-gray-400 border border-gray-200 border-dashed rounded-xl cursor-pointer"
                        >
                            {/* The background image for the upload section */}
                            {!(selectedEntries.length > 0) ? (
                                // A dropzone the user can drag and drop files/directories to.
                                <DropZone setSelectedEntries={setSelectedEntries} />
                            ) : (
                                // Display the directories that are to be uploaded.
                                entriesToDisplay.map((entry, i) => (
                                    <div
                                        key={i}
                                        data-cy={`upload-item-${i.toString()}`}
                                        className="bg-white last:border-none h-[45px] px-2 text-md border-b-2 text-gray-500 dark:text-gray-400 flex justify-between items-center"
                                    >
                                        <div className="flex">
                                            <div className="mr-4">
                                                {/* Select the appropriate icon. */}
                                                {entry.type == "file" ? (
                                                    <FaFile color="gray" size={23} />
                                                ) : (
                                                    <FaFolder color="gray" size={23} />
                                                )}
                                            </div>
                                            <div className="text-lg">{entry.name}</div>
                                        </div>
                                        {/* When uploading show loading screen.  */}
                                        {/* When upload hasn't started show cancel button. */}
                                        {isUploading ? (
                                            entry.uploaded ? (
                                                <IoMdCheckmark size={23} />
                                            ) : (
                                                <CircularProgress size="sm" />
                                            )
                                        ) : (
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeSelectedEntries(entry);
                                                }}
                                                data-cy={`item-remove-${i.toString()}`}
                                                className="hover:cursor-pointer"
                                            >
                                                <IoMdClose size={22} />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
