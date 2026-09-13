import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { DashboardContent } from "@/components/dashboard-content";
import { CenterDashboardContent } from "@/components/center-dashboard-content";
import { StudentDashboardContent } from "@/components/student-dashboard-content";
import { LanguageSelector } from "@/components/language-selector";
import { cookies } from "next/headers";
import { dictionaries, SupportedLocale } from "@/i18n/dictionaries";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    // Obtener rol del perfil de forma flexible
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const rawRole = profile?.role || user.user_metadata?.role || "centro";
    const isCentro = String(rawRole).toLowerCase().trim() === "centro";
    const isProfesor = String(rawRole).toLowerCase().trim() === "profesor";
    const isAlumno = String(rawRole).toLowerCase().trim() === "alumno";

    // Check for an active session for this instructor
    const { data: sessions } = await supabase
        .from("sessions")
        .select("id")
        .eq("instructor_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1);

    const activeSession = sessions?.[0];
    const cookieStore = await cookies();
    const locale = (cookieStore.get("NEXT_LOCALE")?.value as SupportedLocale) || "es";
    const dict = dictionaries[locale];

    return (
        <div className="min-h-screen bg-background p-8">
            <header className="flex items-center justify-between mb-8 max-w-[1400px] mx-auto">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline transition-all">
                        <ChevronLeft className="w-4 h-4" />
                        Volver
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">{dict.navbar.dashboard}</h1>
                </div>
                <div className="flex items-center gap-6">
                    {isProfesor && (
                        <Link
                            href="/scenarios"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline transition-all"
                        >
                            {dict.navbar.scenarios}
                        </Link>
                    )}

                    <Link
                        href="/profile"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline transition-all"
                    >
                        {dict.navbar.profile}
                    </Link>
                    <LanguageSelector />
                    <ThemeToggle />
                </div>
            </header>

            <main className="w-full max-w-[1400px] mx-auto">
                {isCentro && <CenterDashboardContent centerId={user.id} />}
                {isProfesor && (
                    <DashboardContent
                        activeSessionId={activeSession?.id}
                        instructorId={user.id}
                    />
                )}
                {isAlumno && <StudentDashboardContent profileId={user.id} />}
            </main>
        </div>
    );
}
