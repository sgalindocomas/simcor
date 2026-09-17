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

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const { t } = useI18n();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <Card className="w-full max-w-md border-0 shadow-xl bg-background/60 backdrop-blur-xl sm:border sm:bg-card">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight">{t('login.title')}</CardTitle>
                    <CardDescription>
                        {t('login.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleLogin}>
                        {error && (
                            <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('login.emailLabel')}</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="m@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">{t('login.passwordLabel')}</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-6"
                            disabled={loading}
                        >
                            {loading ? t('login.signingIn') : t('login.signInBtn')}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-6">
                    <p className="text-sm text-muted-foreground">
                        {t('login.noAccount')}{" "}
                        <Link
                            href="/register"
                            className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all"
                        >
                            {t('login.signUpLink')}
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
