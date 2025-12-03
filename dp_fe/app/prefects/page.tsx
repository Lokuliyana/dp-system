"use client";

import { useState } from "react";
import { Shield, Plus } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { PrefectsMenu } from "@/components/prefects/prefects-menu";
import { Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { usePrefects, useCreatePrefectYear } from "@/hooks/usePrefects";
import { PrefectYearForm } from "@/components/prefects/PrefectYearForm";
import { CreatePrefectYearPayload } from "@/services/masterdata/prefects.service";

export default function PrefectsPage() {
  const { data: prefectYears = [], isLoading } = usePrefects(); // This fetches the list of years/groups
  const createYearMutation = useCreatePrefectYear();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreate = (data: CreatePrefectYearPayload) => {
    createYearMutation.mutate(data, {
      onSuccess: () => setIsCreateModalOpen(false),
    });
  };

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <PrefectsMenu />

      <DynamicPageHeader
        title="Prefects Management"
        subtitle="Manage student prefects and positions."
        icon={Shield}
        actions={
          <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4" />
            New Prefect Year
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-900">
              Prefect Guilds by Year
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {isLoading ? (
                <div className="p-8 text-center text-sm text-slate-500">Loading...</div>
              ) : prefectYears.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">No prefect years found. Create one to start adding prefects.</div>
              ) : (
                prefectYears.map((yearGroup: any) => (
                  <div
                    key={yearGroup.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-900">Prefect Guild {yearGroup.year}</p>
                      <p className="text-sm text-slate-500">{yearGroup.students?.length || 0} Members</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/prefects/${yearGroup.id || yearGroup._id}`}>View Members</a>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Prefect Year</DialogTitle>
          </DialogHeader>
          <PrefectYearForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={createYearMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </LayoutController>
  );
}
