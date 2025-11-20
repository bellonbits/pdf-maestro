import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Canvas as FabricCanvas, FabricImage, FabricText } from "fabric";
import { toast } from "sonner";

interface SignaturePanelProps {
  canvas: FabricCanvas | null;
  onClose: () => void;
}

export const SignaturePanel = ({ canvas, onClose }: SignaturePanelProps) => {
  const [drawnSignature, setDrawnSignature] = useState<string | null>(null);
  const [typedText, setTypedText] = useState("");
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      setDrawnSignature(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawnSignature(null);
  };

  const applyDrawnSignature = () => {
    if (!canvas || !drawnSignature) return;

    FabricImage.fromURL(drawnSignature).then((img) => {
      img.scale(0.5);
      img.set({
        left: 100,
        top: 100,
      });
      canvas.add(img);
      canvas.renderAll();
      toast.success("Signature added!");
      onClose();
    });
  };

  const applyTypedSignature = () => {
    if (!canvas || !typedText) return;

    const text = new FabricText(typedText, {
      left: 100,
      top: 100,
      fontSize: 32,
      fontFamily: "Brush Script MT, cursive",
      fill: "#000000",
    });
    canvas.add(text);
    canvas.renderAll();
    toast.success("Signature added!");
    onClose();
  };

  const uploadSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      FabricImage.fromURL(imgUrl).then((img) => {
        img.scale(0.3);
        img.set({
          left: 100,
          top: 100,
        });
        canvas.add(img);
        canvas.renderAll();
        toast.success("Signature uploaded!");
        onClose();
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="absolute top-20 right-4 w-80 p-4 shadow-xl z-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Add Signature</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕
        </Button>
      </div>

      <Tabs defaultValue="draw">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="draw">Draw</TabsTrigger>
          <TabsTrigger value="type">Type</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="space-y-4">
          <div className="border rounded-md bg-white">
            <canvas
              ref={signatureCanvasRef}
              width={280}
              height={120}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="cursor-crosshair"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearSignature} className="flex-1">
              Clear
            </Button>
            <Button size="sm" onClick={applyDrawnSignature} className="flex-1">
              Apply
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="type" className="space-y-4">
          <div>
            <Label htmlFor="signature-text">Your Name</Label>
            <Input
              id="signature-text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder="John Doe"
              className="font-serif text-lg"
            />
          </div>
          <Button size="sm" onClick={applyTypedSignature} className="w-full">
            Apply Signature
          </Button>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <div>
            <Label htmlFor="signature-upload">Upload Image</Label>
            <Input
              id="signature-upload"
              type="file"
              accept="image/*"
              onChange={uploadSignature}
            />
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
