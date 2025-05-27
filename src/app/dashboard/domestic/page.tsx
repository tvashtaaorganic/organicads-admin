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
    const month = date.getMonth() + 1; // months are 0-indexed
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12

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

  // Properly type `page` param here
  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setFormData({
      name: page.name,
      locationin: page.locationin,
      cityin: page.cityin,
      countryin: page.countryin,
      descpost: page.descpost,
      cat: page.cat,
      titletag: page.titletag,
      descriptiontag: page.descriptiontag,
      keywordstag: page.keywordstag,
      slug: page.slug,
      servicename: page.servicename,
      date: page.date,
    });
  };

  const handleSubmitEdit = async () => {
    if (!editingPage) return; // safeguard

    const updatedData = {
      id: editingPage.id,
      ...formData,
    };

    try {
      const res = await fetch("/api/pages/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const responseBody = await res.json();
      if (!res.ok) throw new Error(responseBody.error || "Failed to update page");

      toast({
        title: "Success",
        description: "Page updated successfully",
      });

      setEditingPage(null);
      // Refresh data after update
      const refreshed = await fetchPages(pageIndex, searchQuery, "domestic");
      setData(refreshed.items || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Properly type id parameter as string here
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

      toast({
        title: "Deleted",
        description: `Page with ID ${id} deleted successfully.`,
        variant: "success",
      });

      setData((prev) => prev.filter((page) => page.id !== id));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const columns = [
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }: { row: { original: Page } }) => (
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
      cell: ({ row }: { row: { original: Page } }) => formatDate(row.original.date),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: Page } }) => (
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

      {/* Search Box */}
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Search by name or slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/3"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border flex flex-col w-full gap-2 mr-2 mb-4 max-w-max">
        <Table className="flex-col w-full">
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
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
      <div className="flex justify-between items-center mt-4 max-w-max gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setPageIndex(0)} disabled={pageIndex === 0}>
          First
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
          disabled={pageIndex === 0}
        >
          Previous
        </Button>
        <div className="flex space-x-1 overflow-x-auto items-center">
          {(() => {
            const pages = [];
            const showRange = 2; // show 2 pages before and after current
            const start = Math.max(0, pageIndex - showRange);
            const end = Math.min(totalPages - 1, pageIndex + showRange);
            for (let i = start; i <= end; i++) {
              pages.push(
                <Button
                  key={i}
                  variant={pageIndex === i ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPageIndex(i)}
                >
                  {i + 1}
                </Button>
              );
            }
            return pages;
          })()}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPageIndex((prev) => Math.min(prev + 1, totalPages - 1))}
          disabled={pageIndex >= totalPages - 1}
        >
          Next
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPageIndex(totalPages - 1)}
          disabled={pageIndex >= totalPages - 1}
        >
          Last
        </Button>
      </div>

      {/* Edit Modal */}
      {editingPage && (
        <dialog open className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <form
            className="bg-white p-6 rounded-lg w-[600px] max-w-full overflow-auto max-h-[90vh]"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitEdit();
            }}
          >
            <h2 className="text-lg font-bold mb-4">Edit Page</h2>

            <div className="space-y-2 mb-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2 mb-4">
              <Label htmlFor="locationin">Location</Label>
              <Input
                id="locationin"
                value={formData.locationin}
                onChange={(e) => setFormData((prev) => ({ ...prev, locationin: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2 mb-4">
              <Label htmlFor="cityin">City</Label>
              <Input
                id="cityin"
                value={formData.cityin}
                onChange={(e) => setFormData((prev) => ({ ...prev, cityin: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2 mb-4">
              <Label htmlFor="countryin">Country</Label>
              <Input
                id="countryin"
                value={formData.countryin}
                onChange={(e) => setFormData((prev) => ({ ...prev, countryin: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2 mb-4">
              <Label htmlFor="descpost">Description Post</Label>
              <Input
                id="descpost"
                value={formData.descpost}
                onChange={(e) => setFormData((prev) => ({ ...prev, descpost: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2 mb-4">
              <Label htmlFor="cat">Category</Label>
              <Input
                id="cat"
                value={formData.cat}
                onChange={(e) => setFormData((prev) => ({ ...prev, cat: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2 mb-4">
              <Label htmlFor="titletag">Title Tag</Label>
              <Input
                id="titletag"
                value={formData.titletag}
                onChange={(e) => setFormData((prev) => ({ ...prev, titletag: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2 mb-4">
              <Label htmlFor="descriptiontag">Description Tag</Label>
              <Input
                id="descriptiontag"
                value={formData.descriptiontag}
                onChange={(e) => setFormData((prev) => ({ ...prev, descriptiontag: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2 mb-4">
              <Label htmlFor="keywordstag">Keywords Tag</Label>
              <Input
                id="keywordstag"
                value={formData.keywordstag}
                onChange={(e) => setFormData((prev) => ({ ...prev, keywordstag: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2 mb-4">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2 mb-4">
              <Label htmlFor="servicename">Service Name</Label>
              <Input
                id="servicename"
                value={formData.servicename}
                onChange={(e) => setFormData((prev) => ({ ...prev, servicename: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2 mb-4">
              <Label htmlFor="date">Date</Label>
              <Input
                type="datetime-local"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="submit" variant="default">
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingPage(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </dialog>
      )}

      <Toaster />
    </div>
  );
}
