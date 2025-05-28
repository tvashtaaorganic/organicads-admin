"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const fetchPages = async (
  page = 0,
  searchQuery = "",
  descpost = "international"
): Promise<{ items: Page[]; totalPages: number }> => {
  try {
    const url = new URL("/api/pages", window.location.origin);
 // url.searchParams.append("page", String(page));
    url.searchParams.append("page", page.toString());
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
      const result = await fetchPages(pageIndex, searchQuery, "international");
      // Sort descending by date
      const sortedItems = (result.items || []).sort(
        (a: Page, b: Page) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setData(sortedItems);
      setTotalPages(result.totalPages || 0);
    };
    loadData();
  }, [pageIndex, searchQuery]);

  // Edit handler
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

  // Submit update
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
      const refreshed = await fetchPages(pageIndex, searchQuery, "international");
      setData(refreshed.items || []);
     } 
    // catch (error: any) {
    //   toast({
    //     title: "Error",
    //     description: error.message,
    //     variant: "destructive",
    //   });
    // }
    catch (error: unknown) {
  let message = "An unknown error occurred";

  if (error instanceof Error) {
    message = error.message;
  }

  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
}

  };

  // Delete handler
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
        variant: "default",
      });

      setData((prev) => prev.filter((page) => page.id !== id));
    } 
   catch (error: unknown) {
  let message = "An unknown error occurred";

  if (error instanceof Error) {
    message = error.message;
  }

  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
}
  };

  // Columns for react-table
  const columns = [
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }: { row: { original: Page } }) => (
        <a
          href={`https://organicads.in/${row.original.slug}`}
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
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center p-4">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          onClick={() => setPageIndex((old) => Math.max(old - 1, 0))}
          disabled={pageIndex === 0}
        >
          Previous
        </Button>
        <span>
          Page <strong>{pageIndex + 1}</strong> of <strong>{totalPages}</strong>
        </span>
        <Button
          variant="outline"
          onClick={() => setPageIndex((old) => (old + 1 < totalPages ? old + 1 : old))}
          disabled={pageIndex + 1 >= totalPages}
        >
          Next
        </Button>
      </div>

      {/* Edit Modal */}
    {editingPage && (
  <div
    id="editModal"
    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    aria-modal="true"
    role="dialog"
    onClick={(e) => {
      // Close modal if clicking outside the form (backdrop)
      if (e.target === e.currentTarget) setEditingPage(null);
    }}
  >
    <form
      method="dialog"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmitEdit();
      }}
      className="bg-white modal-box max-w-xl w-full rounded-2xl p-6"
      onClick={(e) => e.stopPropagation()} // prevent modal close on form click
    >
      <h3 className="font-bold text-lg mb-4">Edit Page</h3>

      <div className="grid grid-cols-2 gap-2">
        <Label>Name</Label>
        <Input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Label>Location</Label>
        <Input
          type="text"
          value={formData.locationin}
          onChange={(e) =>
            setFormData({ ...formData, locationin: e.target.value })
          }
          required
        />

        <Label>City</Label>
        <Input
          type="text"
          value={formData.cityin}
          onChange={(e) => setFormData({ ...formData, cityin: e.target.value })}
          required
        />

        <Label>Country</Label>
        <Input
          type="text"
          value={formData.countryin}
          onChange={(e) =>
            setFormData({ ...formData, countryin: e.target.value })
          }
          required
        />

        <Label>Category</Label>
        <Input
          type="text"
          value={formData.cat}
          onChange={(e) => setFormData({ ...formData, cat: e.target.value })}
          required
        />

        <Label>Title Tag</Label>
        <Input
          type="text"
          value={formData.titletag}
          onChange={(e) =>
            setFormData({ ...formData, titletag: e.target.value })
          }
        />

        <Label>Description Tag</Label>
        <Input
          type="text"
          value={formData.descriptiontag}
          onChange={(e) =>
            setFormData({ ...formData, descriptiontag: e.target.value })
          }
        />

        <Label>Keywords Tag</Label>
        <Input
          type="text"
          value={formData.keywordstag}
          onChange={(e) =>
            setFormData({ ...formData, keywordstag: e.target.value })
          }
        />

        <Label>Slug</Label>
        <Input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
        />

        <Label>Service Name</Label>
        <Input
          type="text"
          value={formData.servicename}
          onChange={(e) =>
            setFormData({ ...formData, servicename: e.target.value })
          }
          required
        />

        <Label>Description Post</Label>
        <Input
          type="text"
          value={formData.descpost}
          onChange={(e) =>
            setFormData({ ...formData, descpost: e.target.value })
          }
          required
        />

        <Label>Date</Label>
        <Input
          type="datetime-local"
          value={
            formData.date ? new Date(formData.date).toISOString().slice(0, 16) : ""
          }
          onChange={(e) =>
            setFormData({ ...formData, date: new Date(e.target.value).toISOString() })
          }
          required
        />
      </div>

      <div className="modal-action mt-4 flex justify-end gap-2">
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" onClick={() => setEditingPage(null)}>
          Cancel
        </Button>
      </div>
    </form>
  </div>
)}

      <Toaster />
    </div>
  );
}
