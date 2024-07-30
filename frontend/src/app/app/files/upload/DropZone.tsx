"use client";

import React, { ChangeEvent, DragEvent, createRef, useState, MouseEvent } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";
import { FileKey } from "./page";

/**
 * Returns a filetype from a file system entry
 * @param file file system entry
 * @returns file
 */
function getFile(file: FileSystemFileEntry): Promise<File> {
    return new Promise((res, rej) => {
        file.file(res, rej);
    });
}

/**
 * Read a directory asyncronusly
 * @param reader file system reader
 * @returns file system entry
 */
function readDirectory(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
    return new Promise((res, rej) => {
        reader.readEntries(res, rej);
    });
}

/**
 * Function to genereate a map of a directory reccursively
 * @param directory The directory to start reading from
 * @param parentPath The parent path of the directory
 * @returns An array of file keys
 */
async function mapDirectory(directory: FileSystemDirectoryEntry, parentPath: string): Promise<FileKey[]> {
    let keys: FileKey[] = [];

    // create a directory reader
    const reader = directory.createReader();
    // read the files within the directory
    const files = await readDirectory(reader);

    // go through each entry, if it's an entry
    // add it to the key array otherwise go in to the directory
    const fileArray = Array.from(files);
    for (const entry of fileArray) {
        if (entry.isFile) {
            const file = entry as FileSystemFileEntry;
            const fileObject = await getFile(file);
            keys.push({
                path: parentPath + "/" + file.name,
                file: fileObject,
            });
        } else {
            const dir = entry as FileSystemDirectoryEntry;
            const newKeys = await mapDirectory(dir, parentPath + "/" + dir.name);
            keys = keys.concat(newKeys);
        }
    }

    return keys;
}

/**
 * Collect all entries from uploaded files
 * @param entries ulpoaded entries
 * @returns return the file keys
 */
async function collectSelectedEntries(entries: FileSystemEntry[]): Promise<FileKey[]> {
    let keys: FileKey[] = [];
    for (const entry of entries) {
        if (entry.isFile) {
            const file = entry as FileSystemFileEntry;
            keys.push({
                path: entry.name,
                file: await getFile(file),
            });
        } else {
            const directory = entry as FileSystemDirectoryEntry;
            const newKeys = await mapDirectory(directory, directory.name);
            keys = keys.concat(newKeys);
        }
    }
    return keys;
}

/**
 * The props for the dropzone
 */
interface DropZoneProps {
    /**
     * The entries that are selected by drag and drop
     * or file select
     */
    setSelectedEntries: (input: FileKey[]) => void;
}

export default function DropZone({ setSelectedEntries }: DropZoneProps) {
    // whether an item is being dragged above the dropzone
    const [beingDragged, setBeingDragged] = useState(false);
    // the refrence to the hiddne input file element
    const inputRef = createRef<HTMLInputElement>();
    // the refrence to the entire element
    const elementRef = createRef<HTMLDivElement>();

    /**
     * Function to handle files being dropped in the zone
     */
    const dropHandler = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const items = Array.from(e.dataTransfer.items);
        // Try to get the wekit entries of all uploads
        const entries = items.map((item) => {
            const entry = item.webkitGetAsEntry();
            if (!entry) throw Error("Failed to get file entry.");
            return entry;
        });
        // Collect the paths for all selected file entries
        collectSelectedEntries(entries)
            .then((keys) => setSelectedEntries(keys))
            .catch(() => console.log("Failed to read file entries."));
    };

    /**
     * This function is neccessery to use the dropHandler
     */
    const dragOverHandler = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    /**
     * When clicked on the dropzone programatically
     * click file input field
     */
    const onClickHandler = () => {
        if (!inputRef.current) return;
        inputRef.current.click();
    };

    /**
     * When the input element has a value change reassign the selected entries
     */
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const fileArray = Array.from(files);

        const keys: FileKey[] = [];
        for (const file of fileArray) {
            keys.push({
                path: file.name,
                file: file,
            });
        }

        setSelectedEntries(keys);
    };

    /**
     * When the mouse leaves set the state for styling
     */
    const handleOnDragLeave = (e: MouseEvent<HTMLDivElement>) => {
        if (!elementRef.current) return;
        if (!e.relatedTarget || !elementRef.current.contains(e.relatedTarget as HTMLElement)) {
            setBeingDragged(false);
        }
    };

    return (
        <div
            ref={elementRef}
            onClick={onClickHandler}
            onDrop={dropHandler}
            onDragOver={dragOverHandler}
            onDragLeave={handleOnDragLeave}
            onDragEnter={() => setBeingDragged(true)}
            data-cy="dropzone"
            // Highlight based on if item is being fragged
            className={`relative h-full w-full flex justify-center ${beingDragged ? "bg-sky-200" : "bg-white"}`}
        >
            {/* Hidden input field to trigger prompt */}
            <input
                data-cy="fileinput"
                ref={inputRef}
                type="file"
                className="hidden"
                multiple={true}
                onChange={handleInputChange}
            />
            {/* The style on the inside with the icon */}
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="m-1">
                    <IoCloudUploadOutline size={40} />
                </div>
                <p className="m-0">Drag your files here or click in this area.</p>
            </div>
        </div>
    );
}
