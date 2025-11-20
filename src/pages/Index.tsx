import { useState, useRef } from "react";
import { Canvas as FabricCanvas, FabricImage } from "fabric";
import { Toolbar } from "@/components/PDFEditor/Toolbar";
import { FileUpload } from "@/components/PDFEditor/FileUpload";
import { PDFCanvas } from "@/components/PDFEditor/PDFCanvas";
import { SignaturePanel } from "@/components/PDFEditor/SignaturePanel";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [activeTool, setActiveTool] = useState("select");
  const [zoom, setZoom] = useState(1);
  const [showSignaturePanel, setShowSignaturePanel] = useState(false);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    toast.success("PDF loaded! Start editing.");
  };

  const handleToolChange = (tool: string) => {
    if (tool === "signature") {
      setShowSignaturePanel(true);
    } else if (tool === "image") {
      fileInputRef.current?.click();
    } else {
      setActiveTool(tool);
      setShowSignaturePanel(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageFile = e.target.files?.[0];
    if (!imageFile || !fabricCanvasRef.current) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      FabricImage.fromURL(imgUrl).then((img) => {
        img.scale(0.3);
        img.set({
          left: 100,
          top: 100,
        });
        fabricCanvasRef.current?.add(img);
        fabricCanvasRef.current?.renderAll();
        toast.success("Image added!");
      });
    };
    reader.readAsDataURL(imageFile);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleDownload = () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const dataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
    });

    const pdf = new jsPDF({
      orientation: canvas.width! > canvas.height! ? "landscape" : "portrait",
      unit: "px",
      format: [canvas.width!, canvas.height!],
    });

    pdf.addImage(dataUrl, "PNG", 0, 0, canvas.width!, canvas.height!);
    pdf.save("edited-document.pdf");
    toast.success("PDF downloaded!");
  };

  const handleClear = () => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();
    
    objects.forEach((obj) => {
      if (obj !== canvas.backgroundImage) {
        canvas.remove(obj);
      }
    });
    
    canvas.renderAll();
    toast.success("Canvas cleared!");
  };

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileSelect(file);
    };
    input.click();
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Toolbar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onDownload={handleDownload}
        onClear={handleClear}
        onUpload={handleUpload}
        hasDocument={!!file}
      />

      <div className="flex-1 relative overflow-hidden">
        {!file ? (
          <div className="h-full flex items-center justify-center p-8">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 text-foreground">
                  PDF Editor
                </h1>
                <p className="text-muted-foreground">
                  Upload, edit, sign, and download your PDF documents
                </p>
              </div>
              <FileUpload onFileSelect={handleFileSelect} />
            </div>
          </div>
        ) : (
          <>
            <PDFCanvas
              file={file}
              activeTool={activeTool}
              zoom={zoom}
              onCanvasReady={(canvas) => {
                fabricCanvasRef.current = canvas;
              }}
            />
            {showSignaturePanel && (
              <SignaturePanel
                canvas={fabricCanvasRef.current}
                onClose={() => setShowSignaturePanel(false)}
              />
            )}
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};

export default Index;
