import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background noise-bg text-foreground">
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500 max-w-md px-6">
        <AlertCircle className="w-20 h-20 text-destructive mx-auto opacity-80" />
        <h1 className="text-5xl font-bold tracking-tighter">404</h1>
        <p className="text-lg text-muted-foreground">
          The page or record you are looking for cannot be found in our database.
        </p>
        <Button asChild size="lg" className="mt-4 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}