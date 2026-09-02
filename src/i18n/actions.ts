"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { SupportedLocale } from "@/i18n/dictionaries"

export async function setUserLanguage(locale: SupportedLocale) {
    const supabase = await createClient()
    const cookieStore = await cookies()

    // 1. Set the cookie so Next.js reads it instantly on reload
    cookieStore.set("NEXT_LOCALE", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 })

    // 2. Save it to Supabase profiles
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        await supabase
            .from('profiles')
            .update({ lang: locale })
            .eq('id', user.id)
    }

    // 3. Revalidate the entire app to catch the new translations across all pages
    revalidatePath("/", "layout")

    return { success: true }
}
