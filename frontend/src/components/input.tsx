import React, { ChangeEvent } from "react";

// Define the interface for the props
interface InputProps {
    // the label of the input field
    label: string;
    // the type of the input field
    type: string;
    // the value of the input field
    value: string;
    // the event which triggers upon changing the content of the field
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

// Template for the custom input field - used in login and register page
export default function Input({ label, type, value, onChange }: InputProps) {
    return (
        <div>
            <label className="block text-sm font-small text-gray-700 ml-1">{label}</label>
            <input
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                type={type}
                value={value}
                onChange={onChange}
            />
        </div>
    );
}
