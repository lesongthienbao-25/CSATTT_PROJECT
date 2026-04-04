import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function ReportGenerator() {
  const [template, setTemplate] = useState("Xin chào {{name}}");
  const [context, setContext] = useState('{"name":"NexTrade"}');
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/it/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template, context }),
      });
      const data = await res.json();
      setResult(data.rendered ?? JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="space-y-6">
      <CardHeader>
        <CardTitle>Report Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Template</label>
          <Textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            placeholder="Xin chào {{name}}"
            className="min-h-[180px]"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Context (JSON)</label>
          <Textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder='{"name":"NexTrade"}'
            className="min-h-[120px]"
          />
        </div>
        <Button onClick={handleGenerate} disabled={!template || loading}>
          {loading ? "Generating..." : "Generate"}
        </Button>
        <div>
          <p className="mb-2 text-sm font-medium">Rendered Output</p>
          <div className="rounded-lg border border-border bg-slate-950 p-4 text-slate-100 font-mono text-sm">
            <pre className="whitespace-pre-wrap">{result || "Your rendered report will appear here."}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}