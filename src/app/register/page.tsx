"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/i18n/i18n-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
    const [fullName, setFullName] = useState("");
    const [centerName, setCenterName] = useState("");
    const [studyType, setStudyType] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
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
        
        if (password !== confirmPassword) {
            setError(t('login.passwordsDoNotMatch') || "Las contraseñas no coinciden.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError(t('login.invalidEmail') || "Por favor, introduce un correo electrónico válido.");
            return;
        }

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
        <div className="flex min-h-screen items-center justify-center p-4 py-12 bg-muted/40">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <Card className="w-full max-w-xl border-0 shadow-xl bg-background/60 backdrop-blur-xl sm:border sm:bg-card">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-2">
                        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            Alta de Usuarios Centros
                        </span>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">{t('register.title')}</CardTitle>
                    <CardDescription>
                        {t('register.description')}
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    {successMessage ? (
                        <div className="rounded-md bg-green-500/15 p-6 text-center space-y-6 border border-green-500/20">
                            <p className="text-base font-medium text-green-600 dark:text-green-400">
                                {successMessage}
                            </p>
                            <Link href="/login">
                                <Button className="w-full sm:w-auto">
                                    {t('register.returnToSignIn')}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleRegisterCenter}>
                            {error && (
                                <div className="rounded-md bg-destructive/15 p-4 text-sm font-medium text-destructive leading-relaxed border border-destructive/20">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Nombre del Centro */}
                                <div className="sm:col-span-2 space-y-2">
                                    <Label htmlFor="centerName">
                                        {t('register.centerName')} <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="centerName"
                                        name="centerName"
                                        type="text"
                                        required
                                        placeholder="Ej: CIFP San Fernando"
                                        value={centerName}
                                        onChange={(e) => setCenterName(e.target.value)}
                                    />
                                </div>

                                {/* Persona de Contacto */}
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">
                                        {t('register.fullName')} <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        required
                                        placeholder="Ej: Laura Gómez"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>

                                {/* Tipo de Estudio */}
                                <div className="space-y-2">
                                    <Label htmlFor="studyType">
                                        {t('register.studyType')} <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="studyType"
                                        name="studyType"
                                        type="text"
                                        required
                                        placeholder="Ej: FP Emergencias Sanitarias"
                                        value={studyType}
                                        onChange={(e) => setStudyType(e.target.value)}
                                    />
                                </div>

                                {/* Email corporativo */}
                                <div className="sm:col-span-2 space-y-2">
                                    <Label htmlFor="email">
                                        {t('login.emailLabel')} <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        placeholder="contacto@centro.edu"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                {/* Contraseña */}
                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        {t('login.passwordLabel')} <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>

                                {/* Confirmar Contraseña */}
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">
                                        Repetir Contraseña <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        aria-invalid={confirmPassword !== "" && password !== confirmPassword}
                                    />
                                    {confirmPassword !== "" && password !== confirmPassword && (
                                        <p className="text-xs text-destructive mt-1">Las contraseñas no coinciden</p>
                                    )}
                                </div>

                                {/* Dirección */}
                                <div className="sm:col-span-2 space-y-2">
                                    <Label htmlFor="address">
                                        {t('register.address')}
                                    </Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        type="text"
                                        placeholder="Av. Universitaria, 12"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </div>

                                {/* Ciudad */}
                                <div className="space-y-2">
                                    <Label htmlFor="city">
                                        {t('register.city')}
                                    </Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                    />
                                </div>

                                {/* Provincia */}
                                <div className="space-y-2">
                                    <Label htmlFor="province">
                                        {t('register.province')}
                                    </Label>
                                    <Input
                                        id="province"
                                        name="province"
                                        type="text"
                                        value={province}
                                        onChange={(e) => setProvince(e.target.value)}
                                    />
                                </div>

                                {/* Teléfono */}
                                <div className="sm:col-span-2 space-y-2">
                                    <Label htmlFor="phone">
                                        {t('register.phone')}
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="+34 912 345 678"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full mt-8"
                                disabled={loading || (confirmPassword !== "" && password !== confirmPassword)}
                            >
                                {loading ? t('register.creatingAccount') : t('register.signUpBtn')}
                            </Button>
                        </form>
                    )}
                </CardContent>
                
                {!successMessage && (
                    <CardFooter className="flex justify-center border-t p-6">
                        <p className="text-sm text-muted-foreground">
                            {t('register.hasAccount')}{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all"
                            >
                                {t('register.signInLink')}
                            </Link>
                        </p>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
