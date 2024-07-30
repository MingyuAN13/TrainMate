"use client";
import React from "react";
import { FaExclamationCircle } from "react-icons/fa";

export default function Unauthorized() {
    // Users who trigger the 401 flag will be redirected to this page.
    // They still will have access to the sidebar.
    //return <h1>{"401 : You do not have authorization to view this page."}</h1>;
    return (
        <div className="flex flex-col justify-center items-center space-y-4 h-full">
            <div className="flex flex-col justify-center items-center space-y-4 max-w-md w-full">
                <FaExclamationCircle className="text-9xl text-red-500" />
                <div className="mt-4 space-y-2">
                    <h3 className="text-4xl font-bold text-red-500 text-center">401 Unauthorized Request</h3>
                    <p className="text-md text-gray-500">You do not have authorization to view the page requested!.</p>
                </div>
            </div>
        </div>
    );
}
