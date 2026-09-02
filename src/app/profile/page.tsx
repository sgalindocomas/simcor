import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";
import { LanguageSelector } from "@/components/language-selector";
import { cookies } from "next/headers";
import { dictionaries, SupportedLocale } from "@/i18n/dictionaries";

export default async function ProfilePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    let roleData = null;
    const role = String(profile?.role || user.user_metadata?.role).toLowerCase().trim();

    if (role === 'centro') {
        const { data } = await supabase.from('centers').select('*').eq('id', user.id).single();
        roleData = data;
    } else if (role === 'profesor') {
        const { data } = await supabase.from('professors').select('*').eq('id', user.id).single();
        roleData = data;
    } else if (role === 'alumno') {
        const { data } = await supabase.from('students').select('*').eq('id', user.id).single();
        roleData = data;
    }

    const cookieStore = await cookies();
    const locale = (cookieStore.get("NEXT_LOCALE")?.value as SupportedLocale) || "es";
    const dict = dictionaries[locale];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="flex items-center justify-between p-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {dict.common.backToDashboard}
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">{dict.profile.title}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <LanguageSelector />
                    <ThemeToggle />
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl -mt-20">
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-medium">{dict.profile.accountDetails}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {dict.profile.accountSettingsDesc}
                                </p>
                            </div>

                            <div className="border-t pt-6 space-y-4">
                                <div>
                                    <p className="text-sm font-medium leading-6">{dict.profile.email}</p>
                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <p className="text-sm font-medium leading-6">Nombre Completo</p>
                                            <p className="mt-1 text-sm leading-6 text-muted-foreground bg-muted p-2 rounded-md">
                                                {profile?.full_name}
                                            </p>
                                        </div>
                                    </div>

                                    {role === 'centro' && roleData && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <p className="text-sm font-medium leading-6">Nombre del Centro</p>
                                                <p className="mt-1 text-sm leading-6 text-muted-foreground bg-muted p-2 rounded-md">{roleData.name}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-sm font-medium leading-6">Dirección</p>
                                                <p className="mt-1 text-sm leading-6 text-muted-foreground bg-muted p-2 rounded-md">
                                                    {roleData.address}, {roleData.city}, {roleData.province} {roleData.postal_code}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium leading-6">Teléfono</p>
                                                <p className="mt-1 text-sm leading-6 text-muted-foreground bg-muted p-2 rounded-md">{roleData.phone || "-"}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium leading-6">Tipo de Estudio</p>
                                                <p className="mt-1 text-sm leading-6 text-muted-foreground bg-muted p-2 rounded-md">{roleData.study_type || "-"}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium leading-6">Código de Centro</p>
                                                <p className="mt-1 text-sm leading-6 text-muted-foreground bg-muted p-2 rounded-md">{roleData.center_code || "-"}</p>
                                            </div>
                                        </div>
                                    )}

                                    {role === 'profesor' && roleData && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium leading-6">Departamento</p>
                                                <p className="mt-1 text-sm leading-6 text-muted-foreground bg-muted p-2 rounded-md">{roleData.department || "-"}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium leading-6">Nº Empleado</p>
                                                <p className="mt-1 text-sm leading-6 text-muted-foreground bg-muted p-2 rounded-md">{roleData.employee_number || "-"}</p>
                                            </div>
                                        </div>
                                    )}

                                    {role === 'alumno' && roleData && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium leading-6">Grupo/Curso</p>
                                                <p className="mt-1 text-sm leading-6 text-muted-foreground bg-muted p-2 rounded-md">{roleData.course_group || "-"}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium leading-6">Matrícula</p>
                                                <p className="mt-1 text-sm leading-6 text-muted-foreground bg-muted p-2 rounded-md">{roleData.student_code || "-"}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <form action={async () => {
                                    "use server";
                                    const supabase = await createClient();
                                    await supabase.auth.signOut();
                                    redirect("/login");
                                }}>
                                    <button
                                        type="submit"
                                        className="rounded-md bg-destructive px-3 py-2 text-sm font-semibold text-destructive-foreground shadow-sm hover:bg-destructive/90 transition-colors"
                                    >
                                        {dict.navbar.signOut}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
