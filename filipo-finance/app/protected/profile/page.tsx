/*
Server component
1. Read user data from supabase
2. Read profile from supabase
3. Renders the form with initial values
 */

import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import ProfileForm from "@/app/protected/profile/profile-form";
import {isNull} from "node:util";

export default async function ProfilePage() {
    // 1. Create Supabase client on server side (using cookies / current session)
    const supabase = await createClient();

    // 2. Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // 3. Protect path
    if (!user) {
        redirect("/auth/login");
    }

    // 4. Read current user's profile
    const {
        data: profile,
        error,
    } = await supabase
        .from("profiles")
        .select("id, user_name, base_currency")
        .eq("id", user.id)
        .maybeSingle();

    if (error) {
        console.error("Error while loading profile: ", error.message);
    }

    /*
    Testing...
     */
    console.log("user id from user: " + user.id);
    console.log("id from profile: " + profile?.id);
    console.log("username from profile: " + profile?.user_name);
    console.log("currency from profile: " + profile?.base_currency);

    return (
        <section className="space-y-4">
            <div className="rounded-2xl border border-black p-4">
                <h2 className="text-base font-semibold">Profile</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Modify username and base currency.
                </p>
            </div>

            <ProfileForm
                email={user.email ?? ""}
                initialUserName={profile?.user_name ?? ""}
                initialBaseCurrency={profile?.base_currency ?? "PEN"}
            />
        </section>
    );
}