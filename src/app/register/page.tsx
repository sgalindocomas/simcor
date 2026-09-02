"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/i18n/i18n-context";

export default function RegisterPage() {
    const [fullName, setFullName] = useState("");
    const [centerName, setCenterName] = useState("");
    const [studyType, setStudyType] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [province, setProvince] = useState("");
    const [phone, setPhone] = useState("");
    
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const { t } = useI18n();

    const handleRegisterCenter = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        const { error, data } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: "centro",
                    full_name: fullName,
                    center_name: centerName,
                    study_type: studyType,
                    address: address || null,
                    city: city || null,
                    province: province || null,
                    phone: phone || null,
                    lang: "es",
                }
            }
        });

        if (error) {
            console.error("Center signup error:", error);
            if (error.message.includes("confirmation email")) {
                setError("Error al enviar el correo de confirmación por el servidor SMTP. Para solucionar esto en Supabase: ve a tu consola de Supabase > Authentication > Providers > Email y desactiva 'Confirm email'.");
            } else {
                setError(error.message || t('register.errorCreate'));
            }
            setLoading(false);
        } else if (data?.user && data.user.identities && data.user.identities.length === 0) {
            setError(t('register.errorExists'));
            setLoading(false);
        } else {
            setSuccessMessage(t('register.successMsg'));
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 my-8">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-xl space-y-8 rounded-xl bg-card p-8 shadow-lg ring-1 ring-border/50">
                <div className="text-center">
                    <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
                        Alta de Usuarios Centros
                    </span>
                    <h2 className="text-3xl font-bold tracking-tight">{t('register.title')}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t('register.description')}
                    </p>
                </div>

                {successMessage ? (
                    <div className="mt-8 rounded-md bg-green-500/15 p-6 text-center space-y-4">
                        <p className="text-base font-medium text-green-600 dark:text-green-400">
                            {successMessage}
                        </p>
                        <Link
                            href="/login"
                            className="inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                        >
                            {t('register.returnToSignIn')}
                        </Link>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleRegisterCenter}>
                        {error && (
                            <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive leading-relaxed">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nombre del Centro */}
                            <div className="md:col-span-2">
                                <label htmlFor="centerName" className="block text-sm font-medium leading-6">
                                    {t('register.centerName')} <span className="text-destructive">*</span>
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="centerName"
                                        name="centerName"
                                        type="text"
                                        required
                                        placeholder="Ej: CIFP San Fernando"
                                        value={centerName}
                                        onChange={(e) => setCenterName(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-foreground bg-background shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            {/* Persona de Contacto */}
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium leading-6">
                                    {t('register.fullName')} <span className="text-destructive">*</span>
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        required
                                        placeholder="Ej: Laura Gómez (Coordinadora)"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-foreground bg-background shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            {/* Tipo de Estudio */}
                            <div>
                                <label htmlFor="studyType" className="block text-sm font-medium leading-6">
                                    {t('register.studyType')} <span className="text-destructive">*</span>
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="studyType"
                                        name="studyType"
                                        type="text"
                                        required
                                        placeholder="Ej: FP Emergencias Sanitarias, Medicina"
                                        value={studyType}
                                        onChange={(e) => setStudyType(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-foreground bg-background shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            {/* Email corporativo */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium leading-6">
                                    {t('login.emailLabel')} <span className="text-destructive">*</span>
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        placeholder="contacto@centro.edu"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-foreground bg-background shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            {/* Contraseña */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium leading-6">
                                    {t('login.passwordLabel')} <span className="text-destructive">*</span>
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-foreground bg-background shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            {/* Dirección */}
                            <div className="md:col-span-2">
                                <label htmlFor="address" className="block text-sm font-medium leading-6">
                                    {t('register.address')}
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="address"
                                        name="address"
                                        type="text"
                                        placeholder="Av. Universitaria, 12"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-foreground bg-background shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            {/* Ciudad */}
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium leading-6">
                                    {t('register.city')}
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="city"
                                        name="city"
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-foreground bg-background shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            {/* Provincia */}
                            <div>
                                <label htmlFor="province" className="block text-sm font-medium leading-6">
                                    {t('register.province')}
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="province"
                                        name="province"
                                        type="text"
                                        value={province}
                                        onChange={(e) => setProvince(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-foreground bg-background shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            {/* Teléfono */}
                            <div className="md:col-span-2">
                                <label htmlFor="phone" className="block text-sm font-medium leading-6">
                                    {t('register.phone')}
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="+34 912 345 678"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-foreground bg-background shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold leading-6 text-primary-foreground shadow-sm hover:bg-primary/90 hover:-translate-y-0.5 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 transition-all duration-200"
                            >
                                {loading ? t('register.creatingAccount') : t('register.signUpBtn')}
                            </button>
                        </div>
                    </form>
                )}

                <p className="mt-8 text-center text-sm text-muted-foreground">
                    {t('register.hasAccount')}{" "}
                    <Link
                        href="/login"
                        className="font-semibold leading-6 text-primary hover:text-primary/80 hover:underline transition-all"
                    >
                        {t('register.signInLink')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
