"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

// Interfaces
interface PaymentMethod {
  id: number;
  payment_type: string;
  details: string;
  is_default: boolean;
}

interface CreditTransaction {
  id: number;
  amount: number;
  transaction_type: string;
  payment_amount?: number;
  payment_method?: string;
  payment_status: string;
  timestamp: string;
}

export default function UserDashboard() {
  const { user, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ email: "", username: "", ciudad: "", website: "" });
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [newMethod, setNewMethod] = useState({ payment_type: "stripe", details: "", is_default: false });
  const [credits, setCredits] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [methodsOpen, setMethodsOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    setFormData({
      email: user.email || "",
      username: user.username || "",
      ciudad: user.ciudad || "",
      website: user.website || "",
    });

    const fetchData = async () => {
      try {
        const [transRes, methRes] = await Promise.all([
          fetchAPI<CreditTransaction[]>("/v1/payments/transactions"),
          fetchAPI<PaymentMethod[]>("/v1/payments/methods"),
        ]);
        setTransactions(transRes.data || []);
        setMethods(methRes.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      }
    };
    fetchData();
  }, [user, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setSuccess("Perfil actualizado");
      setEditMode(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar perfil");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await fetchAPI<{ message: string }>("/v1/auth/me/password", {
        method: "PUT",
        data: { current_password: currentPassword, new_password: newPassword },
      });
      setSuccess(data?.message || "Contraseña actualizada");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar contraseña");
    }
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await fetchAPI<CreditTransaction>("/v1/payments/purchase", {
        method: "POST",
        data: { credits: parseInt(credits), payment_amount: parseFloat(paymentAmount), payment_method: "stripe" },
      });
      setTransactions([data!, ...transactions]);
      setCredits("");
      setPaymentAmount("");
      setSuccess("Créditos comprados");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al comprar créditos");
    }
  };

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await fetchAPI<PaymentMethod>("/v1/payments/methods", {
        method: "POST",
        data: newMethod,
      });
      setMethods([...methods, data!]);
      setNewMethod({ payment_type: "stripe", details: "", is_default: false });
      setSuccess("Método añadido");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al añadir método");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await fetchAPI(`/v1/payments/methods/${id}/default`, { method: "PUT" });
      setMethods(methods.map((m) => ({ ...m, is_default: m.id === id })));
      setSuccess("Método predeterminado actualizado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al establecer predeterminado");
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("¿Estás seguro de eliminar tu cuenta? Esta acción es irreversible.")) {
      try {
        await fetchAPI("/v1/users/me", { method: "DELETE" });
        await logout();
        router.push("/login");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al eliminar cuenta");
      }
    }
  };

  if (!user) return <div className="text-center p-4"><div className="loading-spinner mx-auto"></div></div>;

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-6 text-center"
      >
        Dashboard de {user.username}
      </motion.h1>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-[var(--danger)] text-white rounded-md text-center"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-[var(--success)] text-white rounded-md text-center"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Perfil */}
      <motion.div className="card mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="text-2xl font-semibold mb-4">Perfil</h2>
        {editMode ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Ciudad</label>
              <input
                type="text"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Website</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div className="flex space-x-4">
              <button type="submit" className="btn-primary flex-1">Guardar</button>
              <button type="button" onClick={() => setEditMode(false)} className="btn-secondary flex-1">Cancelar</button>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            <p><span className="font-semibold">Email:</span> {user.email}</p>
            <p><span className="font-semibold">Username:</span> {user.username}</p>
            <p><span className="font-semibold">Ciudad:</span> {user.ciudad || "N/A"}</p>
            <p><span className="font-semibold">Website:</span> {user.website || "N/A"}</p>
            <p><span className="font-semibold">Créditos:</span> {user.credits ?? "N/A"}</p>
            <button onClick={() => setEditMode(true)} className="btn-primary w-full mt-4">Editar Perfil</button>
          </div>
        )}
      </motion.div>

      {/* Cambio de Contraseña */}
      <motion.div className="card mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="text-2xl font-semibold mb-4">Cambiar Contraseña</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Contraseña Actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Nueva Contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full">Cambiar Contraseña</button>
        </form>
      </motion.div>

      {/* Transacciones */}
      <motion.div className="card mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button
          onClick={() => setTransactionsOpen(!transactionsOpen)}
          className="w-full text-left text-2xl font-semibold mb-4 flex justify-between items-center"
        >
          Transacciones
          <span>{transactionsOpen ? "▲" : "▼"}</span>
        </button>
        <AnimatePresence>
          {transactionsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {transactions.length === 0 ? (
                <p>No hay transacciones registradas.</p>
              ) : (
                transactions.map((t) => (
                  <div key={t.id} className="p-4 border-b border-[var(--border)]">
                    <p className="font-semibold">{t.transaction_type} de {Math.abs(t.amount)} créditos</p>
                    <p>Monto: ${t.payment_amount?.toFixed(2) || "N/A"}</p>
                    <p>Método: {t.payment_method || "N/A"}</p>
                    <p>Estado: {t.payment_status}</p>
                    <p className="text-sm">{new Date(t.timestamp).toLocaleString()}</p>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Métodos de Pago */}
      <motion.div className="card mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button
          onClick={() => setMethodsOpen(!methodsOpen)}
          className="w-full text-left text-2xl font-semibold mb-4 flex justify-between items-center"
        >
          Métodos de Pago
          <span>{methodsOpen ? "▲" : "▼"}</span>
        </button>
        <AnimatePresence>
          {methodsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {methods.map((m) => (
                <div key={m.id} className="p-4 border-b border-[var(--border)] flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{m.payment_type}</p>
                    <p>{m.details}</p>
                    {m.is_default && <p className="text-[var(--success)]">Predeterminado</p>}
                  </div>
                  {!m.is_default && (
                    <button onClick={() => handleSetDefault(m.id)} className="btn-secondary">Hacer Predeterminado</button>
                  )}
                </div>
              ))}
              <form onSubmit={handleAddMethod} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium">Tipo</label>
                  <select
                    value={newMethod.payment_type}
                    onChange={(e) => setNewMethod({ ...newMethod, payment_type: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  >
                    <option value="stripe">Stripe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Detalles</label>
                  <input
                    type="text"
                    value={newMethod.details}
                    onChange={(e) => setNewMethod({ ...newMethod, details: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full">Añadir Método</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Compra de Créditos */}
      <motion.div className="card mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="text-2xl font-semibold mb-4">Comprar Créditos</h2>
        <form onSubmit={handlePurchase} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Créditos</label>
            <input
              type="number"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Monto (USD)</label>
            <input
              type="number"
              step="0.01"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full">Comprar</button>
        </form>
      </motion.div>

      {/* Acciones */}
      <motion.div className="flex space-x-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button onClick={logout} className="btn-secondary flex-1">Cerrar Sesión</button>
        <button onClick={handleDeleteAccount} className="btn-danger flex-1">Eliminar Cuenta</button>
      </motion.div>
    </div>
  );
}