import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Wrench, ShieldCheck } from 'lucide-react';
import WebhookTesterTool from './WebhookTesterTool';
import NetworkDiagnosticsTool from './NetworkDiagnosticsTool';
import ReportGeneratorTool from './ReportGeneratorTool';

export default function ITToolsPage() {
  const [activeTab, setActiveTab] = useState('webhook');

  return (
    <div style={{ padding: '20px', background: '#f0f2f5', fontFamily: 'sans-serif', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <Link to="/products" style={{ color: '#001f3f', textDecoration: 'none', fontSize: '14px' }}>
          ← Back to Products
        </Link>
        <h1 style={{ color: '#001f3f', marginTop: '10px', marginBottom: '5px' }}>IT Tools & Diagnostics</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>Advanced testing, monitoring, and automation utilities for IT administrators</p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <Link
          to="/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#001f3f',
            color: 'white',
            padding: '10px 18px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          <Package size={16} />
          Products
        </Link>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#e7e7e7',
            color: '#001f3f',
            padding: '10px 18px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          <Wrench size={16} />
          IT Tools
        </div>
        <Link
          to="/hr"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#e7e7e7',
            color: '#001f3f',
            padding: '10px 18px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          <ShieldCheck size={16} />
          HR Portal
        </Link>
      </div>

      <div style={{ background: 'white', borderRadius: '0 8px 8px 8px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('webhook')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'webhook' ? '#001f3f' : '#f2f5f9',
              color: activeTab === 'webhook' ? 'white' : '#001f3f',
              border: '1px solid #d6dce6',
              borderRadius: '999px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === 'webhook' ? '700' : '500',
            }}
          >
            🔗 Webhook Tester
          </button>
          <button
            onClick={() => setActiveTab('network')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'network' ? '#001f3f' : '#f2f5f9',
              color: activeTab === 'network' ? 'white' : '#001f3f',
              border: '1px solid #d6dce6',
              borderRadius: '999px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === 'network' ? '700' : '500',
            }}
          >
            🌐 Network Diagnostics
          </button>
          <button
            onClick={() => setActiveTab('report')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'report' ? '#001f3f' : '#f2f5f9',
              color: activeTab === 'report' ? 'white' : '#001f3f',
              border: '1px solid #d6dce6',
              borderRadius: '999px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === 'report' ? '700' : '500',
            }}
          >
            📊 Report Generator
          </button>
        </div>

        {activeTab === 'webhook' && <WebhookTesterTool />}
        {activeTab === 'network' && <NetworkDiagnosticsTool />}
        {activeTab === 'report' && <ReportGeneratorTool />}
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', color: '#856404' }}>
        <strong>⚠️ Security Notice</strong>
        <p style={{ margin: '5px 0 0 0', fontSize: '13px' }}>
          These tools are for authorized security testing and IT administration only. Unauthorized use of these tools on systems you don't own or have permission to test is illegal. Use responsibly and only on systems within your organization's scope.
        </p>
      </div>
    </div>
  );
}
