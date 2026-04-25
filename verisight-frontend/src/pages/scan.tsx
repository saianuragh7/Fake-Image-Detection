import { useRoute } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { useGetScan } from "@/api";
import { ScanResult } from "@/components/ScanResult";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ScanDetail() {
  const [, params] = useRoute("/scan/:id");
  const id = params?.id || "";
  
  const { data: scan, isLoading, isError } = useGetScan(id);

  return (
    <div className="min-h-screen text-foreground pt-24 pb-12 px-6">
      <Navbar />
      
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-6 -ml-3 text-muted-foreground hover:text-foreground">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Scan Report</h1>
          <p className="text-muted-foreground font-mono text-xs break-all">ID: {id}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border bg-card overflow-hidden sticky top-24">
              <div className="aspect-square bg-black/50 flex items-center justify-center p-4">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : scan ? (
                  <img src={scan.previewDataUrl} alt={scan.fileName} className="w-full h-full object-contain" />
                ) : null}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-12 w-3/4" />
                <div className="grid md:grid-cols-3 gap-6">
                  <Skeleton className="h-40 md:col-span-1" />
                  <Skeleton className="h-40 md:col-span-2" />
                </div>
                <Skeleton className="h-64" />
              </div>
            ) : isError || !scan ? (
              <div className="p-8 border border-destructive/20 bg-destructive/10 rounded-xl text-center">
                <h3 className="text-lg font-medium text-destructive mb-2">Scan Not Found</h3>
                <p className="text-muted-foreground">The scan record you are looking for does not exist or has been removed.</p>
              </div>
            ) : (
              <ScanResult scan={scan} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
