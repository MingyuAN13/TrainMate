"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import ReusableTable from "@components/TableComponent";
import { Button, SortDescriptor, TableCell, TableRow, Input } from "@nextui-org/react";
import { FaPlus } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import Modal from "@components/Modal";
import { Tag } from "@lib/types";

// Columns for the table
const columns = [{ name: "NAME", uid: "name", sortable: true }];

export default function TagPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [showModal, setShowModal] = useState<"add" | "delete" | null>(null);
    const [isVisible, setVisible] = useState(false);
    const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
    const [tagName, setTagName] = useState("");
    const [tagExistsError, setTagExistsError] = useState(false);

    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "name",
        direction: "ascending",
    });
    const [filterValue, setFilterValue] = useState<string>("");
    const [selected, setSelected] = useState<string>("");

    // Previous selected state ref
    const prevSelectedRef = useRef<string>("");

    // fetches tags from api
    const fetchTags = async () => {
        try {
            // Fetch from database
            const response = await fetch(`/api/tags/admin`, {
                credentials: "include",
            });
            const data: Tag[] = (await response.json()) as Tag[];

            setTags(data);
        } catch (error: unknown) {
            //Return error if fetching does not work
            console.error("Error creating tag:", error);
        }
    };
    // Fetch tags when component mounts
    useEffect(() => {
        void fetchTags();
    }, []);

    // Add a new tag to db
    const addTag = async () => {
        try {
            const isTagNameExists = tags.some((tag) => tag.name.toLowerCase() === tagName.toLowerCase());
            if (isTagNameExists) {
                setTagExistsError(true);
                return;
            }
            // Fetch from database
            await fetch(`/api/tags/admin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    name: tagName,
                }),
            });
            // Makes sure modal is hidden after finalising creation
            setShowModal(null);

            // Force the tags to be fetched again so that the table is updated
            void fetchTags();
        } catch (error: unknown) {
            //Return error if fetching does not work
            console.error("Error creating tags:", error);
        }
    };

    // Delete a tag from db
    const deleteTag = async () => {
        try {
            // Fetch from database
            await fetch(`/api/tags/admin`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    name: selected,
                }),
            });
            // Makes sure modal is hidden after finalising deletion
            setShowModal(null);
            // Force the tags to be fetched again so that the table is updated
            void fetchTags();
        } catch (error: unknown) {
            //Return error if fetching does not work
            console.error("Error deleting tags:", error);
        }
    };

    // Update sorted and filtered tags based on sort descriptor, filter value, and tags
    useEffect(() => {
        const sorted = [...tags].sort((a, b) => {
            // Sort tags based on sort descriptor
            if (sortDescriptor.column === "name") {
                const larger = a.name > b.name;
                const num = larger ? 1 : -1;
                return sortDescriptor.direction === "ascending" ? -num : num;
            } else {
                const larger = a[sortDescriptor.column as string] > b[sortDescriptor.column as string];
                const num = larger ? 1 : -1;
                return sortDescriptor.direction === "ascending" ? -num : num;
            }
        });

        // Filter tags based on filter value
        const filtered = sorted.filter((tag) => tag.name.toLowerCase().includes(filterValue.toLowerCase()));

        setFilteredTags(filtered);
    }, [tags, sortDescriptor, filterValue]);
    // Handle tag name input change
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Ensures that no two tags will have same name
        setTagName(event.target.value);
        setTagExistsError(false);
    };

    // Toggle visibility of delete button based on selection
    useEffect(() => {
        if (selected) {
            if (selected === prevSelectedRef.current) {
                setVisible((prevVisible) => !prevVisible);
            } else {
                setVisible(true);
            }
            prevSelectedRef.current = selected;
        } else {
            setVisible(false);
        }
    }, [selected]);

    // Modal content
    const modalContent = useMemo(() => {
        switch (showModal) {
            case "add":
                return (
                    <div>
                        <Input
                            label="Tag"
                            placeholder="Enter tag name"
                            size="lg"
                            variant="underlined"
                            value={tagName}
                            onChange={handleInputChange}
                            data-cy="tag-input"
                        />
                        {tagExistsError && (
                            <span className="text-red-500" data-cy="tag-error">
                                Tag already exists
                            </span>
                        )}
                    </div>
                );
            case "delete":
                return <div>Are you sure you would like to delete tag: {selected}?</div>;
            default:
                return null;
        }
    }, [showModal, tagName, tagExistsError, selected]);
    // Top content for table (Add/Delete buttons)
    const topContent = (
        <div className="flex justify-end gap-3">
            {/* Delete button only visibile when a tag is selected */}
            {isVisible && (
                <Button
                    color="danger"
                    endContent={<MdCancel />}
                    onClick={() => setShowModal("delete")}
                    data-cy="delete-button"
                >
                    Delete Tag
                </Button>
            )}
            {/* Button to create new */}
            <Button color="primary" endContent={<FaPlus />} onClick={() => setShowModal("add")} data-cy="add-button">
                Add New
            </Button>
        </div>
    );
    // Main render
    return (
        <div className="grow h-full p-6 mx-3 relative" data-cy="tag-table-wrapper">
            {/* Tags table */}
            <ReusableTable
                columns={columns}
                setSortDescriptor={setSortDescriptor}
                sortDescriptor={sortDescriptor}
                filterValue={filterValue}
                topContent={topContent}
                setFilterValue={setFilterValue}
                onSelectionChange={(sel) => setSelected(sel[0])}
                placeholder={"Tags"}
                selectionMode={"single"}
                dataCy="tag"
            >
                {/* Loads in each row for tags */}
                {filteredTags.map((tag) => (
                    <TableRow key={tag.name} data-cy="table-row">
                        <TableCell>
                            <div className="flex justify-start grow">{tag.name}</div>
                        </TableCell>
                    </TableRow>
                ))}
            </ReusableTable>
            {/* Modal for creating tags */}
            <Modal
                title={showModal === "add" ? "Create new custom tag" : "Delete tag"}
                body={modalContent}
                action={showModal === "add" ? "Create" : "Delete"}
                isVisible={!!showModal}
                onClose={() => setShowModal(null)}
                color="success"
                onClick={() => (showModal === "add" ? void addTag() : void deleteTag())}
                dataCy={showModal === "add" ? "add-modal" : "delete-modal"}
            />
        </div>
    );
}
