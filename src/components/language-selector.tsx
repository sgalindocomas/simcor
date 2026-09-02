"use client";

import { useTransition } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/i18n/i18n-context";
import { SupportedLocale } from "@/i18n/dictionaries";
import { setUserLanguage } from "@/i18n/actions";

export function LanguageSelector() {
    const { locale } = useI18n();
    const [isPending, startTransition] = useTransition();

    const handleLanguageChange = (value: string) => {
        const newLocale = value as SupportedLocale;
        if (newLocale === locale) return;

        startTransition(async () => {
            await setUserLanguage(newLocale);
            // Fast refresh since revalidatePath takes care of it, but we can also force a hard refresh
            // if we wanted to guarantee context reload. Next.js revalidation is usually sufficient.
        });
    };

    return (
        <div className="flex items-center gap-2">
            <Select value={locale} onValueChange={handleLanguageChange} disabled={isPending}>
                <SelectTrigger className="w-[110px] h-9 text-sm">
                    <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="cat">Català</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
