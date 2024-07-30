"use client";
import React, { useState, useEffect } from "react";
import ReusableTable from "@components/TableComponent";
import { Button, SortDescriptor, TableCell, TableRow, Chip } from "@nextui-org/react";
import { FaPlus } from "react-icons/fa";
import CreateImageModal from "@app/app/images/CreateImageModal";
import ImageSideMenu from "./ImageSideMenu";

// Column header names
const columns = [
    { uid: "name", name: "Name", sortable: true },
    { uid: "path", name: "Sylabs Path", sortable: true },
    { uid: "roles", name: "Roles", sortable: true },
    { uid: "parameters", name: "Parameters", sortable: true },
];
// Image interface
interface Image {
    name: string;
    sylabs_path: string;
    parameters: string[];
    roles: string[];
}
// Role interface
interface Roles {
    roles: string[];
}

// Added empty page
export default function Upload() {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ column: "name", direction: "ascending" });
    const [filteredImages, setFilteredImages] = useState<Image[]>([]);
    const [filterValue, setFilterValue] = useState<string>("");
    const [images, setImages] = useState<Image[]>([]);
    const [selected, setSelected] = useState<Image | null>(null);
    const [roles, setRoles] = useState<string[]>([]);
    const [showModalAdd, setShowModalAdd] = useState(false);
    // fetches images from api
    const fetchImages = async () => {
        try {
            // Fetch from database
            const response = await fetch(`/api/images`, {
                credentials: "include",
            });
            const data: Image[] = (await response.json()) as Image[];

            setImages(data);
        } catch (error: unknown) {
            //Return error if fetching does not work
            console.error("Error creating tag:", error);
        }
    };

    // Fetches role from api
    const fetchRoles = async () => {
        try {
            // Fetch from database
            const response = await fetch("/api/roles", { credentials: "include" });
            const data: Roles = (await response.json()) as Roles;
            setRoles(data.roles);
        } catch (error: unknown) {
            //Return error if fetching does not work
            console.error("Error fetching roles:", error);
        }
    };
    // Fetch tags when component mounts
    useEffect(() => {
        void fetchImages();
        void fetchRoles();
    }, []);

    // Update sorted and filtered tags based on sort descriptor, filter value, and tags
    useEffect(() => {
        const sorted = [...images].sort((a, b) => {
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
        const filtered = sorted.filter((image) => image.name.toLowerCase().includes(filterValue.toLowerCase()));

        setFilteredImages(filtered);
    }, [images, sortDescriptor, filterValue]);

    //Set user to null when sidepanel closes
    const onClose = () => {
        //Set selected user to null
        setSelected(null);
    };

    //Loads in top content for the table
    const topContent = (
        <div className="flex justify-end gap-3">
            {/* Button to create new */}
            <Button color="primary" endContent={<FaPlus />} onClick={() => setShowModalAdd(true)} data-cy="add-button">
                Add New
            </Button>
        </div>
    );

    return (
        <div className="flex w-full">
            <div className="grow h-full p-6 mx-3 relative" data-cy="image-table-wrapper">
                {/* Reusable table used for image table */}
                <ReusableTable
                    setFilterValue={setFilterValue}
                    filterValue={filterValue}
                    sortDescriptor={sortDescriptor}
                    setSortDescriptor={(desc) => {
                        setSortDescriptor(desc);
                    }}
                    columns={columns}
                    topContent={topContent}
                    onSelectionChange={(sel) => {
                        const selectedImage = filteredImages.find((image) => image.name === sel[0]);
                        setSelected(selectedImage ?? null);
                    }}
                    selectionMode="single"
                    placeholder="Search Images"
                    dataCy="image"
                >
                    {/* Loads in each row for images */}
                    {filteredImages.map((image) => (
                        <TableRow key={image.name} data-cy="table-row">
                            {/* Cell for image name */}
                            <TableCell>
                                <div className="flex justify-start grow">{image.name}</div>
                            </TableCell>
                            {/* Cell for sylabs path */}
                            <TableCell>
                                <div className="flex justify-start grow">{image.sylabs_path}</div>
                            </TableCell>
                            {/* Cell for image roles */}
                            <TableCell>
                                {image.roles.map((image, index) => (
                                    <Chip key={index} size="sm" color="primary" className="mr-1 mb-1" variant="flat">
                                        {image}
                                    </Chip>
                                ))}
                            </TableCell>
                            {/* Cell for image parameters */}
                            <TableCell>
                                {image.parameters.slice(0, 3).map((image, index) => (
                                    <Chip key={index} size="sm" color="default" className="mr-1 mb-1" variant="flat">
                                        {image}
                                    </Chip>
                                ))}
                            </TableCell>
                        </TableRow>
                    ))}
                </ReusableTable>
                {/* When add new is pressed opens create image model to allow adding new image */}
                <CreateImageModal
                    roles={roles}
                    showModalAdd={showModalAdd}
                    setShowModalAdd={setShowModalAdd}
                    fetchImages={fetchImages}
                    allImages={images}
                ></CreateImageModal>
            </div>
            {/* Image sidemenu only opens when selected is true */}
            {selected && <ImageSideMenu onClose={onClose} image={selected} fetchImages={fetchImages} />}
        </div>
    );
}
