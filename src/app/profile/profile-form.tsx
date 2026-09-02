"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile } from "./actions"
import { useI18n } from "@/i18n/i18n-context"

export function ProfileForm({
    initialInstitution,
    initialDepartment
}: {
    initialInstitution: string,
    initialDepartment: string
}) {
    const [institution, setInstitution] = useState(initialInstitution)
    const [department, setDepartment] = useState(initialDepartment)
    const [isPending, setIsPending] = useState(false)
    const [message, setMessage] = useState('')

    const { t } = useI18n()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)
        setMessage('')

        try {
            const result = await updateProfile({ institution, department })
            if (result.error) {
                setMessage(t('profile.errorUpdate'))
            } else {
                setMessage(t('profile.successUpdate'))
            }
        } catch (error) {
            setMessage(t('profile.errorUpdate'))
        } finally {
            setIsPending(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
                <div className={`p-3 text-sm rounded-md ${message.includes('success') ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {message}
                </div>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="institution">{t('profile.institution')}</Label>
                    <Input
                        id="institution"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="..."
                        disabled={isPending}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="department">{t('profile.department')}</Label>
                    <Input
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="..."
                        disabled={isPending}
                    />
                </div>
            </div>

            <Button type="submit" disabled={isPending}>
                {isPending ? t('common.saving') : t('profile.saveChanges')}
            </Button>
        </form>
    )
}
