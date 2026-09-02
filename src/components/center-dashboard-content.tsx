"use client";

import { useState } from "react";
import { StudentManagement } from "./student-management";
import { ProfessorManagement } from "./professor-management";
import { Users, GraduationCap } from "lucide-react";

export function CenterDashboardContent({ centerId }: { centerId: string }) {
    const [activeTab, setActiveTab] = useState<"professors" | "students">("professors");

    return (
        <div className="w-full space-y-8">
            <div className="border-b border-border">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab("professors")}
                        className={`
                            whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === "professors" 
                                ? "border-primary text-primary" 
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}
                        `}
                    >
                        <Users className="mr-2 h-5 w-5" />
                        Gestión de Profesores
                    </button>

                    <button
                        onClick={() => setActiveTab("students")}
                        className={`
                            whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === "students" 
                                ? "border-primary text-primary" 
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}
                        `}
                    >
                        <GraduationCap className="mr-2 h-5 w-5" />
                        Gestión de Alumnos
                    </button>
                </nav>
            </div>

            <div className="mt-8">
                {activeTab === "professors" ? (
                    <ProfessorManagement centerId={centerId} />
                ) : (
                    <StudentManagement centerId={centerId} />
                )}
            </div>
        </div>
    );
}
