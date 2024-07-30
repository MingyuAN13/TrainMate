"use client";

import React, { useState } from "react";
import { GiRobotGolem } from "react-icons/gi";
import Input from "@components/input";
import { Button } from "@nextui-org/react";

/**
 * Props for the authentication page component.
 */
interface AuthenticationPageProps {
    /**
     * The title of the page.
     */
    title: string;
    /**
     * A short description of what the user should do.
     */
    description: string;
    /**
     * The primary color for this page. Used for the title.
     */
    color: React.ComponentProps<"div">["className"];
    /**
     * The color of the button.
     */
    buttonColor: "primary" | "success";
    /**
     * The function to call when the user submits the form.
     *
     * @param email The email of the user.
     * @param password The password of the user.
     * @returns A promise that resolves to a string or null.
     *  If the promise resolves with a string, it will be displayed as an error message.
     */
    onSubmit: (email: string, password: string) => Promise<string | null>;
    /**
     * Any additional children below the submit button.
     */
    children?: React.ReactNode;
}

/**
 * The authentication page component.
 *
 * @param props The props for the authentication page component.
 * @returns The JSX for the authentication page component.
 */
export default function AuthenticationPage({
    title,
    description,
    color,
    buttonColor,
    onSubmit,
    children,
}: AuthenticationPageProps) {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen">
            <div className="flex flex-col items-center p-4">
                <GiRobotGolem className="w-16 h-16" />
                <h1 className="font-bold text-xl tracking-wide">Trainmate</h1>
            </div>
            <div className="bg-white shadow-md rounded max-w-sm w-full p-3 overflow-hidden">
                <div className="flex flex-col w-full gap-y-2">
                    <div className="flex flex-col px-2 py-4 gap-y-2">
                        <h2 className={`font-semibold text-3xl ${color ?? ""}`}>{title}</h2>
                        <p className="text-sm text-slate-600">{description}</p>
                    </div>
                    <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                <div className="py-4 flex flex-col items-center">
                    {/* This is for the login button. */}
                    <Button
                        radius="full"
                        variant="flat"
                        color={buttonColor}
                        onClick={() => {
                            void (async () => {
                                const error = await onSubmit(email, password);
                                setError(error ?? "");
                            })();
                        }}
                        className="w-2/5"
                        data-cy="submit"
                    >
                        {title}
                    </Button>
                    {children}
                </div>
            </div>
        </div>
    );
}
