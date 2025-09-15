"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Transaction {
  id: number;
  type: "ingreso" | "gasto";
  description: string;
  amount: number; // monto en ARS
  originalAmount: number; // monto en la moneda original
  currency: "ARS" | "CLP";
  date: string;
}

const CONVERSION_RATES: Record<string, number> = {
  CLP: 1.53, // 1 CLP = 1.53 ARS (ejemplo)
  ARS: 1,
};

export default function MoneyManager() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    type: "gasto",
    description: "",
    amount: "",
    currency: "ARS",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!form.description || !form.amount) return;

    const originalAmount = parseFloat(form.amount);
    const amountInARS = originalAmount * CONVERSION_RATES[form.currency];

    const newTransaction: Transaction = {
      id: editingId ?? Date.now(),
      type: form.type as "ingreso" | "gasto",
      description: form.description,
      amount: amountInARS,
      originalAmount,
      currency: form.currency as "ARS" | "CLP",
      date: new Date().toLocaleDateString(),
    };

    if (editingId) {
      setTransactions(transactions.map(t => (t.id === editingId ? newTransaction : t)));
      setEditingId(null);
      toast({ title: "✅ Transacción editada correctamente" });
    } else {
      setTransactions([...transactions, newTransaction]);
      toast({ title: "💰 Transacción agregada" });
    }

    setForm({ type: "gasto", description: "", amount: "", currency: "ARS" });
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setForm({
      type: transaction.type,
      description: transaction.description,
      amount: transaction.originalAmount.toString(),
      currency: transaction.currency,
    });
  };

  const handleDelete = (id: number) => {
    setTransactions(transactions.filter(t => t.id !== id));
    toast({ title: "🗑️ Transacción eliminada" });
  };

  const totalIncome = transactions.filter(t => t.type === "ingreso").reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "gasto").reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>💵 Registrar transacción</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label>Tipo</Label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="ingreso">Ingreso</option>
              <option value="gasto">Gasto</option>
            </select>
          </div>

          <div>
            <Label>Descripción</Label>
            <Input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Ej: Venta de producto / Compra de comida"
            />
          </div>

          <div>
            <Label>Monto</Label>
            <Input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="Ej: 5000"
            />
          </div>

          <div>
            <Label>Moneda</Label>
            <select
              name="currency"
              value={form.currency}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="ARS">ARS</option>
              <option value="CLP">CLP</option>
            </select>
          </div>

          <Button onClick={handleAdd} className="w-full">
            {editingId ? "Guardar cambios" : "Agregar transacción"}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de transacciones */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Transacciones</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {transactions.length === 0 && <p className="text-center text-gray-500">No hay transacciones</p>}

          {/* Tabla desktop */}
          <div className="hidden sm:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/30">
                  <th className="p-2 text-left">Tipo</th>
                  <th className="p-2 text-left">Descripción</th>
                  <th className="p-2 text-left">Monto</th>
                  <th className="p-2 text-left">Fecha</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id} className="even:bg-muted/20">
                    <td className={`p-2 font-semibold ${t.type === "ingreso" ? "text-green-600" : "text-red-600"}`}>
                      {t.type === "ingreso" ? "Ingreso" : "Gasto"}
                    </td>
                    <td className="p-2">{t.description}</td>
                    <td className="p-2">{t.originalAmount.toLocaleString()} {t.currency} ({t.amount.toLocaleString()} ARS)</td>
                    <td className="p-2">{t.date}</td>
                    <td className="p-2 flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(t)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(t.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="sm:hidden flex flex-col gap-4">
            {transactions.map(t => (
              <Card key={t.id} className="p-4 bg-muted/10">
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-semibold ${t.type === "ingreso" ? "text-green-600" : "text-red-600"}`}>
                    {t.type === "ingreso" ? "Ingreso" : "Gasto"}
                  </span>
                  <span className="text-sm text-gray-500">{t.date}</span>
                </div>
                <p className="text-lg font-medium mb-2">{t.description}</p>
                <div className="flex justify-between items-center">
                  <span className={`${t.type === "ingreso" ? "text-green-600" : "text-red-600"} font-bold`}>
                    {t.originalAmount.toLocaleString()} {t.currency} ({t.amount.toLocaleString()} ARS)
                  </span>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(t)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Resumen</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-4 rounded-lg bg-green-100 border border-green-300">
            <p className="text-sm text-green-700 font-medium">Ingresos totales</p>
            <p className="text-2xl font-bold text-green-700">{totalIncome.toLocaleString()} ARS</p>
          </div>
          <div className="p-4 rounded-lg bg-red-100 border border-red-300">
            <p className="text-sm text-red-700 font-medium">Gastos totales</p>
            <p className="text-2xl font-bold text-red-700">{totalExpenses.toLocaleString()} ARS</p>
          </div>
          <div className={`p-4 rounded-lg ${balance >= 0 ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
            <p className="text-sm font-medium">Balance</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? "text-green-700" : "text-red-700"}`}>
              {balance.toLocaleString()} ARS
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
