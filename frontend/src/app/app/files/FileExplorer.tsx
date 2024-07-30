"use client";

import React, { RefObject, useState } from "react";
import {
    Button,
    Input,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@nextui-org/react";
import { AsyncListData, useAsyncList } from "react-stately";
import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll";
import { FileName, FileTags } from "./FileComponent";
import { FaExclamationCircle, FaFolderPlus, FaSearch } from "react-icons/fa";
import { FaFilterCircleXmark, FaUpload } from "react-icons/fa6";
import { TagSelector } from "@components/TagSelector";
import { Tag, File } from "@lib/types";
import { useRouter } from "next/navigation";

/**
 * Type for the properties of the component
 */
export interface FileExplorerProps {
    /** The state of the file explorer */
    fileExporerState: FileExporerState;
    /**
     * When a file gets selected, this function is called with the files.
     * If `singleSelection` is true, then 0 or 1 file will be passed.
     * If `multipleSelection` is true, then an array of files will be passed.
     */
    onSelectedFiles: (files: File[]) => void;
    /**
     * When enabled, at most one file can be selected at a time, otherwise multiple files can be selected
     */
    singleSelect?: boolean;
    /**
     * If the upload file button should show
     */
    showUploadButton?: boolean;
}

/**
 * The responds from the backend when fetching files
 */
interface FetchFilesResponse {
    /**
     * The files that the user has access to.
     */
    files: File[];
    /**
     * The next url to fetch the next page of files.
     */
    next?: string;
}

/**
 * A filter that can be used to filter the files.
 */
interface Filter {
    /**
     * The name search of the filter.
     */
    search: string;
    /**
     * The tag search of the filter.
     */
    tags: Tag[];
}

/**
 * The contents on top of the file explorer
 */
function FileExplorerTopContent({
    searchText,
    setSearchText,
    setTagsFilter,
    showUploadButton,
}: {
    searchText: string;
    setSearchText: (searchText: string) => void;
    setTagsFilter: (filter: Tag[]) => void;
    showUploadButton: boolean;
}) {
    return (
        <div className="flex gap-3 p-3 bg-white rounded-xl" data-cy="file-explorer-top-content">
            <Input
                placeholder="Search files"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                startContent={<FaSearch />}
                data-cy="search-input"
            />
            {/* Tag filter */}
            <TagSelector type="custom" setSelectedTags={setTagsFilter} />
            {/* User tag filter */}
            <TagSelector type="user" setSelectedTags={setTagsFilter} />
            {/* Div needs to be around there otherwise the button icon is not visible */}
            <div>{showUploadButton && <UploadButton />}</div>
        </div>
    );
}

/**
 * The contents on the bottom of the file explorer
 */
function FileExplorerBottomContent({ hasMore, loaderRef }: { hasMore: boolean; loaderRef: RefObject<HTMLElement> }) {
    return hasMore ? (
        <div className="flex w-full justify-center">
            <Spinner ref={loaderRef} color="primary" />
        </div>
    ) : null;
}

/**
 * The upload button that redirects to the upload page.
 */
function UploadButton() {
    const router = useRouter();
    return (
        <Button
            color="primary"
            size="md"
            variant="flat"
            onClick={() => {
                router.push("./files/upload");
            }}
            startContent={<FaUpload />}
            data-cy="upload-button"
        >
            Upload file
        </Button>
    );
}

/**
 * Display when the file exporer is empty.
 * Displays different content depending on whether there is a filter set.
 */
function FileExplorerEmptyContent({
    search,
    tags,
    showUploadButton,
}: {
    search: string;
    tags: Tag[];
    showUploadButton: boolean;
}) {
    // If there is no filter set, we show a generic message.
    if (search === "" && tags.length === 0) {
        return (
            <div className="flex flex-col items-center space-y-4">
                <FaFolderPlus className="text-6xl text-red-500" />
                <div className="mt-4 text-center space-y-2">
                    <h3 className="text-xl font-bold text-red-500">No files found</h3>
                    <p className="text-sm text-gray-500">
                        There are no files uploaded. Please upload files to continue.
                    </p>
                </div>
                {showUploadButton && <UploadButton />}
            </div>
        );
    }

    // If there is a filter set, we show a message that there are no files that match the filter.
    return (
        <div className="flex flex-col justify-center items-center space-y-4">
            <FaFilterCircleXmark className="text-6xl text-red-500" />
            <div className="mt-4 text-center space-y-2 max-w-md w-full">
                <h3 className="text-xl font-bold text-red-500">No files found</h3>
                <p className="text-sm text-gray-500">
                    No files were found that match your search criteria. Please try again with different search terms or
                    select a different tag.
                </p>
            </div>
            {showUploadButton && <UploadButton />}
        </div>
    );
}

function FileExplorerErrorContent() {
    return (
        <div className="flex flex-col justify-center items-center space-y-4 h-full">
            <div className="flex flex-col justify-center items-center space-y-4 max-w-md w-full">
                <FaExclamationCircle className="text-9xl text-red-500" />
                <div className="mt-4 space-y-2">
                    <h3 className="text-4xl font-bold text-red-500 text-center">An error occurred</h3>
                    <p className="text-md text-gray-500">
                        An error occurred while loading the files. Please try again later or contact the administrator.
                    </p>
                </div>
            </div>
        </div>
    );
}

export interface FileExporerState {
    files: AsyncListData<File>;
    hasMore: boolean;
    isLoading: boolean;
    searchText: string;
    setSearchText: (searchText: string) => void;
    tagsFilter: Tag[];
    setTagsFilter: (filter: Tag[]) => void;
}

export function useFileExplorerState(): FileExporerState {
    const [initialLoad, setInitialLoad] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [searchText, setSearchText] = useState<string>("");
    const [tagsFilter, setTagsFilter] = useState<Tag[]>([]);

    // Fetch the files from the backend
    const files: AsyncListData<File> = useAsyncList({
        async load({ signal, cursor, filterText }) {
            const filter = JSON.parse(filterText ?? "") as Filter;
            let requestUrl = "/api/files?";
            if (filter.search !== "") {
                requestUrl += `search=${filter.search}`;
            }
            for (const tag of filter.tags) {
                requestUrl += `&tags=${tag.id.toString()}`;
            }

            const response = await fetch(cursor ?? requestUrl, {
                signal,
                credentials: "include",
            });
            const json: FetchFilesResponse = (await response.json()) as FetchFilesResponse;

            setHasMore(json.next != undefined);
            setInitialLoad(false);

            return {
                items: json.files,
                cursor: json.next,
            };
        },
        initialFilterText: JSON.stringify({ search: searchText, tags: tagsFilter }),
    });

    return {
        files,
        hasMore,
        isLoading: files.loadingState === "loading" || files.loadingState === "filtering" || initialLoad,
        searchText,
        setSearchText: (searchText: string) => {
            setSearchText(searchText);
            files.setFilterText(JSON.stringify({ search: searchText, tags: tagsFilter }));
        },
        tagsFilter,
        setTagsFilter: (tags: Tag[]) => {
            setTagsFilter(tags);
            files.setFilterText(JSON.stringify({ search: searchText, tags }));
        },
    };
}

/**
 * A custom file explorer component that is quite versatile
 */
export default function FileExplorer({
    fileExporerState,
    showUploadButton = true,
    singleSelect = true,
    onSelectedFiles,
}: FileExplorerProps) {
    const { files, hasMore, isLoading, searchText, setSearchText, tagsFilter, setTagsFilter } = fileExporerState;

    const [loaderRef, scrollerRef] = useInfiniteScroll({ hasMore, onLoadMore: () => files.loadMore() });

    // If there is an error, display the error message
    if (files.loadingState === "error") {
        return <FileExplorerErrorContent />;
    }

    return (
        <Table
            isHeaderSticky
            baseRef={scrollerRef}
            topContentPlacement="outside"
            selectionMode={singleSelect ? "single" : "multiple"}
            onSelectionChange={(selection) => {
                if (selection === "all") {
                    onSelectedFiles(files.items);
                    return;
                }
                const selectedFiles = files.items.filter((file) => selection.has(file.id.toString()));
                onSelectedFiles(selectedFiles);
            }}
            topContent={
                <FileExplorerTopContent
                    searchText={searchText}
                    setSearchText={setSearchText}
                    setTagsFilter={setTagsFilter}
                    showUploadButton={showUploadButton}
                />
            }
            bottomContent={<FileExplorerBottomContent hasMore={hasMore} loaderRef={loaderRef} />}
            classNames={{
                base: "h-full",
                wrapper: "h-full justify-start",
            }}
            data-cy="file-explorer"
        >
            <TableHeader>
                <TableColumn key="index">Name</TableColumn>
                <TableColumn key="tags">Tags</TableColumn>
                <TableColumn key="users">Users</TableColumn>
            </TableHeader>
            <TableBody
                isLoading={isLoading}
                items={files.items}
                loadingContent={<Spinner color="primary" />}
                emptyContent={
                    <FileExplorerEmptyContent
                        search={searchText}
                        tags={tagsFilter}
                        showUploadButton={showUploadButton}
                    />
                }
            >
                {(file) => (
                    <TableRow key={file.id} data-cy="file-row">
                        <TableCell>
                            <FileName file={file} />
                        </TableCell>
                        <TableCell>
                            <FileTags type="custom" file={file} />
                        </TableCell>
                        <TableCell>
                            <FileTags type="user" file={file} />
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
