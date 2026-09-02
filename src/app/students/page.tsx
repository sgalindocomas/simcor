import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { StudentManagement } from "@/components/student-management";
import { LanguageSelector } from "@/components/language-selector";
import { cookies } from "next/headers";
import { dictionaries, SupportedLocale } from "@/i18n/dictionaries";

export default async function StudentsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    // 1. Obtener perfil
    let { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

    // Determinar el rol de manera flexible (insensible a mayúsculas o espacios)
    let rawRole = profile?.role || user.user_metadata?.role || "centro";
    let normalizedRole = String(rawRole).toLowerCase().trim();

    // Si el rol es centro pero en profiles no estaba guardado como tal, actualizarlo
    if (normalizedRole === "centro" && profile?.role !== "centro") {
        await supabase
            .from("profiles")
            .upsert({
                id: user.id,
                email: user.email,
                full_name: profile?.full_name || user.user_metadata?.full_name || user.email,
                role: "centro",
            });
    }

    // Solo los usuarios CENTRO pueden acceder
    if (normalizedRole !== "centro") {
        return redirect("/dashboard");
    }

    // 2. Auto-reparación: Asegurar que el registro en la tabla `centers` existe
    const { data: centerRow } = await supabase
        .from("centers")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

    if (!centerRow) {
        // Si por cualquier motivo no existía la fila en la tabla `centers`, la creamos ahora
        await supabase.from("centers").upsert({
            id: user.id,
            name: user.user_metadata?.center_name || profile?.full_name || "Centro Educativo",
            address: user.user_metadata?.address || null,
            city: user.user_metadata?.city || null,
            province: user.user_metadata?.province || null,
            phone: user.user_metadata?.phone || null,
            study_type: user.user_metadata?.study_type || null,
        });
    }

    const cookieStore = await cookies();
    const locale = (cookieStore.get("NEXT_LOCALE")?.value as SupportedLocale) || "es";
    const dict = dictionaries[locale];

    return (
        <div className="min-h-screen bg-background p-8">
            <header className="flex items-center justify-between mb-8 max-w-[1400px] mx-auto">
                <div className="flex items-end gap-6">
                    <h1 className="text-3xl font-bold tracking-tight">{dict.navbar.students}</h1>
                </div>
                <div className="flex items-center gap-6">
                    <Link
                        href="/dashboard"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline transition-all"
                    >
                        {dict.navbar.dashboard}
                    </Link>
                    <Link
                        href="/scenarios"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline transition-all"
                    >
                        {dict.navbar.scenarios}
                    </Link>
                    <Link
                        href="/students"
                        className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-all"
                    >
                        {dict.navbar.students}
                    </Link>
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
                <StudentManagement centerId={user.id} />
            </main>
        </div>
    );
}
