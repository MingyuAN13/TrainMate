"use client";
import React, { useState } from "react";
import { useFileExplorerState } from "./FileExplorer";
import FileExplorer from "./FileExplorer";
import FileExplorerSideMenu from "./FileExplorerSideMenu";
import { File } from "@lib/types";

/**
 * Deletes a file
 * @returns response from server
 */
async function deleteFileRequest(fileId: string) {
    const respondse = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!respondse.ok) {
        throw new Error(`Failed to delete file: ${respondse.statusText}`);
    }
}
/**
 * The page that displays the files
 */
export default function Files() {
    const fileExporerState = useFileExplorerState();
    // The file to inspect in the inspector
    const [fileToInspect, setFileToInspect] = useState<File | null>(null);

    // Close the inspector
    const onClose = () => {
        setFileToInspect(null);
    };

    // Set the file to inspect
    const onFileClick = (file: File[]) => {
        if (file.length > 0) {
            setFileToInspect(file[0]);
        } else if (file.length === 0) {
            setFileToInspect(null);
        }
    };

    const refreshFile = (file: File) => {
        setFileToInspect(file);
        fileExporerState.files.update(file.id, file);
    };

    const handleDelete = (fileId: string) => {
        onClose();
        deleteFileRequest(fileId).catch(() => {
            fileExporerState.files.reload();
            console.error("Failed to delete file");
        });
        fileExporerState.files.remove(fileId);
    };

    return (
        <div className="flex w-full">
            {/* File explorer */}
            <div className="grow h-full p-6 mx-3 relative">
                <FileExplorer
                    fileExporerState={fileExporerState}
                    onSelectedFiles={onFileClick}
                    singleSelect={true}
                    showUploadButton={true}
                />
            </div>
            {/* File inspector */}
            {fileToInspect && (
                <FileExplorerSideMenu
                    file={fileToInspect}
                    onClose={onClose}
                    refreshFile={refreshFile}
                    deleteFile={(file) => handleDelete(file.id)}
                />
            )}
        </div>
    );
}
