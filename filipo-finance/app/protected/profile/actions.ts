"use server";
/*
This file runs on the server
Middle logic (validations + DB)
 */

import {revalidatePath} from "next/cache";
import {createClient} from "@/lib/supabase/server";

// Status type returned to the form by the action
type ProfileActionState = {
    status: "idle" | "success" | "error";
    message: string;
    fieldErrors?: {
        user_name?: string;
        base_currency?: string;
    }
}

// Server Action: receives the previous status and the form FormData
export async function updateProfileAction(
    _prevState: ProfileActionState,
    formData: FormData
): Promise<ProfileActionState> {

    // 1. Read raw values from the form (always come as string | File | null)
    const userNameRaw = formData.get("user_name");
    const baseCurrencyRaw = formData.get("base_currency");

    // 2. Clean data
    const userName = String(userNameRaw ?? "").trim();
    const baseCurrency = String(baseCurrencyRaw ?? "").trim().toUpperCase();

    // 3. Validate (server-side)
    const fieldErrors: ProfileActionState["fieldErrors"] = {};

    if (userName.length > 20) {
        fieldErrors.user_name = "Username must be shorter than 20 characters.";
    }

    if (userName.length < 4) {
        fieldErrors.user_name = "Username must have at least 4 characters.";
    }

    // Currency ISO code
    if (!/^[A-Z]{3}$/.test(baseCurrency)) {
        fieldErrors.base_currency = "Currency must be 3 characters long";
    }

    // 4. If errors, return error status and break workflow
    if (Object.keys(fieldErrors).length > 0) {
        return {
            status: "error",
            message: "Verify highlighted fields.",
            fieldErrors,
        };
    }

    // 5. Create Supabase client on server side (using cookies / current session)
    const supabase = await createClient();

    // 6. Verify logged user
    const {
        data: {user},
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return {
            status: "error",
            message: "Your session expired. Please log in again.",
        };
    }

    // 7. Save in DB (upsert = insert if the object does not exist / update if it already exists)
    const {error} = await supabase.from("profiles").upsert(
        {
            id: user.id,
            user_name: userName,
            base_currency: baseCurrency,
        },
        {
            onConflict: "id",
        }
    );

    if (error) {
        console.error("Error in updateProfileAction: ", error);
        return {
            status: "error",
            message: "Couldn't save the profile.",
        };
    }

    // 8. Update the cache
    revalidatePath("/protected/profile");
    revalidatePath("/protected");

    // 9. Return success
    return {
        status: "success",
        message: "Profile successfully saved.",
    };
}
