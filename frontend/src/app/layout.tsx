import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@app/globals.css";
import { Providers } from "./providers";
import React from "react";

// Using latin font
const inter = Inter({ subsets: ["latin"] });

// Metadata for whole app
export const metadata: Metadata = {
    title: "TrainMate",
    description: "Simplyfied Machine Learning training",
};

// Exports rootlayout to be used in register and login page
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            {/* Body of webpage */}
            <body className={inter.className} style={{ minHeight: "100vh" }}>
                <Providers>
                    {/* Each child adds own contents*/}
                    {children}
                </Providers>
            </body>
        </html>
    );
}
