import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/language-selector";
import { ClipboardList, Users, Package, ChevronLeft } from "lucide-react";

export default async function ECELayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();

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
    const role = String(rawRole).toLowerCase().trim();
    if (role !== "profesor" && role !== "centro") {
        return redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-background flex flex-col p-4 md:p-8">
            <header className="flex flex-col gap-6 mb-8 max-w-6xl mx-auto w-full">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Volver al Panel
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight hidden md:block border-l pl-4 ml-2">ECE</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <LanguageSelector />
                        <ThemeToggle />
                    </div>
                </div>

                <nav className="flex items-center gap-2 bg-card p-1 rounded-lg border w-fit shadow-sm">
                    <Link
                        href="/dashboard/ece"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors"
                    >
                        <ClipboardList className="w-4 h-4" />
                        Incidentes
                    </Link>
                    <Link
                        href="/dashboard/ece/pacientes"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors"
                    >
                        <Users className="w-4 h-4" />
                        Pacientes
                    </Link>
                    <Link
                        href="/dashboard/ece/recursos"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors"
                    >
                        <Package className="w-4 h-4" />
                        Recursos
                    </Link>
                </nav>
            </header>

            <main className="w-full max-w-6xl mx-auto flex-1 flex flex-col">
                {children}
            </main>
        </div>
    );
}
