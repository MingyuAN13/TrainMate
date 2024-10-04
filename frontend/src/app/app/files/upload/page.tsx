"use client";

// Import general React
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Required package for upload section
import UploadFile from "./UploadFile";

// Required package for conversion section
import ConversionSelection from "./ConversionSelection";

// Required package for upload button section
import TagViewer from "@components/TagViewer";
import AssignUsers from "@components/AssignUsers";
import { eventSourceFileUpload, fetchCurrentUser, postFile } from "@lib/network";
import { Button } from "@nextui-org/react";
import { Tag } from "@lib/types";
import { removeSelectedEntries, removeSelectedUserTag } from "./PageHelpers";

/**
 * Type for conversion options
 */
export interface ConOption {
    key: string;
    name: string;
}

/**
 * A type that helps keep track of the directory
 * structure of an uploaded directory
 */
export interface FileKey {
    path: string;
    file: File;
    address: string;
}

/**
 * A type that helps keep track of what to display
 * in the dropzone
 */
export interface FileDisplay {
    name: string;
    type: "dir" | "file";
    uploaded: boolean;
}

/* ==============================================================
   WARNING: DOES NOT WORK WITH FILE NAMES INCLUDING '/' CHARACTER
   WARNING: TWO PEOPLE CAN NOT UPLOAD FILES WITH THE SAME NAME
   ============================================================== */

// Export the different components to the page
export default function UploadPage() {
    // User tags that are currently selected
    const [selectedUserTags, setSelectedUserTags] = useState<Tag[]>([]);
    // Custom tags that are currently selected
    const [selectedCustomTags, setSelectedCustomTags] = useState<Tag[]>([]);
    // Filesystem entries that are currently selected
    const [selectedEntries, setSelectedEntries] = useState<FileKey[]>([]);
    // File conversion option that is currently selected
    const [selectedOption, setSelectedOption] = useState<string>("none");
    // File entries that should be displayed to be uploaded
    const [entriesToDisplay, setEntriesToDisplay] = useState<FileDisplay[]>([]);
    // The address that the file should be uploaded to
    const [uploadAddress, setUploadAddress] = useState<string>("");
    // Whether an upload process has started
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    // Ref to keep track of event source
    const eventSource = useRef<EventSource | null>(null);

    useEffect(() => {
        // When entries are selected set the how they will be displayed
        const display: FileDisplay[] = [];
        // Set the displayed items
        selectedEntries.forEach((entry) => {
            console.log(entry);
            entry.address = uploadAddress;
            const path = entry.path;
            if (path.includes("/")) {
                const dirName = path.substring(0, path.indexOf("/") + 1);
                if (!display.some((d) => d.name === dirName)) {
                    display.push({ name: dirName, type: "dir", uploaded: false });
                }
            } else {
                display.push({ name: entry.file.name, type: "file", uploaded: false });
            }
        });
        setEntriesToDisplay(display);
    }, [selectedEntries, uploadAddress]);

    useEffect(() => {
        // When all entries have been uploaded
        // close the sse connection
        if (!isUploading) return;
        if (!eventSource.current) return;

        if (entriesToDisplay.every((entry) => entry.uploaded)) {
            eventSource.current.close();
            router.push("/app/files");
        }
    }, [entriesToDisplay, isUploading, router]);

    // Handle the file upload process with chunked upload
    const handleUpload = async () => {
        // Get the user id of the current user
        const user = await fetchCurrentUser();
        const uid = user.id;

        // Start uploading
        setIsUploading(true);
        // Create the form data to be sent to the server
        const formData = new FormData();
        selectedEntries.forEach((entry) => {
            formData.append(entry.path, entry.file);
            formData.append(`${entry.path}_address`, entry.address);  
    });
        selectedCustomTags.concat(selectedUserTags).forEach((tag) => formData.append("tags[]", tag.id));
        console.log("FORM DATA");
        console.log(selectedCustomTags.concat(selectedUserTags));
        console.log(user.email);
        formData.append("format", selectedOption);

        // Send the files
        await postFile(formData);

        try {
            // Start an event source to listen to upload progress
            const eSource = eventSourceFileUpload(uid);
            eSource.onmessage = (ev: MessageEvent<string>) => {
                // Assign uploaded as files get done being uploaded
                setEntriesToDisplay((prevEntries) =>
                    prevEntries.map((entry) => (entry.name === ev.data ? { ...entry, uploaded: true } : entry)),
                );
            };
            eventSource.current = eSource;
        } catch {
            console.error("Failed to create event source");
        }
    };
    return (
        <div className="flex w-full justify-center items-center max-w-[800px]">
            {/* Return the different components to the page in their respective order */}
            <div className="flex flex-col bg-white rounded-xl p-6 shadow w-full gap-6">
                {/* Component that hosts the files to upload and the dropzone */}
                <UploadFile
                    isUploading={isUploading}
                    entriesToDisplay={entriesToDisplay}
                    setSelectedEntries={setSelectedEntries}
                    selectedEntries={selectedEntries}
                    removeSelectedEntries={(entry) => removeSelectedEntries(setSelectedEntries, entry)}
                />
                <div className="flex flex-col w-full">
                {/* The address component*/}
                <label htmlFor="upload-address" className="text-md font-semibold mb-2">Upload Address:</label>
                <input
                    id="upload-address"
                    type="text"
                    value={uploadAddress}
                    onChange={(e) => setUploadAddress(e.target.value)}  // 更新状态
                    className="border border-gray-300 rounded p-2 w-full"  // 宽度设为100%
                    placeholder="/"
                />
            </div>
                <div className="flex flex-row gap-5 h-[300px]">
                    {/* The tag selection component created by Ilse */}
                    <div className="basis-1/3 flex flex-col">
                        <div>Select your tags.</div>
                        <div className="mt-2 flex-grow">
                            <TagViewer
                                selected={selectedCustomTags}
                                onAddTag={(tag) => setSelectedCustomTags([...selectedCustomTags, tag])}
                                onTagRemove={(id) =>
                                    setSelectedCustomTags(selectedCustomTags.filter((tag) => tag.id !== id))
                                }
                                dataCy="custom"
                            />
                        </div>
                    </div>
                    {/* Component to assign users */}
                    <div className="basis-1/3 flex flex-col">
                        <div>Select users with access.</div>
                        <div className="mt-2 flex-grow">
                            <AssignUsers
                                selectedUserTags={selectedUserTags}
                                setSelectedUserTags={setSelectedUserTags}
                                removeSelectedUserTag={(id) => removeSelectedUserTag(setSelectedUserTags, id)}
                            />
                        </div>
                    </div>
                    {/* Component to select the type of conversion to perform */}
                    <div className="flex flex-col basis-1/3">
                        <div>Select file conversion.</div>
                        <div className="flex flex-grow mt-2">
                            <ConversionSelection
                                selectedOption={selectedOption}
                                setSelectedConversion={setSelectedOption}
                            />
                        </div>
                    </div>
                </div>
                {/* Submit button */}
                <Button
                    isDisabled={false}
                    className="w-full text-md font-semibold"
                    onClick={() => void handleUpload()}
                    color="primary"
                    data-cy="upload-button"
                >
                    Upload
                </Button>
            </div>
        </div>
    );
}
