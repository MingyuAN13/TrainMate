"use client";
import React, { useState, useEffect } from "react";
import { GiRobotGolem } from "react-icons/gi";

interface RolesResponse {
    // value, denoting whether the check was successful
    success: boolean;
    // value, denoting the message, contained upon failure
    message: string;
}

export default function Home() {
    const [message, setMessage] = useState<string>("");

    // Fetch whether current user has roles
    const fetchRoles = async (): Promise<RolesResponse> => {
        const response = await fetch("/api/users/roles", {
            method: "GET",
            credentials: "include",
        });

        return response.json() as Promise<RolesResponse>;
    };

    // Set the appropriate message to be displayed
    useEffect(() => {
        void fetchRoles().then((result) => {
            if (!result.success) {
                console.error(result.message);
                return;
            }

            // Set the message to the result
            setMessage(result.message);
        });
    });

    return (
        <div className="flex flex-col items-center justify-center grow h-full p-6 mx-3 overflow-hidden">
            <div className="flex flex-row justify-center items-start my-2">
                {/* Logo */}
                <GiRobotGolem className="h-8 w-8 mt-0.5 mr-1" />
                {/* Name of app */}
                <div className="font-bold text-2xl tracking-wide">TrainMate</div>
            </div>
            <div className="flex flex-col items-center justify-center flex-grow">
                <h1 className="text-xl my-2">{message}</h1>
            </div>
        </div>
    );
}
