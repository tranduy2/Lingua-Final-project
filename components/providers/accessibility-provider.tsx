"use client";

import * as React from "react";

interface AccessibilityContextType {
    highContrast: boolean;
    setHighContrast: (value: boolean) => void;
    dyslexiaFriendly: boolean;
    setDyslexiaFriendly: (value: boolean) => void;
}

const AccessibilityContext = React.createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const [highContrast, setHighContrastState] = React.useState(false);
    const [dyslexiaFriendly, setDyslexiaFriendlyState] = React.useState(false);

    // Load preferences from localStorage on mount
    React.useEffect(() => {
        const savedHighContrast = localStorage.getItem("lingua-high-contrast");
        const savedDyslexia = localStorage.getItem("lingua-dyslexia-friendly");

        if (savedHighContrast === "true") {
            setHighContrastState(true);
            document.documentElement.classList.add("high-contrast");
        }
        if (savedDyslexia === "true") {
            setDyslexiaFriendlyState(true);
            document.documentElement.classList.add("dyslexia-friendly");
        }
    }, []);

    const setHighContrast = (value: boolean) => {
        setHighContrastState(value);
        localStorage.setItem("lingua-high-contrast", String(value));
        if (value) {
            document.documentElement.classList.add("high-contrast");
        } else {
            document.documentElement.classList.remove("high-contrast");
        }
    };

    const setDyslexiaFriendly = (value: boolean) => {
        setDyslexiaFriendlyState(value);
        localStorage.setItem("lingua-dyslexia-friendly", String(value));
        if (value) {
            document.documentElement.classList.add("dyslexia-friendly");
        } else {
            document.documentElement.classList.remove("dyslexia-friendly");
        }
    };

    return (
        <AccessibilityContext.Provider
            value={{
                highContrast,
                setHighContrast,
                dyslexiaFriendly,
                setDyslexiaFriendly,
            }}
        >
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = React.useContext(AccessibilityContext);
    if (context === undefined) {
        throw new Error("useAccessibility must be used within an AccessibilityProvider");
    }
    return context;
}
