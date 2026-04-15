"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { FiMail, FiCheck, FiX } from "react-icons/fi";

export default function AdminEmailsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const token = localStorage.getItem("admin_token");
        const res = await adminApi.get(`/emails?page=${page}&limit=20`, token);
        if (res.success) {
          setLogs(res.data.logs);
          setTotal(res.data.total);
          setTotalPages(res.data.totalPages);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [page]);

  return (
    <div>
      <div className="admin-card mb-4">
        <div className="admin-filters">
          <div className="flex items-center gap-2">
            <FiMail size={18} className="text-gray-500" />
            <span className="font-medium">{total} emails sent</span>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Recipient</th>
                <th>Subject</th>
                <th>Sent At</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j}><div className="skeleton w-full h-5" /></td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-500">No emails sent yet</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id}>
                    <td>
                      {log.status === "sent" ? (
                        <span className="admin-email-status sent"><FiCheck size={14} /> Sent</span>
                      ) : (
                        <span className="admin-email-status failed"><FiX size={14} /> Failed</span>
                      )}
                    </td>
                    <td className="text-sm">{log.recipient}</td>
                    <td className="text-sm">{log.subject}</td>
                    <td className="text-sm text-gray-500">
                      {new Date(log.sent_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="text-sm text-red-500">{log.error_message || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="admin-pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="admin-page-btn">Previous</button>
            <span className="admin-page-info">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="admin-page-btn primary">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
