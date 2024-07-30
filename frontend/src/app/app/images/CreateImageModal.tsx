import React, { useState, useEffect, useCallback } from "react";
import Modal from "@components/Modal";
import { Checkbox, CheckboxGroup, Input } from "@nextui-org/react";
import MultipleInput from "@components/MultipleInput";

// Props interface for CreateImageModal component
interface Props {
    roles: string[];
    showModalAdd: boolean;
    setShowModalAdd: (show: boolean) => void;
    fetchImages: () => Promise<void> | void;
    allImages: Image[];
}

// Image interface
interface Image {
    name: string;
    sylabs_path: string;
    parameters: string[];
    roles: string[];
}

export default function CreateImageModal({ roles, showModalAdd, setShowModalAdd, fetchImages, allImages }: Props) {
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [imageName, setImageName] = useState("");
    const [pathName, setPathName] = useState("");
    const [parameters, setParameters] = useState<string[]>([]);
    const [isValid, setIsValid] = useState(false);
    const [nameError, setNameError] = useState<string | null>(null);
    const [pathError, setPathError] = useState<string | null>(null);
    const [rolesError, setRolesError] = useState<string | null>(null);

    // Validates image name and path
    const validateImageName = (value: string) => {
        if (value.trim().length === 0) {
            return "Image Name is required";
        }
        if (value.length < 1 || value.length > 150) {
            return "Image Name must be between 1 and 150 characters";
        }
        return null;
    };

    const validatePathName = (value: string) => {
        if (value.trim().length === 0) {
            return "Sylabs Path is required";
        }
        if (value.length < 1 || value.length > 150) {
            return "Sylabs Path must be between 1 and 150 characters";
        }
        return null;
    };

    // Checks if image name and path are unique
    const isNameUnique = useCallback(
        (value: string) => {
            return !allImages.some((image) => image.name.toLowerCase() === value.toLowerCase());
        },
        [allImages],
    );

    const isPathUnique = useCallback(
        (value: string) => {
            return !allImages.some((image) => image.sylabs_path.toLowerCase() === value.toLowerCase());
        },
        [allImages],
    );

    // Effect to update validity of the form
    useEffect(() => {
        // Set validators for input fields
        const isImageNameValid = validateImageName(imageName);
        const isPathNameValid = validatePathName(pathName);
        const areRolesValid = selectedRoles.length > 0;

        setIsValid(isImageNameValid === null && isPathNameValid === null && areRolesValid);
    }, [imageName, pathName, selectedRoles]);

    // Function to handle form submission
    const handleSubmit = async () => {
        // Define image to be passed in fetch
        const image: Image = {
            name: imageName,
            sylabs_path: pathName,
            parameters: parameters,
            roles: selectedRoles,
        };
        // Execute fetch
        try {
            await fetch(`/api/images`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(image),
            });
        } catch (error) {
            console.log(JSON.stringify(error));
        }
        // Close modal after submission
        setShowModalAdd(false);
        // Re-fetch the data to update the user list
        void fetchImages();
        resetModal();
    };

    // Effect to update modal visibility when showModalAdd changes
    useEffect(() => {
        setShowModalAdd(showModalAdd);
    }, [showModalAdd, setShowModalAdd]);

    // Function to handle checkbox change for roles selection
    const handleCheckboxChange = (value: string) => {
        // Toggle the item, if it is already selected, remove it, otherwise add it
        if (selectedRoles.includes(value)) {
            setSelectedRoles(selectedRoles.filter((item) => item !== value));
        } else {
            setSelectedRoles([...selectedRoles, value]);
        }
        // Reset roleserror upon change
        setRolesError("");
    };

    // Handle tag name input change
    const handleInputChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Ensures that no two tags will have same name
        setImageName(event.target.value);
    };

    // Handle tag name input change
    const handleInputChangePath = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Ensures that no two tags will have same name
        setPathName(event.target.value);
    };

    // Reset all input fields and state variables
    const resetModal = () => {
        setImageName("");
        setPathName("");
        setSelectedRoles([]);
        setParameters([]);
        setNameError(null);
        setPathError(null);
        setRolesError(null);
        setIsValid(isValid);
    };

    // Modal content for adding a tag
    const modalContentAdd = (
        <div className="flex flex-col gap-2">
            <div>
                <h1 className="font-semibold mb-1">Image Name</h1>
                {/* Input for the creation of images */}
                <Input
                    placeholder="Enter image name"
                    size="lg"
                    variant="bordered"
                    value={imageName}
                    onChange={handleInputChangeName}
                    data-cy="name-input"
                ></Input>
                {/* Displays error if error exist */}
                {nameError && (
                    <p className="text-red-500 text-sm" data-cy="name-error">
                        {nameError}
                    </p>
                )}
            </div>
            <div>
                {/* Title for sylabs path */}
                <h1 className="font-semibold mb-1">Sylabs Path</h1>
                {/* Input for the creation of images */}
                <Input
                    placeholder="Enter path name (e.g., /path/to/file)"
                    size="lg"
                    variant="bordered"
                    value={pathName}
                    onChange={handleInputChangePath}
                    data-cy="path-input"
                ></Input>
                {/* Displays error if error exists */}
                {pathError && (
                    <p className="text-red-500 text-sm" data-cy="path-error">
                        {pathError}
                    </p>
                )}
            </div>
            <div className="flex flex-row gap-2">
                <div className="flex-1">
                    {/* Title for assigning roles */}
                    <h1 className="font-semibold mb-1">Assign Roles</h1>
                    <div className="border-2 border-gray-200 rounded-xl p-2 flex-col" data-cy="roles-checkbox-group">
                        <CheckboxGroup value={selectedRoles} onChange={setSelectedRoles}>
                            {/* Render each individual checkbox */}
                            {roles.map((value: string, index: number) => {
                                return (
                                    // Load in checkboxes for each user role
                                    <Checkbox
                                        key={index}
                                        value={value}
                                        isSelected={selectedRoles.includes(value)}
                                        onChange={() => {
                                            handleCheckboxChange(value);
                                        }}
                                    >
                                        {value}
                                    </Checkbox>
                                );
                            })}
                        </CheckboxGroup>
                        {rolesError && (
                            <p className="text-red-500 text-sm" data-cy="roles-error">
                                {rolesError}
                            </p>
                        )}
                    </div>
                </div>
                {/* Loads in multipleinput for adding parameters */}
                <MultipleInput title="Add Parameters" className="flex-1" onChipsChange={setParameters}></MultipleInput>
            </div>
        </div>
    );
    return (
        <>
            {/* Modal for creating images */}
            <Modal
                title={"Create new image"}
                body={modalContentAdd}
                action={"Create"}
                isVisible={showModalAdd}
                onClose={() => {
                    setShowModalAdd(false);
                    resetModal();
                }}
                color="success"
                onClick={() => {
                    // Validate the image name and path
                    const nameValidation = validateImageName(imageName);
                    const pathValidation = validatePathName(pathName);
                    const areRolesValid = selectedRoles.length > 0;

                    // Check if name and path are unique
                    const isNameUniqueResult = isNameUnique(imageName);
                    const isPathUniqueResult = isPathUnique(pathName);

                    // Set error messages if validations fail
                    if (nameValidation ?? !isNameUniqueResult) {
                        setNameError(nameValidation ?? "Image Name must be unique");
                    } else {
                        setNameError(null);
                    }
                    // Check if path is unique and valid input
                    if (pathValidation ?? !isPathUniqueResult) {
                        setPathError(pathValidation ?? "Sylabs Path must be unique");
                    } else {
                        setPathError(null);
                    }
                    // Check if at least one role is assigned
                    if (!areRolesValid) {
                        setRolesError("At least one role must be selected");
                    } else {
                        setRolesError(null);
                    }

                    // Check overall form validity
                    if (
                        nameValidation ||
                        pathValidation ||
                        !areRolesValid ||
                        !isNameUniqueResult ||
                        !isPathUniqueResult
                    ) {
                        return;
                    }
                    // Execute handlesubmit if all is fine
                    void handleSubmit();
                    // Reset modal content
                    resetModal();
                }}
                dataCy="add-modal"
            />
        </>
    );
}
