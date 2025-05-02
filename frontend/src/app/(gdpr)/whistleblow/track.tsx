"use client";
import { useState } from "react";

export default function TrackReportPage() {
  const [trackingId, setTrackingId] = useState("");
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setReport(null);

    const res = await fetch(`/api/track?trackingId=${trackingId}`);
    const data = await res.json();

    if (res.ok) {
      setReport(data);
    } else {
      setError(data.error || "Unable to retrieve report.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-center">Track Whistleblower Report</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            required
            placeholder="Enter Tracking ID"
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Track Report
          </button>
        </form>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {report && (
          <div className="border-t pt-4">
            <h2 className="text-lg font-bold">Report Details</h2>
            <p><strong>Subject:</strong> {report.subject}</p>
            <p><strong>Submitted:</strong> {new Date(report.date).toLocaleString()}</p>
            <p><strong>Email:</strong> {report.email || "Anonymous"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
