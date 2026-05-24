import React from 'react';
import PipelineBoard from './PipelineBoard';
import LeadTable from './LeadTable';
import SignalRConsole from './SignalRConsole';
import LeadModal from './LeadModal';
import ToastContainer from './ToastContainer';

interface LeadManagerProps {
  onNotify: (message: string, type: 'success' | 'info' | 'warning') => void;
}

export default function LeadManager({ onNotify }: LeadManagerProps) {
  return (
    <div id="lead-manager-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* Left Side: Analytics Board & Data Table */}
      <div id="crm-workspace" className="lg:col-span-2 space-y-6">
        <PipelineBoard />
        <LeadTable />
      </div>

      {/* Right Side: WebSockets Diagnostics Terminal */}
      <SignalRConsole />

      {/* Floating overlays & status selectors */}
      <LeadModal />
      <ToastContainer />
    </div>
  );
}
