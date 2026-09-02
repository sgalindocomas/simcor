import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ScenariosList } from "@/components/scenarios-list";
import { cookies } from "next/headers";
import { dictionaries } from "@/i18n/dictionaries";

export default async function ScenariosPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const cookieStore = await cookies();
    const localeValue = cookieStore.get("NEXT_LOCALE")?.value;
    const isValidLocale = localeValue === "es" || localeValue === "en" || localeValue === "cat";
    const lang = (isValidLocale ? localeValue : "es") as keyof typeof dictionaries;
    const dict = dictionaries[lang];

    if (!user) {
        return redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const rawRole = profile?.role || user.user_metadata?.role;
    if (String(rawRole).toLowerCase().trim() !== "profesor") {
        return redirect("/dashboard");
    }

    // Fetch scenarios created by this instructor
    const { data: scenarios, error } = await supabase
        .from("scenarios")
        .select("*")
        .eq("instructor_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen bg-background p-8">
            <header className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight">{dict.scenarios.managementTitle}</h1>
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline transition-all"
                    >
                        {dict.common.backToDashboard}
                    </Link>
                    <ThemeToggle />
                </div>
            </header>

            <main className="w-full max-w-6xl mx-auto">
                <ScenariosList initialScenarios={scenarios || []} userId={user.id} />
            </main>
        </div>
    );
}
