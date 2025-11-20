import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg transition-all cursor-pointer",
        isDragActive
          ? "border-primary bg-primary/5 scale-105"
          : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        {isDragActive ? (
          <>
            <FileUp className="w-16 h-16 text-primary animate-bounce" />
            <div>
              <p className="text-lg font-semibold text-primary">Drop your PDF here</p>
              <p className="text-sm text-muted-foreground mt-1">Release to upload</p>
            </div>
          </>
        ) : (
          <>
            <File className="w-16 h-16 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold text-foreground">
                Drag & drop your PDF here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse files
              </p>
            </div>
            <div className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
              Choose PDF File
            </div>
          </>
        )}
      </div>
    </div>
  );
};
