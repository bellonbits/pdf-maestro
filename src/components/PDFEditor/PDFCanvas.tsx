import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, FabricText, FabricImage, PencilBrush } from "fabric";
import * as pdfjsLib from "pdfjs-dist";
import { toast } from "sonner";

// Set up PDF.js worker for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

interface PDFCanvasProps {
  file: File | null;
  activeTool: string;
  zoom: number;
  onCanvasReady: (canvas: FabricCanvas) => void;
}

export const PDFCanvas = ({ file, activeTool, zoom, onCanvasReady }: PDFCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
    });

    fabricCanvasRef.current = canvas;
    onCanvasReady(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!file || !fabricCanvasRef.current) return;

    setIsLoading(true);
    const canvas = fabricCanvasRef.current;

    const loadPDF = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        // Calculate scale to fit screen while maintaining aspect ratio
        const originalViewport = page.getViewport({ scale: 1 });
        const maxWidth = window.innerWidth - 100;
        const maxHeight = window.innerHeight - 200;
        const scale = Math.min(
          maxWidth / originalViewport.width,
          maxHeight / originalViewport.height,
          2 // Max scale of 2x
        );

        const viewport = page.getViewport({ scale });
        const tempCanvas = document.createElement("canvas");
        const context = tempCanvas.getContext("2d");

        if (!context) return;

        tempCanvas.width = viewport.width;
        tempCanvas.height = viewport.height;

        const renderContext: any = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        // Extract text content for editing
        const textContent = await page.getTextContent();
        
        canvas.setDimensions({
          width: viewport.width,
          height: viewport.height,
        });

        FabricImage.fromURL(tempCanvas.toDataURL()).then((img) => {
          canvas.backgroundImage = img;
          
          // Add editable text layers
          textContent.items.forEach((item: any) => {
            const tx = pdfjsLib.Util.transform(
              viewport.transform,
              item.transform
            );
            
            const text = new FabricText(item.str, {
              left: tx[4],
              top: viewport.height - tx[5],
              fontSize: Math.abs(tx[3]),
              fill: "rgba(0, 0, 0, 0.8)",
              fontFamily: item.fontName || "Arial",
              selectable: true,
              editable: true,
            });
            canvas.add(text);
          });
          
          canvas.renderAll();
          toast.success("PDF loaded successfully!");
          setIsLoading(false);
        });
      } catch (error) {
        console.error("Error loading PDF:", error);
        toast.error("Failed to load PDF");
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [file]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = activeTool === "draw";

    if (activeTool === "draw") {
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvas.freeDrawingBrush.color = "#0EA5E9";
      canvas.freeDrawingBrush.width = 3;
    }

    if (activeTool === "text") {
      const text = new FabricText("Click to edit", {
        left: 100,
        top: 100,
        fontSize: 24,
        fill: "#000000",
        fontFamily: "Arial",
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
    }
  }, [activeTool]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.setZoom(zoom);
    canvas.renderAll();
  }, [zoom]);

  return (
    <div className="relative flex-1 overflow-auto bg-canvas p-8">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading PDF...</p>
          </div>
        </div>
      )}
      <div className="flex justify-center">
        <canvas ref={canvasRef} className="shadow-xl rounded-lg" />
      </div>
    </div>
  );
};
