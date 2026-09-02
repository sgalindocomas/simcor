"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { dictionaries, SupportedLocale, Dictionary } from "./dictionaries";

interface I18nContextProps {
    locale: SupportedLocale;
    t: (keyPath: string) => string;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export function I18nProvider({
    children,
    initialLocale,
}: {
    children: ReactNode;
    initialLocale: SupportedLocale;
}) {
    const locale = initialLocale;

    // Function to safely navigate nested objects using a dot-separated string path
    // E.g., t('common.cancel') -> "Cancelar"
    const t = (keyPath: string): string => {
        const keys = keyPath.split(".");
        let current: any = dictionaries[locale];

        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Translation key not found: ${keyPath} for locale ${locale}`);
                return keyPath; // fallback to key path if not found
            }
            current = current[key];
        }

        if (typeof current !== 'string') {
            console.warn(`Translation key is not a string: ${keyPath} for locale ${locale}`);
            return keyPath;
        }

        return current;
    };

    return (
        <I18nContext.Provider value={{ locale, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error("useI18n must be used within an I18nProvider");
    }
    return context;
}
