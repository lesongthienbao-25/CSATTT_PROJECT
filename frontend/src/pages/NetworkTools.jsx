import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function NetworkTools() {
  const [target, setTarget] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [command, setCommand] = useState("");

  const handlePing = async () => {
    if (!target.trim()) {
      setOutput("Error: Target IP or hostname is required");
      return;
    }

    setLoading(true);
    setOutput("");
    setCommand("");
    try {
      const { data } = await axios.post("/api/it/network/ping", {
        target: target.trim(),
      });

      setCommand(data.command || "");
      setOutput(data.output || "No output returned.");
    } catch (error) {
      const message =
        error?.response?.data?.detail || error.message || "Request failed";
      setOutput(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handlePing();
    }
  };

  return (
    <Card className="space-y-6">
      <CardHeader>
        <CardTitle>Network Tools — Ping Diagnostic</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Diagnose network connectivity to internal and external hosts.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium block mb-2">IP / Hostname</label>
            <Input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g. 192.168.1.1 or backend.local"
              disabled={loading}
            />
          </div>
        </div>

        <Button
          onClick={handlePing}
          disabled={loading || !target.trim()}
          className="w-full"
        >
          {loading ? "Pinging..." : "Execute Ping"}
        </Button>

        {command && (
          <div className="rounded-lg bg-slate-900 p-3 text-slate-300 font-mono text-sm">
            <div className="text-slate-400">$ {command}</div>
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-medium">Terminal Output</p>
          <div className="rounded-lg bg-slate-950 p-4 text-emerald-400 font-mono text-sm min-h-[320px] border border-slate-700 overflow-auto">
            <pre className="whitespace-pre-wrap text-xs">
              {output || "Awaiting ping result...\n\nTip: This lab tool is intentionally vulnerable to command injection; try payloads like 8.8.8.8; whoami"}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
