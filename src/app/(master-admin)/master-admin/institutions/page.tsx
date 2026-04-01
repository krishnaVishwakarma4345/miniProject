"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { UserRole } from "@/types/user.types"

type Institution = {
  id: string
  name: string
  isActive: boolean
}

type ApiResponse<T> = {
  success: boolean
  data: T
  message: string
}

export default function MasterAdminInstitutionsPage() {
  const { user } = useAuth()
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isMasterAdmin = user?.role === UserRole.MASTER_ADMIN

  const activeInstitutions = useMemo(
    () => institutions.filter((item) => item.isActive),
    [institutions]
  )

  const loadInstitutions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/institutions", { method: "GET", cache: "no-store" })
      const payload = (await response.json()) as ApiResponse<Institution[]>

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Failed to fetch institutions")
      }

      setInstitutions(payload.data || [])
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch institutions")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadInstitutions()
  }, [])

  const handleAddInstitution = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isMasterAdmin) {
      setError("Only master admin can add institutions")
      return
    }

    const trimmedName = name.trim()
    const trimmedCode = code.trim()

    if (!trimmedName) {
      setError("Institution name is required")
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/master-admin/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          code: trimmedCode || undefined,
        }),
      })

      const payload = (await response.json()) as ApiResponse<{ id: string }>
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Failed to save institution")
      }

      setName("")
      setCode("")
      setSuccess("Institution saved successfully")
      await loadInstitutions()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save institution")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDisableInstitution = async (institutionId: string) => {
    if (!isMasterAdmin) {
      setError("Only master admin can remove institutions")
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/master-admin/institutions?institutionId=${encodeURIComponent(institutionId)}`, {
        method: "DELETE",
      })

      const payload = (await response.json()) as ApiResponse<{ id: string }>
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Failed to disable institution")
      }

      setSuccess("Institution disabled successfully")
      await loadInstitutions()
    } catch (disableError) {
      setError(disableError instanceof Error ? disableError.message : "Failed to disable institution")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Master tenant control</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Institutions</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          This screen is exclusive to master admin. You can add or remove colleges/universities and view all active institutions.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
        <form onSubmit={handleAddInstitution} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Add institution</h2>
          <Input
            label="Institution name"
            name="institutionName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex: Terna College"
            required
          />
          <Input
            label="Institution code (optional)"
            name="institutionCode"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Ex: terna-college"
            hint="Leave empty to auto-generate from name"
          />
          <Button type="submit" loading={isSaving} disabled={!isMasterAdmin}>
            Save institution
          </Button>
          {!isMasterAdmin ? (
            <p className="text-xs text-amber-600">Only master admin can add/remove institutions.</p>
          ) : null}
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Active institutions</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => void loadInstitutions()} disabled={isLoading || isSaving}>
              Refresh
            </Button>
          </div>

          {error ? <p className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
          {success ? <p className="mb-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

          {isLoading ? (
            <p className="text-sm text-slate-500">Loading institutions...</p>
          ) : activeInstitutions.length ? (
            <ul className="space-y-3">
              {activeInstitutions.map((institution) => (
                <li key={institution.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{institution.name}</p>
                    <p className="text-xs text-slate-500">Code: {institution.id}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!isMasterAdmin || isSaving}
                    onClick={() => void handleDisableInstitution(institution.id)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No active institutions found.</p>
          )}
        </div>
      </section>
    </div>
  )
}
