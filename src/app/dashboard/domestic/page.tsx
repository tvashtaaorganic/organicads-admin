"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

// ✅ Define Type at Top
type Page = {
  id: string;
  name: string;
  locationin: string;
  cityin: string;
  countryin: string;
  descpost: string;
  cat: string;
  titletag: string;
  descriptiontag: string;
  keywordstag: string;
  slug: string;
  servicename: string;
  date: string;
};

const fetchPages = async (page = 0, searchQuery = "", descpost = "domestic") => {
  try {
    const url = new URL("/api/pages", window.location.origin);
    url.searchParams.append("page", String(page));
    url.searchParams.append("search", searchQuery);
    url.searchParams.append("descpost", descpost);

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch data");
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching pages:", error);
    return { items: [], totalPages: 0 };
  }
};

export default function DomesticPage() {
  const [data, setData] = useState<Page[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState<Omit<Page, "id">>({
    name: "",
    locationin: "",
    cityin: "",
    countryin: "",
    descpost: "",
    cat: "",
    titletag: "",
    descriptiontag: "",
    keywordstag: "",
    slug: "",
    servicename: "",
    date: "",
  });

  const { toast } = useToast();

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchPages(pageIndex, searchQuery, "domestic");
      const sortedItems = (result.items || []).sort(
        (a: Page, b: Page) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setData(sortedItems);
      setTotalPages(result.totalPages || 0);
    };
    loadData();
  }, [pageIndex, searchQuery]);

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    const { id, ...rest } = page;
    setFormData(rest);
  };

  const handleSubmitEdit = async () => {
    if (!editingPage) return;

    const updatedData: Page = { id: editingPage.id, ...formData };

    try {
      const res = await fetch("/api/pages/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const responseBody = await res.json();
      if (!res.ok) throw new Error(responseBody.error || "Failed to update page");

      toast({ title: "Success", description: "Page updated successfully" });

      setEditingPage(null);
      const refreshed = await fetchPages(pageIndex, searchQuery, "domestic");
      setData(refreshed.items || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this page?");
    if (!confirmed) return;

    try {
      const res = await fetch("/api/pages/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete page");
      }

      toast({ title: "Deleted", description: `Page deleted successfully.`, variant: "success" });
      setData((prev) => prev.filter((page) => page.id !== id));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const columns = [
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }: any) => (
        <a
          href={`http://localhost:3000/services/${row.original.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {row.original.slug}
        </a>
      ),
    },
    { accessorKey: "locationin", header: "Location" },
    { accessorKey: "cityin", header: "City" },
    { accessorKey: "countryin", header: "Country" },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => formatDate(row.original.date),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => handleEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={() => handleDelete(row.original.id)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col w-full p-4">
      <h1 className="text-xl font-bold mb-4">Domestic Pages</h1>

      <div className="flex justify-between mb-4">
        <Input
          placeholder="Search by name or slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/3"
        />
      </div>

      <div className="rounded-md border w-full overflow-auto mb-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex gap-2 items-center flex-wrap">
        <Button size="sm" onClick={() => setPageIndex(0)} disabled={pageIndex === 0}>
          First
        </Button>
        <Button size="sm" onClick={() => setPageIndex((p) => Math.max(p - 1, 0))} disabled={pageIndex === 0}>
          Previous
        </Button>
        {Array.from({ length: totalPages }, (_, i) => (
          <Button key={i} size="sm" variant={pageIndex === i ? "default" : "outline"} onClick={() => setPageIndex(i)}>
            {i + 1}
          </Button>
        ))}
        <Button size="sm" onClick={() => setPageIndex((p) => Math.min(p + 1, totalPages - 1))} disabled={pageIndex === totalPages - 1}>
          Next
        </Button>
        <Button size="sm" onClick={() => setPageIndex(totalPages - 1)} disabled={pageIndex === totalPages - 1}>
          Last
        </Button>
      </div>

      <Toaster />

      {/* Edit Modal */}
      {editingPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-lg font-semibold mb-4">Edit Page</h2>

            <div className="grid grid-cols-1 gap-4 max-h-[75vh] overflow-y-auto">
              {(Object.keys(formData) as (keyof Page)[]).map((key) => (
                <div key={key}>
                  <Label htmlFor={key}>{key}</Label>
                  <Input
                    id={key}
                    value={formData[key] ?? ""}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingPage(null)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitEdit}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
