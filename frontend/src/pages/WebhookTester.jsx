import { useState } from "react";
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

  const handleSend = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch("/api/it/webhook-tester", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, method, body }),
      });
      const respBody = await res.text();
      const headers = Object.fromEntries(res.headers.entries());
      setResponse({
        status: res.status,
        headers,
        body: respBody,
      });
    } catch (error) {
      setResponse({
        status: "Error",
        headers: {},
        body: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="space-y-6">
      <CardHeader>
        <CardTitle>Webhook Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">URL</label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/api" />
          </div>
          <div>
            <label className="text-sm font-medium">Method</label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Request Body</label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='{"key":"value"}'
            className="min-h-[120px]"
          />
        </div>
        <Button onClick={handleSend} disabled={!url || loading}>
          {loading ? "Sending..." : "Send"}
        </Button>
        {response && (
          <div className="space-y-3 rounded-lg border border-border bg-slate-50 p-4">
            <div className="text-sm font-semibold">Status</div>
            <div className="rounded-md bg-white p-3 text-sm">{response.status}</div>
            <div className="text-sm font-semibold">Headers</div>
            <div className="rounded-md bg-white p-3 text-sm">
              <pre>{JSON.stringify(response.headers, null, 2)}</pre>
            </div>
            <div className="text-sm font-semibold">Response Body</div>
            <div className="rounded-md bg-slate-950 p-3 text-sm text-slate-100">
              <pre className="whitespace-pre-wrap">{response.body}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}