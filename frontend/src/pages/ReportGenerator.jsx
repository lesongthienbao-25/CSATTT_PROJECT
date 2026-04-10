import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function ReportGenerator() {
  const [template, setTemplate] = useState("Xin chào {{name}}!");
  const [context, setContext] = useState('{"name":"NexTrade"}');
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!template.trim()) {
      setError("Template is required");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    let contextObj = {};
    if (context.trim()) {
      try {
        contextObj = JSON.parse(context);
      } catch (err) {
        setError(`Invalid JSON in Context: ${err.message}`);
        setLoading(false);
        return;
      }
    }

    try {
      const { data } = await axios.post("/api/it/reports/generate", {
        template: template.trim(),
        context: contextObj,
      });
      setResult(data.rendered || "");
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || "Request failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="space-y-6">
      <CardHeader>
        <CardTitle>Report Generator</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Generate dynamic reports using Jinja2 templates.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Input */}
        <div>
          <label className="text-sm font-medium block mb-2">Template</label>
          <Textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            placeholder={"Xin chào {{name}}!\n\nProfit: {{profit}}\nStatus: {% if active %}Active{% else %}Inactive{% endif %}"}
            className="min-h-[180px] font-mono text-sm"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use Jinja2 syntax: {"{{"}} variable {{"}}"}}, {"{%"}} if/for {"%{"}}, etc.
          </p>
        </div>

        {/* Context Input */}
        <div>
          <label className="text-sm font-medium block mb-2">Context (JSON)</label>
          <Textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={'{"name":"NexTrade","profit":50000,"active":true}'}
            className="min-h-[120px] font-mono text-sm"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Valid JSON object. Leave empty for no variables.
          </p>
        </div>

        {/* Generate Button */}
        <Button onClick={handleGenerate} disabled={!template.trim() || loading} className="w-full">
          {loading ? "Generating..." : "Generate Report"}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="text-sm font-semibold text-red-800 mb-1">Error</div>
            <div className="text-sm text-red-700 font-mono whitespace-pre-wrap">{error}</div>
          </div>
        )}

        {/* Result Display */}
        <div>
          <p className="mb-2 text-sm font-medium">Rendered Output</p>
          <div className="rounded-lg border border-border bg-slate-950 p-4 text-slate-100 font-mono text-sm min-h-[200px] overflow-auto">
            <pre className="whitespace-pre-wrap text-xs">
              {result || "Your rendered report will appear here..."}
            </pre>
          </div>
        </div>

        {/* Quick Test Buttons */}
        <div className="border-t pt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Quick Tests:</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setTemplate("{{7*7}}");
                setContext("{}");
              }}
              className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-100 transition"
            >
              Test: Math ({{7*7}})
            </button>
            <button
              onClick={() => {
                setTemplate(
                  "{% for item in items %}• {{item}}\n{% endfor %}"
                );
                setContext('{"items":["apple","banana","cherry"]}');
              }}
              className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-100 transition"
            >
              Test: Loop
            </button>
            <button
              onClick={() => {
                setTemplate(
                  "Welcome {{name}}!\nBalance: ${{balance}}"
                );
                setContext('{"name":"Admin","balance":"1000000"}');
              }}
              className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-100 transition"
            >
              Test: Variables
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
