"use client";
import React, { useState, useEffect } from "react";
import Inspector from "@components/Inspector";
import { AiOutlineContainer } from "react-icons/ai";
import Modal from "@components/Modal";
import { Button, Input, CheckboxGroup, Checkbox, Chip } from "@nextui-org/react";

// User interface
interface Image {
    name: string;
    sylabs_path: string;
    parameters: string[];
    roles: string[];
}

// Prop types
interface Props {
    image: Image;
    onClose: () => void;
    fetchImages: () => Promise<void> | void;
}

// Defines the type for the roles
interface Roles {
    roles: string[];
}

export default function ImageSideMenu({ image, onClose, fetchImages }: Props) {
    const [selected, setSelected] = useState<string[]>([]);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [showModalSubmit, setShowModalSubmit] = useState(false);
    const [newImageName, setNewImageName] = useState("");
    const [roles, setRoles] = useState<string[]>([]);

    // Effect to update selected roles when image changes
    useEffect(() => {
        const imageRoles = image.roles;
        setSelected(imageRoles);
    }, [image]);

    // Handler function to toggle selection of roles
    const handleCheckboxChange = (value: string) => {
        // Toggle the item, if it is already selected, remove it, otherwise add it
        if (selected.includes(value)) {
            setSelected(selected.filter((item) => item !== value));
        } else {
            setSelected([...selected, value]);
        }
    };

    // Handle input change for new image name
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewImageName(event.target.value);
    };

    // Function to fetch roles from the server
    const fetchRoles = async () => {
        try {
            // Fetch from database
            const response = await fetch(`/api/roles`, { credentials: "include" });
            const data: Roles = (await response.json()) as Roles;
            setRoles(data.roles);
        } catch (error: unknown) {
            //Return error if fetching does not work
            console.error("Error fetching roles:", error);
        }
    };

    // Call fetchUsers, fetchRoles upon loading page, is seperate cause fetch is needed for reloading when changes are made in sidemenu
    useEffect(() => {
        void fetchRoles();
    }, []); // Empty dependency array ensures this runs only once

    //Delete selected user from database
    const handleDelete = async (image: Image) => {
        try {
            await fetch(`/api/images`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    name: image.name,
                }),
            });
        } catch (error) {
            console.error("Error deleting image:", error);
        }
        // Close delete modal
        setShowModalDelete(false);
        // Close Inspector component
        onClose();
        // Re-fetch the data to update the user list
        void fetchImages();
    };
    //Submit role changes to database
    const handleSubmit = async (image: Image) => {
        try {
            // Prepare data to update image roles
            await fetch(`/api/images`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ roles: selected, name: image.name }),
            });

            // If new image name is provided, update image name
            if (newImageName) {
                await fetch(`/api/images`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ previous_name: image.name, new_name: newImageName }),
                });
            }
        } catch (error) {
            console.error("Error submitting image data:", error);
        }
        // Close submit modal
        setShowModalSubmit(false);
        // Close Inspector component
        onClose();
        void fetchImages();
    };

    return (
        <Inspector onClose={onClose} dataCy="image">
            {/* Adds image name and container icon */}
            <div className="flex flex-row gap-1 self-start items-center mt-2">
                <AiOutlineContainer className="text-xl" />
                <h1 className="font-bold text-xl tracking-wide">Details of {image.name} </h1>
            </div>
            <div className="flex flex-col grow mt-4 gap-4">
                <div>
                    <h1 className="font-semibold">Rename image</h1>
                    {/* Displays current image name and allows editing of name*/}
                    <Input
                        placeholder={image.name}
                        size="lg"
                        className="max-w-xs"
                        variant="bordered"
                        labelPlacement="outside"
                        value={newImageName}
                        onChange={handleInputChange}
                        data-cy="image-name-input"
                    />
                </div>
                <div>
                    {/* Title of role assignment */}
                    <h1 className="font-semibold">Change role assignment</h1>
                    {/* Actual checkbox container */}
                    <div className="border-2 border-gray-200 rounded-xl shadow p-2" data-cy="image-checkbox-group">
                        <CheckboxGroup value={selected} onChange={setSelected}>
                            {/* Render each individual checkbox */}
                            {roles.map((value: string, index: number) => {
                                return (
                                    // Load in checkboxes for each user role
                                    <Checkbox
                                        key={index}
                                        value={value}
                                        isSelected={selected.includes(value)}
                                        onChange={() => {
                                            handleCheckboxChange(value);
                                        }}
                                    >
                                        {value}
                                    </Checkbox>
                                );
                            })}
                        </CheckboxGroup>
                    </div>
                </div>
                {image.parameters.length > 0 && (
                    <div>
                        {/* Shows all parameters */}
                        <h1 className="font-semibold">Assigned parameters</h1>
                        <p className="text-gray-500 font-light text-sm">Non-editable</p>
                        <div
                            className="border-2 border-gray-200 rounded-xl shadow p-2 overflow-auto"
                            data-cy="tag-container"
                        >
                            {image.parameters.map((image, index) => (
                                <Chip key={index} size="sm" color="default" className="mr-1 mb-1" variant="flat">
                                    {image}
                                </Chip>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {/* Buttons for deleting user and submitting changes */}
            <div className="flex flex-row justify-between">
                {/* Button to delete user */}
                <Button color="danger" onClick={() => setShowModalDelete(true)} data-cy="delete-button">
                    Delete
                </Button>
                {/* Button to delete submit */}
                <Button color="primary" onClick={() => setShowModalSubmit(true)} data-cy="submit-button">
                    Submit
                </Button>
            </div>
            {/* Modal that asks for confirmation of deletion */}
            <Modal
                title={"Confirm deletion of image"}
                body={`Are you sure you would like to delete ${image.name}?`}
                action={"Delete"}
                isVisible={showModalDelete}
                onClose={() => setShowModalDelete(false)}
                onClick={() => {
                    void handleDelete(image);
                }}
                dataCy="delete-modal"
                color="danger"
            />
            {/* Modal that asks for confirmation of submitting */}
            <Modal
                title={`Do you want to update the image: ${image.name}?`}
                body={
                    newImageName
                        ? `Image name: ${newImageName} \nSelected roles: ${selected.join(", ")}`
                        : `Image name: ${image.name} \nSelected roles: ${selected.join(", ")}`
                }
                action={"Submit"}
                isVisible={showModalSubmit}
                onClose={() => setShowModalSubmit(false)}
                onClick={() => {
                    void handleSubmit(image);
                }}
                dataCy="submit-modal"
                color="success"
            />
        </Inspector>
    );
}
