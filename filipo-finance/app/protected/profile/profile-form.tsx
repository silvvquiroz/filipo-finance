"use client";
/*
This file runs on the browser (client)
Form UI and user interaction
 */

import {useActionState, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {updateProfileAction} from "@/app/protected/profile/actions";

// Properties from page.tsx (server component)
type ProfileFormProps = {
    email: string,
    initialUserName: string,
    initialBaseCurrency: string,
};

// Local status type returned by the action
type ProfileActionState = {
    status: "idle" | "success" | "error";
    message: string;
    fieldErrors?: {
        user_name?: string;
        base_currency?: string;
    }
}

// Initial form state: Before send
const initialState: ProfileActionState = {
    status: "idle",
    message: "",
};

export default function ProfileForm({
    email,
    initialUserName,
    initialBaseCurrency,
                                    }: ProfileFormProps) {

    const router = useRouter();

    // 1. Get the new state after the action has been executed
    /*
    Returns:
    state: the new state returned by the action updateProfileAction
    formAction: function we'll connect to the <form action={...}>
    pending: boolean while it's sending
     */
    const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

    // 2. If we got a success, refresh the path to reload server data
    useEffect(() => {
        if (state.status === "success") {
            router.refresh();
        }
    }, [state.status, router]);

    // HTML
    return (
        <form
            action={formAction}
            className="space-y-4 rounded-2xl border border-black p-4"
        >
            <h3 className="text-sm font-semibold">Edit Profile</h3>

            {/* Email read-only (comes from Auth) */}
            <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="w-full rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                    Este dato viene de Supabase Auth.
                </p>
            </div>

            {/* Username */}
            <div>
                <label htmlFor="user_name" className="mb-1 block text-sm font-medium">
                    Username
                </label>
                <input
                    id="user_name"
                    name="user_name" // name used in FormData.get("user_name")
                    type="text"
                    defaultValue={initialUserName}
                    placeholder="Username"
                    className="w-full rounded-xl border border-black px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                />
                {state.fieldErrors?.user_name && (
                    <p className="mt-1 text-xs text-red-600">{state.fieldErrors.user_name}</p>
                )}
            </div>

            {/* Base currency */}
            <div>
                <label htmlFor="base_currency" className="mb-1 block text-sm font-medium">
                    Base Currency
                </label>
                <input
                    id="base_currency"
                    name="base_currency" // name used in FormData.get("base_currency")
                    type="text"
                    maxLength={3}
                    defaultValue={initialBaseCurrency}
                    placeholder="PEN"
                    className="w-full rounded-xl border border-black px-3 py-2 text-sm uppercase outline-none focus:ring-2 focus:ring-black"
                />
                <p className="mt-1 text-xs text-gray-500">
                    Usa código ISO de 3 letras (PEN, USD, EUR).
                </p>
                {state.fieldErrors?.base_currency && (
                    <p className="mt-1 text-xs text-red-600">
                        {state.fieldErrors.base_currency}
                    </p>
                )}
            </div>

            {/* General message */}
            {state.message && (
                <div
                    className={`rounded-xl border px-3 py-2 text-sm ${
                        state.status === "success"
                            ? "border-green-300 bg-green-50 text-green-700"
                            : "border-red-300 bg-red-50 text-red-700"
                    }`}
                >
                    {state.message}
                </div>
            )}

            {/* Submit button */}
            <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
                {pending ? "Saving..." : "Save profile"}
            </button>
        </form>
    );
}