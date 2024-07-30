"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { hashPassword } from "@lib/crypt";
import AuthenticationPage from "@components/AuthenticationPage";
import { GenericResponse } from "@lib/network";

/**
 * Registers the users with the given email and password hash in the backend
 * @param email The email of the user
 * @param passwordHash The hashed password
 * @returns A promise that resolves to the response from the backend
 */
async function registerUser(email: string, passwordHash: string): Promise<GenericResponse> {
    const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, passwordHash }),
    });
    return response.json() as Promise<GenericResponse>;
}

/**
 * Renders the register page
 * @returns The JSX for the register page
 */
export default function RegisterPage() {
    const router = useRouter();

    // Handle the register button click
    const handleRegister = async (email: string, password: string) => {
        const passwordHash = await hashPassword(password);
        const response: GenericResponse = await registerUser(email, passwordHash);
        if (!response.success) {
            return response.message ?? "Something went wrong when registering the user, please try again later.";
        }
        // Redirects the user to the login page on successful register.
        router.push("/login");
        return null;
    };

    return (
        <AuthenticationPage
            title="Register"
            description="Please enter your email and password to register."
            color="text-success"
            buttonColor="success"
            onSubmit={handleRegister}
        >
            <h1 className="text-slate-600 text-center text-sm p-2 mt-4">
                Already have an account? Go to
                <Link href="/login" className="ml-1 text-sm text-primary" data-cy="link">
                    Login
                </Link>
            </h1>
        </AuthenticationPage>
    );
}
