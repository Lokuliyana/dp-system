"use client";

import { useMemo, useState } from "react";
import { Edit, Trash2, Database, Plus } from "lucide-react";

import { Button } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { ManagementConsole, DeleteConfirmationModal } from "@/components/reusable";

interface MasterDataListProps<T> {
  title: string;
  description: string;
  items: T[];
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  renderItem: (item: T) => React.ReactNode;
  filterPredicate: (item: T, query: string) => boolean;
  getId: (item: T) => string;
}

export function MasterDataList<T>({
  title,
  description,
  items,
  onAdd,
  onEdit,
  onDelete,
  renderItem,
  filterPredicate,
  getId,
}: MasterDataListProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => filterPredicate(item, q));
  }, [items, searchTerm, filterPredicate]);

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete);
      setItemToDelete(null);
    }
  };

  return (
    <>
      <ManagementConsole
        title={title}
        description={description}
        icon={Database}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={`Search ${title.toLowerCase()}...`}
        onAdd={onAdd}
        addLabel="Add New"
        noContentCard
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-900">
              {title} List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No items found.
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={getId(item)}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">{renderItem(item)}</div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-blue-600"
                        onClick={() => onEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-red-600"
                        onClick={() => handleDeleteClick(getId(item))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </ManagementConsole>

      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        itemName="this item"
      />
    </>
  );
}
