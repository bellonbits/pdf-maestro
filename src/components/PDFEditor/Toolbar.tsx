import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Type, 
  Image as ImageIcon, 
  PenTool, 
  Highlighter,
  Trash2,
  Download,
  ZoomIn,
  ZoomOut,
  Upload,
  ChevronDown,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onDownload: (format?: "pdf" | "word" | "ppt") => void;
  onClear: () => void;
  onUpload: () => void;
  hasDocument: boolean;
}

export const Toolbar = ({
  activeTool,
  onToolChange,
  onZoomIn,
  onZoomOut,
  onDownload,
  onClear,
  onUpload,
  hasDocument
}: ToolbarProps) => {
  const tools = [
    { id: "select", icon: FileText, label: "Select" },
    { id: "text", icon: Type, label: "Text" },
    { id: "image", icon: ImageIcon, label: "Image" },
    { id: "signature", icon: PenTool, label: "Signature" },
    { id: "draw", icon: Highlighter, label: "Draw" },
  ];

  return (
    <div className="flex items-center gap-2 p-4 bg-toolbar border-b border-toolbar-border shadow-md">
      <Button
        variant="default"
        size="sm"
        onClick={onUpload}
        className="gap-2"
      >
        <Upload className="w-4 h-4" />
        Upload PDF
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex gap-1">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={activeTool === tool.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onToolChange(tool.id)}
            disabled={!hasDocument}
            className="gap-2"
            title={tool.label}
          >
            <tool.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tool.label}</span>
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomOut}
          disabled={!hasDocument}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomIn}
          disabled={!hasDocument}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>

      <div className="ml-auto flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={!hasDocument}
          className="gap-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              size="sm"
              disabled={!hasDocument}
              className="gap-2 bg-success hover:bg-success/90"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onDownload("pdf")}>
              Download as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload("word")}>
              Download as Word
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload("ppt")}>
              Download as PowerPoint
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
