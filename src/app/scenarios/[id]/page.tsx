import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ScenarioStatesManager } from "@/components/scenario-states-manager";

export default async function ScenarioDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    // Unwrapping params for Next.js 15+ constraints
    const unwrappedParams = await params;
    const scenarioId = unwrappedParams.id;

    // Fetch the scenario to verify ownership and get details
    const { data: scenario, error: scenarioError } = await supabase
        .from("scenarios")
        .select("*")
        .eq("id", scenarioId)
        .single();

    if (scenarioError || !scenario || scenario.instructor_id !== user.id) {
        // If it doesn't exist or isn't their scenario
        return redirect("/scenarios");
    }

    // Fetch the states ordered by order_index
    const { data: states } = await supabase
        .from("scenario_states")
        .select("*")
        .eq("scenario_id", scenarioId)
        .order("order_index", { ascending: true });

    return (
        <div className="min-h-screen bg-background p-8">
            <header className="flex items-center justify-between mb-8 max-w-6xl mx-auto border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Fases del caso clínico
                    </h1>
                    <p className="text-muted-foreground font-semibold mt-1">
                        {scenario.title}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/scenarios"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline transition-all"
                    >
                        Volver a Escenarios
                    </Link>
                    <ThemeToggle />
                </div>
            </header>

            <main className="w-full max-w-6xl mx-auto">
                <ScenarioStatesManager
                    scenarioId={scenario.id}
                    initialStates={states || []}
                />
            </main>
        </div>
    );
}
