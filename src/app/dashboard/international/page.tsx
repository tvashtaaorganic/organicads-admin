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

const fetchPages = async (page = 0, searchQuery = "", descpost = "international") => {
  try {
    const url = new URL("/api/pages", window.location.origin);
    url.searchParams.append("page", page);
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
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [editingPage, setEditingPage] = useState(null);
  const [formData, setFormData] = useState({
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


const formatDate = (isoString) => {
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
      const sortedItems = (result.items || []).sort((a, b) => new Date(b.date) - new Date(a.date));
setData(sortedItems);

      setTotalPages(result.totalPages || 0);
    };
    loadData();
  }, [pageIndex, searchQuery]);


  
const handleEdit = (page) => {
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
  } catch (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }
};

const handleDelete = async (id) => {
  const confirmed = window.confirm("Are you sure you want to delete this page?");
  if (!confirmed) return;  // User clicked Cancel, so stop here

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
  } catch (error) {
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
      cell: ({ row }) => (
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
    { accessorKey: "date", 
  header: "Date", 
  cell: ({ row }) => formatDate(row.original.date)  },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
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
      <h1 className="text-xl font-bold mb-4">International Pages</h1>

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
                  <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
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
  <Button variant="outline" size="sm" onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))} disabled={pageIndex === 0}>
    Previous
  </Button>
  <div className="flex space-x-1 overflow-x-auto items-center">
    {(() => {
      const pages = [];
      const showRange = 2; // how many pages to show around current
      const start = Math.max(0, pageIndex - showRange);
      const end = Math.min(totalPages - 1, pageIndex + showRange);

      if (start > 0) {
        pages.push(
          <Button key={0} variant={pageIndex === 0 ? "default" : "outline"} size="sm" onClick={() => setPageIndex(0)}>
            1
          </Button>
        );
        if (start > 1) {
          pages.push(<span key="start-ellipsis" className="px-2">...</span>);
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(
          <Button key={i} variant={pageIndex === i ? "default" : "outline"} size="sm" onClick={() => setPageIndex(i)}>
            {i + 1}
          </Button>
        );
      }

      if (end < totalPages - 1) {
        if (end < totalPages - 2) {
          pages.push(<span key="end-ellipsis" className="px-2">...</span>);
        }
        pages.push(
          <Button key={totalPages - 1} variant={pageIndex === totalPages - 1 ? "default" : "outline"} size="sm" onClick={() => setPageIndex(totalPages - 1)}>
            {totalPages}
          </Button>
        );
      }

      return pages;
    })()}
  </div>
  <Button variant="outline" size="sm" onClick={() => setPageIndex((prev) => Math.min(prev + 1, totalPages - 1))} disabled={pageIndex === totalPages - 1}>
    Next
  </Button>
  <Button variant="outline" size="sm" onClick={() => setPageIndex(totalPages - 1)} disabled={pageIndex === totalPages - 1}>
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
              {[
                { label: "Name", key: "name" },
                { label: "Location", key: "locationin" },
                { label: "City", key: "cityin" },
                { label: "Country", key: "countryin" },
                { label: "Desc Post", key: "descpost" },
                { label: "Category", key: "cat" },
                { label: "Title Tag", key: "titletag" },
                { label: "Description Tag", key: "descriptiontag" },
                { label: "Keywords Tag", key: "keywordstag" },
                { label: "Slug", key: "slug" },
                { label: "Service Name", key: "servicename" },
                { label: "Date", key: "date" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    value={formData[key] || ""}
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
