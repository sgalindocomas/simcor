"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(data: { institution: string, department: string }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "User not authenticated" }
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            institution: data.institution,
            department: data.department
        })
        .eq('id', user.id)

    if (error) {
        return { error: "Failed to update profile: " + error.message }
    }

    revalidatePath("/profile")
    return { success: true }
}
