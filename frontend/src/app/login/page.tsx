"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AuthenticationPage from "@components/AuthenticationPage";
import { GenericResponse } from "@lib/network";
import Link from "next/link";

/**
 * Authenticate the user with the given credentials
 * @param email The email to authenticate for
 * @param password The raw password to authenticate with
 * @returns The authentication response
 */
async function authenticateUser(email: string, password: string): Promise<GenericResponse> {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
    });
    return response.json() as Promise<GenericResponse>;
}

/**
 * Renders the login page
 * @returns The JSX for the login page
 */
export default function LoginPage() {
    const router = useRouter();

    // Handle the login button click
    const handleLogin = async (email: string, password: string) => {
        const response: GenericResponse = await authenticateUser(email, password);

        if (!response.success) {
            return response.message ?? "Invalid username or password";
        }

        // Redirects the user to the home page on successful login.
        router.push("/app/home");
        return null;
    };

    return (
        <AuthenticationPage
            title="Login"
            description="Please enter your email and password to login."
            color="text-primary"
            buttonColor="primary"
            onSubmit={handleLogin}
        >
            <h1 className="text-slate-600 text-center text-sm p-2 mt-4">
                Don&apos;t have an account? Go to
                <Link href="/register" className="ml-1 text-sm text-green-600" data-cy="link">
                    Register
                </Link>
            </h1>
        </AuthenticationPage>
    );
}
