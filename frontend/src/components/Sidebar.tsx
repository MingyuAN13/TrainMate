"use client";
import React from "react";
import ReButton from "./RedirectButton";
import { Button, Spinner, useDisclosure } from "@nextui-org/react";
import { Avatar } from "@nextui-org/react";
import { GiRobotGolem } from "react-icons/gi";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@components/ConfirmationModal";
import { GenericResponse } from "@lib/network";
import { Async } from "react-async";
import ErrorMessage, { SmallErrorMessage } from "./ErrorMessage";

/**
 * Handles the logout functionality sending a request to the backend
 *
 * @returns null if the logout was successful
 * @returns a string message if there is an error
 */
async function handleLogout(): Promise<string | null> {
    const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
    });

    if (!response.ok) {
        return response.statusText;
    }

    const responseData = (await response.json()) as GenericResponse;
    if (!responseData.success) {
        return responseData.message ?? "Something went wrong when logging out.";
    }

    return null;
}

/**
 * Defines navigation component that will be on the side of dashboard pages.
 *
 * @returns The JSX for the sidebar
 */
export default function Sidebar() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const router = useRouter();

    return (
        <div className="flex flex-col w-[300px] h-full rounded-xl overflow-hidden relative bg-white" data-cy="sidebar">
            <div className="grow">
                {/* Header for the sidebar */}
                <div
                    id="logo-container"
                    className="flex flex-row justify-center w-full my-2 space-x-3 mt-6"
                    onClick={() => router.push("/app/home")}
                >
                    <GiRobotGolem className="h-5 w-5 mt-0.5 mr-1" />
                    <div className="font-bold text-xl tracking-wide text-center">TrainMate</div>
                </div>
                <Links />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex flex-col items-start">
                    <div className="flex flex-col w-full m-1 justify-between items-center gap-y-2">
                        <Profile />
                        <Button
                            id="logout-btn"
                            radius="full"
                            variant="flat"
                            className="w-[150px] font-medium"
                            onClick={onOpen}
                        >
                            Logout
                        </Button>
                        <ConfirmationModal
                            title={"Confirm logout"}
                            body={"Are you sure you would like to log out of the application?"}
                            confirmText={"Logout"}
                            color="danger"
                            data-cy="logout-modal"
                            isOpen={isOpen}
                            onOpenChange={onOpenChange}
                            onClick={() =>
                                handleLogout().then((message) => {
                                    if (!message) {
                                        router.push("/login");
                                    }
                                    return message;
                                })
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * The response from the backend when fetching links.
 */
interface FetchLinksResponse {
    /**
     * Whether the request was successful.
     */
    success: boolean;
    /**
     * The error message from the backend.
     */
    message?: string;
    /**
     * The links to display on the sidebar.
     *
     * This can be empty if the user does not have access to any links.
     */
    links: LinkDictionaryArray[];
}

/**
 * The links to display on the sidebar.
 */
interface LinkDictionaryArray {
    /**
     * The href of the link.
     */
    href: string;
    /**
     * The label to display for the link.
     */
    label: string;
}

/**
 * Fetches the links from the backend.
 *
 * @returns the links
 */
async function fetchLinks(): Promise<LinkDictionaryArray[]> {
    const response = await fetch("/api/auth/viewable_pages", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    const data: FetchLinksResponse = (await response.json()) as FetchLinksResponse;
    if (!data.success) {
        throw new Error(data.message);
    }
    return data.links;
}

/**
 * Defines the links that are displayed on the sidebar
 *
 * @returns The JSX for the links
 */
function Links() {
    return (
        <Async promiseFn={fetchLinks}>
            <Async.Pending>
                <div className="flex flex-col justify-center items-center h-full">
                    <Spinner color="primary" size="md" />
                </div>
            </Async.Pending>
            <Async.Rejected>{(error: Error) => <ErrorMessage title="Error" message={error.message} />}</Async.Rejected>
            <Async.Fulfilled>
                {(links: LinkDictionaryArray[]) => (
                    <div className="flex flex-col h-full overflow-hidden relative mx-3 gap-y-2">
                        {links.map(({ href, label }) => (
                            <ReButton
                                variant="light"
                                radius="md"
                                color="default"
                                key={href}
                                href={href}
                                data-cy="sidebar-link"
                                className="w-full font-medium text-center"
                            >
                                {label}
                            </ReButton>
                        ))}
                    </div>
                )}
            </Async.Fulfilled>
        </Async>
    );
}

/**
 * The profile information for the user.
 */
interface Profile {
    /**
     * The email of the user.
     */
    email: string;
    /**
     * The avatar URL of the user.
     */
    avatarUrl: string;
}

/**
 * The response from the backend when fetching the user's email.
 */
interface FetchEmailResponse {
    /**
     * Whether the request was successful.
     */
    success: boolean;
    /**
     * The error message from the backend.
     */
    message?: string;
    /**
     * The email of the user.
     */
    email?: string;
}
/**
 * Fetches user's profile information from the backend.
 *
 * @returns the profile information
 */
async function fetchProfile(): Promise<Profile> {
    const response = await fetch("/api/users/email", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    const data: FetchEmailResponse = (await response.json()) as FetchEmailResponse;
    if (!data.success) {
        throw new Error(data.message);
    }
    if (!data.email) {
        throw new Error("No email found");
    }

    const email = data.email;
    const emailName = email.split("@")[0];

    const avatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${emailName}`;

    return { email, avatarUrl };
}

/**
 * Show the users profile information.
 *
 * @returns the JSX for the profile information
 */
function Profile() {
    return (
        <Async promiseFn={fetchProfile}>
            <Async.Pending>
                <div className="flex flex-col justify-center items-center h-full">
                    <Spinner color="primary" size="sm" />
                </div>
            </Async.Pending>
            <Async.Rejected>
                {(error: Error) => <SmallErrorMessage title="Error" message={error.message} />}
            </Async.Rejected>
            <Async.Fulfilled>
                {(profile: Profile) => (
                    <div className="flex flex-row w-full m-1 justify-center items-center gap-3">
                        <Avatar
                            src={profile.avatarUrl}
                            classNames={{
                                base: "bg-gradient-to-br from-[#006FEE] to-[#99C7FB]",
                                icon: "text-black/80",
                            }}
                        />
                        <p className="text-xs font-bold text-center">{profile.email}</p>
                    </div>
                )}
            </Async.Fulfilled>
        </Async>
    );
}
