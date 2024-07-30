"use client";
import React from "react";
import { NextUIProvider } from "@nextui-org/react";

// Provider function
export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NextUIProvider>
            {/* Initializes nextui functionality*/}
            {children}
        </NextUIProvider>
    );
}
