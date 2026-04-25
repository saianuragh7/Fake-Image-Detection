import { Scan } from "@/api";
import { CheckCircle2, AlertTriangle, Clock, ShieldCheck, FileImage } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ScanResultProps {
  scan: Scan;
}

export function ScanResult({ scan }: ScanResultProps) {
  const isFake = scan.verdict === "fake";
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analysis Complete</h2>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <FileImage className="w-4 h-4" />
            {scan.fileName} • {(scan.fileSize / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{scan.processingMs}ms</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 glass-card border-primary/20 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 h-full ${isFake ? "bg-destructive" : "bg-primary"}`} />
          <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
            {isFake ? (
              <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
            ) : (
              <CheckCircle2 className="w-16 h-16 text-primary mb-4" />
            )}
            <Badge variant={isFake ? "destructive" : "default"} className="mb-2 text-sm px-3 py-1 uppercase tracking-wider">
              {isFake ? "AI Generated" : "Authentic"}
            </Badge>
            <div className="text-5xl font-bold mt-2 tracking-tighter">
              {scan.confidence.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground mt-2 uppercase tracking-widest">Confidence Score</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Probability Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-primary font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Authentic
                </span>
                <span>{scan.realProbability.toFixed(1)}%</span>
              </div>
              <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${scan.realProbability}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-destructive font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Manipulated / AI
                </span>
                <span>{scan.fakeProbability.toFixed(1)}%</span>
              </div>
              <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${scan.fakeProbability}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="h-full bg-destructive"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Forensic Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {scan.signals.map((signal, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="font-medium text-sm text-foreground">{signal.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{signal.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold">{signal.score.toFixed(0)}</span>
                    <span className="text-xs text-muted-foreground ml-1">/100</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${signal.score}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 + (idx * 0.1) }}
                    className={cn("h-full", signal.score > 70 ? "bg-destructive" : signal.score > 40 ? "bg-chart-3" : "bg-primary")}
                    style={{ opacity: 0.5 + (signal.weight * 0.5) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
