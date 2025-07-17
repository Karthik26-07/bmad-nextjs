"use client";

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function DocumentManagementPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const fetchDocuments = async () => {
        const response = await fetch(`/api/documents?userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          setDocuments(data || []);
        } else {
          toast({
            title: "Error fetching documents",
            description: "Could not fetch documents.",
            variant: "destructive",
          });
          setDocuments([]);
        }
        setLoading(false);
      };
      fetchDocuments();
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  const handleFileUpload = async () => {
    if (!file || !session?.user?.id) {
      toast({
        title: "Error",
        description: "Please select a file and ensure you are logged in.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', session.user.id);
    formData.append('description', description);

    const uploadResponse = await fetch("/api/upload/document", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      toast({
        title: "Error uploading file",
        description: errorData.message || "Could not upload file.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Document uploaded successfully.",
      });
      setFile(null);
      setDescription("");
      // Refresh documents list
      const response = await fetch(`/api/documents?userId=${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    }
    setUploading(false);
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    const response = await fetch(`/api/documents/download/${fileId}`);
    if (!response.ok) {
      const errorData = await response.json();
      toast({
        title: "Error downloading file",
        description: errorData.message || "Could not download file.",
        variant: "destructive",
      });
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (loading || status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session || !session.user) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Document Management</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
        <div className="flex flex-col gap-4">
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          />
          <Input
            placeholder="Document Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={handleFileUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Document"}
          </Button>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">My Documents</h2>
      {documents.length === 0 && (
        <div className="text-center text-gray-500">No documents found.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <div key={doc._id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold">{doc.fileName}</h3>
            <p className="text-gray-600">{doc.description}</p>
            <p className="text-gray-600 text-sm">Size: {(doc.fileSize / 1024 / 1024).toFixed(2)} MB</p>
            <p className="text-gray-600 text-sm">Type: {doc.fileType}</p>
            <p className="text-gray-600 text-sm">Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</p>
            <Button onClick={() => handleDownload(doc._id, doc.fileName)} className="mt-4 w-full">
              Download
            </Button>
            {/* Add share/delete options */}
          </div>
        ))}
      </div>
    </div>
  );
}
