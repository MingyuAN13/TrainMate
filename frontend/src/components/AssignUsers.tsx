import React from "react";
import { RxCross2 } from "react-icons/rx";
import SelectDropdown from "./SelectDropdown";
import { FaUser } from "react-icons/fa";
import { Tag } from "@lib/types";
import { useEffect, useState } from "react";
import { fetchTags } from "@lib/network";
import { useCurrentUserTag } from "@lib/hooks";

/**
 * Prompts for the User component
 */
interface UserComponentProps {
    /**
     * The tag of the associated user
     */
    userTag: Tag;
    /**
     * Callback to remove an assigned user
     */
    removeUser: (id: string) => void;
}

/**
 * A component for viewing the selected users
 */
function UserCopmonent({ userTag, removeUser }: UserComponentProps) {
    return (
        <div className="flex items-center justify-between box-border px-3 py-1 border-b-2">
            <div>{userTag.name}</div>
            {/* Remove the selected user on click */}
            <RxCross2 onClick={() => removeUser(userTag.id)} className="hover:cursor-pointer" size={17} />
        </div>
    );
}

/**
 * Props for the AssignUsers component
 */
interface AssignUsersProps {
    /**
     * Maximum height for styling
     */
    minHeight?: number;
    /**
     * Minimum height for styling
     */
    maxHeight?: number;
    /**
     * The selected users
     */
    selectedUserTags: Tag[];
    /**
     * Remove the selected user
     */
    removeSelectedUserTag: (id: string) => void;
    /**
     * Assign the selected users
     */
    setSelectedUserTags: (id: Tag[]) => void;
}

export default function AssignUsers({
    selectedUserTags,
    setSelectedUserTags,
    removeSelectedUserTag,
    minHeight,
    maxHeight,
}: AssignUsersProps) {
    // All user tags for autocomplete
    const [userTags, setUserTags] = useState<Tag[]>([]);
    // The tag of the current user
    const currentUserTag = useCurrentUserTag();

    useEffect(() => {
        if (!currentUserTag) return;
        // get all user tags for autocomplete
        fetchTags()
            .then((tags) => {
                setUserTags(tags.filter((tag) => tag.type === "user" && tag.name !== currentUserTag.name));
            })
            .catch((e: unknown) => console.error(e));
    }, [currentUserTag]);

    const handleSelectedUsers = (emails: string[]) => {
        if (currentUserTag === null) return;
        // assign the selected users
        const selectedUserTags = emails
            .map((email) => userTags.find((user) => user.name === email))
            .filter((user): user is Tag => !!user);

        // add the current user to the selected user tags to make sure it is not removed
        //setSelectedUserTags([...selectedUserTags, currentUserTag]);
        setSelectedUserTags(selectedUserTags);
    };

    return (
        <div className={`${maxHeight ? "" : "h-full"} flex flex-col`}>
            {/* The box containing selected users */}
            <div
                className="flex-grow rounded-xl border shadow-inner"
                style={{
                    minHeight: minHeight ? `${minHeight.toString()}px` : "",
                    maxHeight: maxHeight ? `${maxHeight.toString()}px` : "",
                }}
                data-cy="user-viewer"
            >
                {/* Explicitly state if no users are selected */}
                {selectedUserTags.length === 0 ? (
                    <h1 className="mt-5 ml-5 text-gray-400">No users selected</h1>
                ) : (
                    // Show all selected users
                    selectedUserTags.map((selUser, i) => (
                        <UserCopmonent key={i} userTag={selUser} removeUser={() => removeSelectedUserTag(selUser.id)} />
                    ))
                )}
            </div>
            <div className="mt-3">
                {/* Drop down to add users */}
                <SelectDropdown
                    icon={<FaUser />}
                    type=""
                    hideSelected={true}
                    placeholder={"Add User +"}
                    data={userTags.map((userTag) => userTag.name)}
                    selected={selectedUserTags.map((user) => user.name)}
                    setSelected={handleSelectedUsers}
                    dataCy="user"
                />
            </div>
        </div>
    );
}
