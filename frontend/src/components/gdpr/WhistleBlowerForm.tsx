// frontend/src/components/gdpr/WhistleBlowerForm.tsx
"use client";
import { useState } from "react";

export default function WhistleblowerForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [trackingId, setTrackingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch("/api/whistleblow", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    setStatus(res.ok ? "submitted" : "error");
    setTrackingId(result?.trackingId || null);

    if (res.ok) form.reset();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-4" encType="multipart/form-data">
      <h2 className="text-2xl font-semibold">Whistleblower Report</h2>

      <input name="subject" required placeholder="Subject" className="w-full border p-2 rounded" />
      <textarea name="message" required placeholder="Your message" className="w-full border p-2 rounded h-32" />

      <label className="flex items-center space-x-2">
        <input type="checkbox" name="anonymous" className="accent-blue-600" />
        <span>Submit anonymously</span>
      </label>

      <input name="email" type="email" placeholder="Your email (optional)" className="w-full border p-2 rounded" />
      <input name="attachment" type="file" accept=".pdf,.doc,.jpg,.png,.txt" className="block" />

      <button type="submit" disabled={status === "submitting"} className="bg-blue-600 text-white px-4 py-2 rounded">
        {status === "submitting" ? "Submitting..." : "Submit Report"}
      </button>

      {status === "submitted" && trackingId && (
        <p className="text-green-600">
          ✅ Report submitted. Your tracking ID: <code className="bg-gray-100 px-2 py-1 rounded">{trackingId}</code>
        </p>
      )}
      {status === "error" && <p className="text-red-600">❌ Submission failed. Try again later.</p>}
    </form>
  );
}
