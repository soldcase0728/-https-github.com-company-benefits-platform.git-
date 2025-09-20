import Link from 'next/link';
import { FileText, Upload, BarChart3, Users, Settings, Shield } from 'lucide-react';

export default function AdminDashboardHome() {
  return (
    <div className="relative font-sans">
      <div className="w-full max-w-6xl mx-auto z-10 px-2 md:px-4 py-10">
        <header className="mb-12">
          <div className="mx-auto mb-6" style={{width:72,height:72}}>
            <span className="logo block" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Benefits Admin Dashboard</h1>
          <p className="text-base md:text-lg max-w-2xl text-[var(--color-text-secondary)]">Unified control center for plan intelligence, OCR extractions, and ACA compliance readiness.</p>
        </header>
        
        {/* Metrics Tiles */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="metric-tile">
            <span className="metric-label">ACTIVE PLANS</span>
            <span className="metric-value">3</span>
          </div>
          <div className="metric-tile">
            <span className="metric-label">RECENT UPLOADS</span>
            <span className="metric-value">12</span>
          </div>
          <div className="metric-tile">
            <span className="metric-label">OCR ACCURACY</span>
            <span className="metric-value">99.2%</span>
          </div>
          <div className="metric-tile">
            <span className="metric-label">AVG PROCESS (s)</span>
            <span className="metric-value">4.6</span>
          </div>
        </section>

        {/* Action Tiles */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Link href="/admin/precision-extract" className="action-tile">
            <div className="flex items-center gap-4">
              <Upload className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold text-white">OCR Extraction</h3>
                <p className="text-sm text-gray-300">Upload documents for AI-powered data extraction</p>
              </div>
            </div>
          </Link>
          <div className="action-tile">
            <div className="flex items-center gap-4">
              <BarChart3 className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold text-white">Analytics & Reports</h3>
                <p className="text-sm text-gray-300">View processing stats and compliance reports</p>
              </div>
            </div>
          </div>
          <div className="action-tile">
            <div className="flex items-center gap-4">
              <FileText className="w-8 h-8 text-purple-500" />
              <div>
                <h3 className="text-lg font-semibold text-white">Plan Library</h3>
                <p className="text-sm text-gray-300">Manage and review benefit plans</p>
              </div>
            </div>
          </div>
          <div className="action-tile">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-yellow-500" />
              <div>
                <h3 className="text-lg font-semibold text-white">Employee Management</h3>
                <p className="text-sm text-gray-300">Handle enrollments and user data</p>
              </div>
            </div>
          </div>
          <div className="action-tile">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold text-white">Compliance Check</h3>
                <p className="text-sm text-gray-300">Ensure ACA and regulatory compliance</p>
              </div>
            </div>
          </div>
          <div className="action-tile">
            <div className="flex items-center gap-4">
              <Settings className="w-8 h-8 text-gray-500" />
              <div>
                <h3 className="text-lg font-semibold text-white">Settings</h3>
                <p className="text-sm text-gray-300">Configure system preferences</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
