import { Navbar } from "@/components/layout/Navbar";
import { useGetStats, useGetStatsTimeseries, useGetConfidenceDistribution, useListScans } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, ShieldCheck, AlertTriangle, Target, Clock } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: timeseries, isLoading: timeseriesLoading } = useGetStatsTimeseries({ days: 30 });
  const { data: distribution, isLoading: distributionLoading } = useGetConfidenceDistribution();
  const { data: scans, isLoading: scansLoading } = useListScans({ limit: 20 });

  return (
    <div className="min-h-screen text-foreground pt-24 pb-12 px-6">
      <Navbar />
      
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Global platform statistics and recent detection history.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatCard 
            title="Total Scans" 
            value={stats?.totalScans} 
            loading={statsLoading} 
            icon={<Activity className="w-4 h-4 text-primary" />}
          />
          <StatCard 
            title="Model Accuracy" 
            value={stats ? `${stats.accuracy}%` : undefined} 
            loading={statsLoading}
            icon={<Target className="w-4 h-4 text-primary" />}
          />
          <StatCard 
            title="Authentic Images" 
            value={stats?.realCount} 
            loading={statsLoading}
            icon={<ShieldCheck className="w-4 h-4 text-primary" />}
          />
          <StatCard 
            title="Manipulated / AI" 
            value={stats?.fakeCount} 
            loading={statsLoading}
            icon={<AlertTriangle className="w-4 h-4 text-destructive" />}
          />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Detection Volume (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {timeseriesLoading ? (
                  <Skeleton className="w-full h-full rounded-md" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeseries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorFake" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => format(new Date(val), "MMM d")} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                        itemStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Area type="monotone" dataKey="real" name="Authentic" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorReal)" />
                      <Area type="monotone" dataKey="fake" name="Manipulated" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorFake)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Confidence Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {distributionLoading ? (
                  <Skeleton className="w-full h-full rounded-md" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="bucket" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{ fill: "hsl(var(--secondary))" }}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                      />
                      <Bar dataKey="count" name="Scans" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History Table */}
        <Card className="glass-card overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">Recent Detections</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Image</th>
                  <th className="px-6 py-4 font-medium">File Name</th>
                  <th className="px-6 py-4 font-medium">Verdict</th>
                  <th className="px-6 py-4 font-medium">Confidence</th>
                  <th className="px-6 py-4 font-medium">Time</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scansLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="w-12 h-12 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="w-32 h-4" /></td>
                      <td className="px-6 py-4"><Skeleton className="w-20 h-6 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="w-16 h-4" /></td>
                      <td className="px-6 py-4"><Skeleton className="w-24 h-4" /></td>
                      <td className="px-6 py-4"><Skeleton className="w-16 h-8 ml-auto" /></td>
                    </tr>
                  ))
                ) : scans?.map((scan) => (
                  <tr key={scan.id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="w-12 h-12 rounded bg-black border border-border overflow-hidden">
                        <img src={scan.previewDataUrl} alt={scan.fileName} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-3 font-medium text-foreground truncate max-w-[200px]">
                      {scan.fileName}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={scan.verdict === 'fake' ? 'destructive' : 'default'} className="uppercase text-[10px] tracking-wider">
                        {scan.verdict === 'fake' ? 'AI/Fake' : 'Authentic'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 font-mono">
                      {scan.confidence.toFixed(1)}%
                    </td>
                    <td className="px-6 py-3 text-muted-foreground whitespace-nowrap">
                      {format(new Date(scan.createdAt), "MMM d, HH:mm")}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link href={`/scan/${scan.id}`} className="text-primary hover:underline text-sm font-medium">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, loading, icon }: { title: string, value?: string | number, loading: boolean, icon: React.ReactNode }) {
  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="p-2 bg-secondary rounded-md">{icon}</div>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-3xl font-bold tracking-tight">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}