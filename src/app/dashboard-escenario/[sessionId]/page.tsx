import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ScenarioExecutionPanel } from "@/components/scenario-execution-panel";
import { cookies } from "next/headers";
import { dictionaries } from "@/i18n/dictionaries";

export default async function DashboardEscenarioPage({
    params,
    searchParams
}: {
    params: Promise<{ sessionId: string }>;
    searchParams: Promise<{ scenarioId?: string }>;
}) {
    const supabase = await createClient();

    const cookieStore = await cookies();
    const localeValue = cookieStore.get("NEXT_LOCALE")?.value;
    const isValidLocale = localeValue === "es" || localeValue === "en" || localeValue === "cat";
    const lang = (isValidLocale ? localeValue : "es") as keyof typeof dictionaries;
    const dict = dictionaries[lang];

    const {
        data: { user },
    } = await supabase.auth.getUser();

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

    const { sessionId } = await params;
    const resolvedSearchParams = await searchParams;
    const scenarioId = resolvedSearchParams.scenarioId;

    if (!scenarioId) {
        return redirect("/dashboard");
    }

    // Load Scenario details
    const { data: scenario } = await supabase
        .from("scenarios")
        .select("*")
        .eq("id", scenarioId)
        .single();

    if (!scenario) return redirect("/dashboard");

    // Load Scenario phases
    const { data: states } = await supabase
        .from("scenario_states")
        .select("*")
        .eq("scenario_id", scenarioId)
        .order("order_index", { ascending: true });

    return (
        <div className="min-h-screen bg-background p-8">
            <header className="flex items-center justify-between mb-8 max-w-[1400px] mx-auto">
                <div className="flex items-end gap-6">
                    <h1 className="text-3xl font-bold tracking-tight">{dict.dashboardEscenario.executionLabel}{scenario.title}</h1>
                </div>
                <div className="flex items-center gap-6">
                    <Link
                        href="/scenarios"
                        className="text-sm font-bold text-destructive hover:text-destructive/80 hover:underline transition-all"
                    >
                        {dict.dashboardEscenario.exitScenario}
                    </Link>
                    <ThemeToggle />
                </div>
            </header>

            <main className="w-full max-w-[1400px] mx-auto">
                <ScenarioExecutionPanel
                    sessionId={sessionId}
                    scenarioId={scenarioId}
                    initialStates={states || []}
                />
            </main>
        </div>
    );
}
