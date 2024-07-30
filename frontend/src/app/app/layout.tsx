"use client";
import React from "react";
import Sidebar from "@components/Sidebar";

/**
 * Layout component that gets loaded in all /app pages
 */
interface Props {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
    return (
        <div className="flex items-center h-screen">
            {/* Loads in sidebar from sidebar component, when logout is pressed modal shows */}
            <Sidebar />
            {/* Loads in page dependent part*/}
            <main className="flex justify-center w-full h-full px-2">{children}</main>
        </div>
    );
}
