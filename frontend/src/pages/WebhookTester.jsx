import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WebhookTester() {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);

  const handleSend = async () => {
    if (!url.trim()) {
      setResponse({ error: "URL is required" });
      return;
    }

    setLoading(true);
    setResponse(null);
    try {
      const { data } = await axios.post("/api/it/webhook-tester", {
        url: url.trim(),
        method: method.toUpperCase(),
        body: body.trim(),
      });
      setResponse(data);
    } catch (error) {
      const message =
        error?.response?.data?.detail || error.message || "Request failed";
      setResponse({ error: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="space-y-6">
      <CardHeader>
        <CardTitle>Webhook Tester</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Test external webhooks and APIs. Make requests to verify integrations.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium block mb-2">URL</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/api/webhook"
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Method</label>
            <Select value={method} onValueChange={setMethod} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Request Body (Optional)</label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='{"key":"value"}'
            className="min-h-[100px] font-mono text-sm"
            disabled={loading}
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={!url.trim() || loading}
          className="w-full"
        >
          {loading ? "Sending..." : "Send Request"}
        </Button>

        {response && (
          <div className="space-y-3 rounded-lg border border-border bg-slate-50 p-4">
            {response.error ? (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <div className="text-sm font-semibold text-red-800">Error</div>
                <div className="text-sm text-red-700 mt-1">{response.error}</div>
              </div>
            ) : (
              <>
                <div>
                  <div className="text-sm font-semibold mb-2">Status Code</div>
                  <div
                    className={`rounded-md p-3 text-sm font-mono ${
                      response.status_code >= 200 && response.status_code < 300
                        ? "bg-green-50 text-green-800"
                        : response.status_code >= 400
                        ? "bg-red-50 text-red-800"
                        : "bg-white text-gray-900"
                    }`}
                  >
                    {response.status_code}
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setShowHeaders(!showHeaders)}
                    className="text-sm font-semibold mb-2 hover:underline"
                  >
                    {showHeaders ? "▼" : "▶"} Response Headers
                  </button>
                  {showHeaders && (
                    <div className="rounded-md bg-white p-3 text-sm font-mono overflow-auto max-h-[200px]">
                      <pre className="text-xs">{JSON.stringify(response.headers, null, 2)}</pre>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">Response Body</div>
                  <div className="rounded-md bg-slate-950 p-3 text-sm text-slate-100 font-mono overflow-auto max-h-[300px]">
                    <pre className="whitespace-pre-wrap text-xs">{response.body}</pre>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
