import React from "react";
import { FaExclamationCircle } from "react-icons/fa";

/**
 * Props for the error message component
 */
interface Props {
    /**
     * The title of the error message
     */
    title: string;
    /**
     * The message of the error message
     */
    message: string;
}

/**
 * Displays an Large error message
 * @param props The props for the error message
 * @returns The JSX for the error message
 */
export default function ErrorMessage({ title, message }: Props) {
    return (
        <div className="flex flex-col justify-center h-full">
            <div className="flex flex-col justify-center space-y-1 max-w-md w-full">
                <div className="flex items-center space-x-2">
                    <FaExclamationCircle className="text-2xl text-red-500" />
                    <h3 className="text-3xl font-bold text-red-500 text-center">{title}</h3>
                </div>
                <p className="text-sm text-gray-500">{message}</p>
            </div>
        </div>
    );
}

/**
 * Displays a small error message
 * @param props The props for the error message
 * @returns The JSX for the error message
 */
export function SmallErrorMessage({ title, message }: Props) {
    return (
        <div className="flex flex-col justify-center h-full">
            <div className="flex flex-col justify-center max-w-md w-full">
                <div className="flex items-center space-x-1">
                    <FaExclamationCircle className="text-md text-red-500" />
                    <h3 className="text-lg font-bold text-red-500 text-center">{title}</h3>
                </div>
                <p className="text-sm text-gray-500">{message}</p>
            </div>
        </div>
    );
}
