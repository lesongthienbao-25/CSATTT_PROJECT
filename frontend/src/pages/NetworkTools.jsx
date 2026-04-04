import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function NetworkTools() {
  const [target, setTarget] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePing = async () => {
    setLoading(true);
    setOutput("");
    try {
      const res = await fetch("/api/it/network/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: target, count: 4 }),
      });
      const data = await res.json();
      setOutput(data.stdout ?? JSON.stringify(data, null, 2));
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="space-y-6">
      <CardHeader>
        <CardTitle>Network Ping Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">IP / Hostname</label>
          <Input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="e.g. 192.168.1.1 or example.com"
          />
        </div>
        <Button onClick={handlePing} disabled={loading || !target}>
          {loading ? "Pinging..." : "Ping"}
        </Button>
        <div>
          <p className="mb-2 text-sm font-medium">Terminal Output</p>
          <div className="rounded-lg bg-slate-950 p-4 text-emerald-400 font-mono text-sm min-h-[200px]">
            <pre className="whitespace-pre-wrap">{output || "Awaiting ping result..."}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}