import { useRef, useCallback, useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { Bold, Italic, Underline, Link, List, ListOrdered, Strikethrough } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

const ToolbarButton = ({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`p-1.5 rounded transition-colors duration-150 ${
      active
        ? "bg-accent text-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
    }`}
  >
    {children}
  </button>
);

const RichTextEditor = ({ value, onChange, rows = 4 }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const savedSelectionRef = useRef<Range | null>(null);

  // Set initial content only once to avoid cursor/text issues
  useEffect(() => {
    if (editorRef.current && !initializedRef.current) {
      editorRef.current.innerHTML = value;
      initializedRef.current = true;
    }
  }, []);

  const execCommand = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(DOMPurify.sanitize(editorRef.current.innerHTML));
    }
  }, [onChange]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && savedSelectionRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  }, []);

  const handleLink = useCallback(() => {
    saveSelection();
    setLinkUrl("");
    setLinkDialogOpen(true);
  }, [saveSelection]);

  const handleLinkInsert = useCallback(() => {
    setLinkDialogOpen(false);
    if (linkUrl) {
      // Restore selection before applying link
      restoreSelection();
      // Small delay to ensure focus is back
      setTimeout(() => {
        editorRef.current?.focus();
        restoreSelection();
        document.execCommand("createLink", false, linkUrl);
        if (editorRef.current) {
          onChange(DOMPurify.sanitize(editorRef.current.innerHTML));
        }
      }, 0);
    }
  }, [linkUrl, restoreSelection, onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(DOMPurify.sanitize(editorRef.current.innerHTML));
    }
  }, [onChange]);

  return (
    <>
      <div className="border border-input rounded-md overflow-hidden">
        <div className="flex items-center gap-0.5 p-2 border-b border-input bg-muted/30">
          <span className="text-xs text-muted-foreground px-2 mr-1 select-none">Normal</span>
          <div className="w-px h-4 bg-border mx-1" />
          <ToolbarButton onClick={() => execCommand("bold")} title="Bold">
            <Bold className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("italic")} title="Italic">
            <Italic className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("underline")} title="Underline">
            <Underline className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("strikeThrough")} title="Strikethrough">
            <Strikethrough className="w-3.5 h-3.5" />
          </ToolbarButton>
          <div className="w-px h-4 bg-border mx-1" />
          <ToolbarButton onClick={handleLink} title="Insert Link">
            <Link className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("insertUnorderedList")} title="Bullet List">
            <List className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("insertOrderedList")} title="Numbered List">
            <ListOrdered className="w-3.5 h-3.5" />
          </ToolbarButton>
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="rich-text px-3 py-2 bg-background text-sm focus:outline-none min-h-[80px] max-h-[200px] overflow-y-auto"
          style={{ minHeight: `${rows * 24}px` }}
        />
      </div>

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Enter URL</label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLinkInsert();
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleLinkInsert} disabled={!linkUrl.trim()}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RichTextEditor;
