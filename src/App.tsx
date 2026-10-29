/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Header } from './components/Header';
import { POSRegister } from './components/POSRegister';
import { Dashboard } from './components/Dashboard';
import { TransactionHistory } from './components/TransactionHistory';
import { ProductManagement } from './components/ProductManagement';
import { SettingsView } from './components/SettingsView';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';

function POSAppContent() {
  const { activeTab } = usePOS();

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Background Cyber Glow Highlights */}
      <div
        className="pointer-events-none fixed -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-[140px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed top-1/2 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px]"
        aria-hidden="true"
      />

      {/* Top Bar Header */}
      <Header />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'pos' && <POSRegister />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'history' && <TransactionHistory />}
        {activeTab === 'inventory' && <ProductManagement />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Modals */}
      <PaymentModal />
      <ReceiptModal />
    </div>
  );
}

export default function App() {
  return (
    <POSProvider>
      <POSAppContent />
    </POSProvider>
  );
}
