"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [duplicates, setDuplicates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;

    if (selectedFile?.type !== "text/csv") {
      setMessage("Please upload a valid CSV file.");
      return;
    }

    setFile(selectedFile);
    setMessage("");
    setDuplicates([]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setMessage("Please select a CSV file to upload.");
      return;
    }

    setIsLoading(true);
    setMessage("");
    setDuplicates([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message || "Import successful.");
        setDuplicates(result.duplicates || []);
      } else {
        setMessage(result.error || "Failed to import.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("An error occurred while uploading.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Import Pages</h1>

      <Input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4"
      />

      <Button onClick={handleFileUpload} className="w-full" disabled={isLoading}>
        {isLoading ? "Uploading..." : "Import CSV"}
      </Button>

      {message && (
        <div className="mt-4 text-sm text-center">
          <p>{message}</p>
          {duplicates.length > 0 && (
            <ul className="mt-2 text-red-600 list-disc list-inside">
              {duplicates.map((dup, index) => (
                <li key={index}>{dup}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
