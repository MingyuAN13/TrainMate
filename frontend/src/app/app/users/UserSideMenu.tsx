"use client";
import React, { useEffect, useState } from "react";
import { Button, Checkbox, CheckboxGroup, Input, Avatar } from "@nextui-org/react";
import { AvatarIcon } from "@nextui-org/react";
import Modal from "@components/Modal";
import Inspector from "@components/Inspector";

// User interface
interface User {
    email: string;
    roles: string[];
}
// Prop types
interface Props {
    user: User;
    onClose: () => void;
    fetchUsers: () => Promise<void> | void;
}

// Defines the type for the roles
interface Roles {
    roles: string[];
}

export default function UserSideMenu({ user, onClose, fetchUsers }: Props) {
    // Extract role names assigned to the user

    // Selected roles and const for modal functionality
    const [selected, setSelected] = useState<string[]>([]);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [showModalSubmit, setShowModalSubmit] = useState(false);
    const [roles, setRoles] = useState<string[]>([]);

    //Set already assigned roles in multiselect
    useEffect(() => {
        const userRoles = user.roles;
        setSelected(userRoles);
    }, [user]);

    const handleCheckboxChange = (value: string) => {
        // Toggle the item, if it is already selected, remove it, otherwise add it
        if (selected.includes(value)) {
            setSelected(selected.filter((item) => item !== value));
        } else {
            setSelected([...selected, value]);
        }
    };
    //Delete selected user from database
    const handleDelete = async (user: User) => {
        try {
            await fetch(`/api/users/admin`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    email: user.email,
                }),
            });

            // Close inspector after deleting a user
            onClose();
        } catch (error) {
            console.error("Error posting user roles:", error);
        }
        setShowModalDelete(false);
        // Re-fetch the data to update the user list
        void fetchUsers();
    };
    //Submit role changes to database
    const handleSubmit = async (user: User) => {
        try {
            await fetch(`/api/roles/admin`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    email: user.email,
                    roles: selected,
                }),
            });
        } catch (error) {
            console.error("Error posting user roles:", error);
        }
        setShowModalSubmit(false);
        // Re-fetch the data to update the user list
        void fetchUsers();
    };

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

    return (
        <Inspector onClose={onClose} dataCy="user">
            {/* User header including avatar and header */}
            <div className="flex flex-row gap-1 self-start items-center mt-2 ">
                {/* Avatar icon for users */}
                <Avatar
                    className="mr-1"
                    classNames={{
                        base: "bg-gradient-to-br from-[#006FEE] to-[#99C7FB]",
                        icon: "text-black/80",
                    }}
                    icon={<AvatarIcon />}
                />
                {/* Header for edit sidebar */}
                <h1 className="font-bold text-xl tracking-wide">Edit user</h1>
            </div>
            {/* Middle content of sidebar */}
            <div className="flex flex-col grow pt-3 gap-3">
                {/* Displays user email of user to be edited */}
                <Input
                    isReadOnly
                    type="email"
                    label="Email"
                    placeholder={user.email}
                    size="lg"
                    className="max-w-xs"
                    variant="bordered"
                    description="Email cannot be changed"
                />
                {/* Load in roles to pick from */}
                <div className="border-2 border-gray-200 rounded-xl shadow p-2" data-cy="roles-checkbox-group">
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
                title={"Confirm deletion of user"}
                body={`Are you sure you would like to delete ${user.email}?`}
                action={"Delete"}
                isVisible={showModalDelete}
                onClose={() => setShowModalDelete(false)}
                onClick={() => {
                    void handleDelete(user);
                }}
                dataCy="delete-modal"
                color="danger"
            />
            {/* Modal that asks for confirmation of submitting */}
            <Modal
                title={"Submit role changes"}
                body={
                    selected.length > 0
                        ? `Are you sure you would like to submit the following role changes:
${selected.join(", ")}
to ${user.email}?`
                        : `Are you sure you would like remove all roles from ${user.email}`
                }
                action={"Submit"}
                isVisible={showModalSubmit}
                onClose={() => setShowModalSubmit(false)}
                onClick={() => {
                    void handleSubmit(user);
                }}
                dataCy="submit-modal"
                color="success"
            />
        </Inspector>
    );
}
