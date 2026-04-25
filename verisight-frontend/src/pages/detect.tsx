import { useState, useRef, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, X, Scan as ScanIcon, Image as ImageIcon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalyzeImage } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { ScanResult } from "@/components/ScanResult";
import { getListScansQueryKey, getGetStatsQueryKey, getGetStatsTimeseriesQueryKey, getGetConfidenceDistributionQueryKey } from "@/api";

export default function Detect() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const queryClient = useQueryClient();
  const analyzeMutation = useAnalyzeImage();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
        setPreviewUrl(URL.createObjectURL(droppedFile));
        analyzeMutation.reset();
      }
    }
  }, [analyzeMutation]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      analyzeMutation.reset();
    }
  }, [analyzeMutation]);

  const handleAnalyze = () => {
    if (!file) return;
    
    analyzeMutation.mutate(
      { data: { image: file } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListScansQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsTimeseriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetConfidenceDistributionQueryKey() });
        }
      }
    );
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    analyzeMutation.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen text-foreground pt-24 pb-12 px-6">
      <Navbar />
      
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Detection Workspace</h1>
          <p className="text-muted-foreground">Upload an image to verify its authenticity using our forensic models.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload / Preview Area */}
          <div className="space-y-6">
            {!file ? (
              <div 
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[400px] ${
                  dragActive ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50 hover:bg-secondary/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
                  <UploadCloud className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Drag & Drop Image</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                  Supports PNG, JPG, JPEG, WEBP. Maximum file size 10MB.
                </p>
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="border-primary/20 hover:bg-primary/10">
                  Browse Files
                </Button>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-border bg-card">
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  <Button size="icon" variant="destructive" className="w-8 h-8 rounded-full opacity-80 hover:opacity-100" onClick={clearFile}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="relative aspect-square md:aspect-auto md:h-[450px] w-full bg-black/50 flex items-center justify-center overflow-hidden">
                  {previewUrl && (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="object-contain w-full h-full max-h-full"
                    />
                  )}
                  
                  {analyzeMutation.isPending && (
                    <>
                      <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px] z-10" />
                      <motion.div 
                        className="absolute left-0 w-full h-1 bg-primary z-20 shadow-[0_0_15px_rgba(0,255,255,0.8)]"
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                      />
                      <div className="absolute z-30 flex flex-col items-center text-primary font-mono text-sm tracking-widest bg-background/80 px-4 py-2 rounded-full border border-primary/30">
                        <ScanIcon className="w-5 h-5 mb-2 animate-pulse" />
                        ANALYZING PIXELS...
                      </div>
                    </>
                  )}
                </div>
                
                <div className="p-4 border-t border-border bg-secondary/30 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <ImageIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{file.name}</span>
                  </div>
                  {!analyzeMutation.isPending && !analyzeMutation.isSuccess && (
                    <Button onClick={handleAnalyze} className="shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                      Analyze Image
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Results Area */}
          <div>
            <AnimatePresence mode="wait">
              {analyzeMutation.isPending ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 min-h-[400px]"
                >
                  <div className="w-16 h-16 relative">
                    <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
                    <div className="absolute inset-2 rounded-full border-b-2 border-primary/50 animate-spin animation-delay-150" />
                  </div>
                  <p className="font-mono text-sm uppercase tracking-widest">Extracting Features</p>
                </motion.div>
              ) : analyzeMutation.isSuccess && analyzeMutation.data ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="h-full"
                >
                  <ScanResult scan={analyzeMutation.data} />
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl p-8 min-h-[400px] bg-card/20"
                >
                  <ShieldCheck className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-center max-w-sm">
                    Awaiting image upload. Results and forensic breakdown will appear here.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}