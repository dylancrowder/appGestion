"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, ArrowDownAZ } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Product {
  id: number;
  name: string;
  costCLP: number;
  priceARS: number;
  quantity: number;
}

const CONVERSION_RATE = 1.53;

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    costCLP: "",
    priceARS: "",
    quantity: "1",
  });
  const [sortByProfit, setSortByProfit] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!form.name || !form.costCLP || !form.priceARS) return;

    const newProduct: Product = {
      id: editingId ?? Date.now(),
      name: form.name,
      costCLP: parseFloat(form.costCLP),
      priceARS: parseFloat(form.priceARS),
      quantity: parseInt(form.quantity) || 1,
    };

    if (editingId) {
      setProducts(products.map(p => (p.id === editingId ? newProduct : p)));
      setEditingId(null);
      toast({ title: "✅ Producto editado correctamente" });
    } else {
      setProducts([...products, newProduct]);
      toast({ title: "🛒 Producto agregado" });
    }

    setForm({ name: "", costCLP: "", priceARS: "", quantity: "1" });
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      costCLP: product.costCLP.toString(),
      priceARS: product.priceARS.toString(),
      quantity: product.quantity.toString(),
    });
  };

  const handleDelete = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
    toast({ title: "🗑️ Producto eliminado" });
  };

  const totalCLP = products.reduce((acc, p) => acc + p.costCLP * p.quantity, 0);
  const totalARS = totalCLP * CONVERSION_RATE;
  const totalRevenueARS = products.reduce((acc, p) => acc + p.priceARS * p.quantity, 0);
  const totalProfit = totalRevenueARS - totalARS;

  const sortedProducts = [...products].sort((a, b) => {
    const profitA = (a.priceARS - a.costCLP * CONVERSION_RATE) * a.quantity;
    const profitB = (b.priceARS - b.costCLP * CONVERSION_RATE) * b.quantity;
    return sortByProfit ? profitB - profitA : 0;
  });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>🛒 Agregar producto</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label>Nombre del producto</Label>
            <Input name="name" value={form.name} onChange={handleChange} placeholder="Ej: Tabla Skate" />
          </div>
          <div>
            <Label>Precio en CLP (costo)</Label>
            <Input type="number" name="costCLP" value={form.costCLP} onChange={handleChange} placeholder="Ej: 20000" />
          </div>
          <div>
            <Label>Precio en ARS (venta)</Label>
            <Input type="number" name="priceARS" value={form.priceARS} onChange={handleChange} placeholder="Ej: 50000" />
          </div>
          <div>
            <Label>Cantidad</Label>
            <Input type="number" name="quantity" value={form.quantity} onChange={handleChange} placeholder="Ej: 2" />
          </div>
          <Button onClick={handleAdd} className="w-full">
            {editingId ? "Guardar cambios" : "Agregar producto"}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de productos */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <CardTitle>📋 Lista de productos</CardTitle>
          <Button
            variant={sortByProfit ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSortByProfit(!sortByProfit)}
          >
            <ArrowDownAZ className="w-4 h-4 mr-2" />
            {sortByProfit ? "Ordenado por ganancia" : "Ordenar por ganancia"}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          {sortedProducts.length === 0 && <p className="text-center text-gray-500">No hay productos agregados</p>}
          {/* Para pantallas grandes usamos tabla */}
          <div className="hidden sm:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/30">
                  <th className="p-2 text-left">Producto</th>
                  <th className="p-2 text-left">Costo (CLP)</th>
                  <th className="p-2 text-left">Total (CLP)</th>
                  <th className="p-2 text-left">Costo (ARS)</th>
                  <th className="p-2 text-left">Venta (ARS)</th>
                  <th className="p-2 text-left">Cantidad</th>
                  <th className="p-2 text-left">Ganancia (ARS)</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((p) => {
                  const totalCLPItem = p.costCLP * p.quantity;
                  const profit = (p.priceARS - p.costCLP * CONVERSION_RATE) * p.quantity;
                  return (
                    <tr key={p.id} className="even:bg-muted/20">
                      <td className="p-2">{p.name}</td>
                      <td className="p-2">{p.costCLP.toLocaleString()} CLP</td>
                      <td className="p-2">{totalCLPItem.toLocaleString()} CLP</td>
                      <td className="p-2">{Math.round(p.costCLP * CONVERSION_RATE).toLocaleString()} ARS</td>
                      <td className="p-2">{p.priceARS.toLocaleString()} ARS</td>
                      <td className="p-2">{p.quantity}</td>
                      <td className="p-2 text-green-600 font-semibold">{Math.round(profit).toLocaleString()} ARS</td>
                      <td className="p-2 flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(p)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Para móviles usamos tarjetas */}
          <div className="sm:hidden flex flex-col gap-4">
            {sortedProducts.map((p) => {
              const totalCLPItem = p.costCLP * p.quantity;
              const profit = (p.priceARS - p.costCLP * CONVERSION_RATE) * p.quantity;
              return (
                <Card key={p.id} className="p-4 bg-muted/10">
                  <p className="font-semibold">{p.name}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div>Costo (CLP): {p.costCLP.toLocaleString()}</div>
                    <div>Total (CLP): {totalCLPItem.toLocaleString()}</div>
                    <div>Costo (ARS): {Math.round(p.costCLP * CONVERSION_RATE).toLocaleString()}</div>
                    <div>Venta (ARS): {p.priceARS.toLocaleString()}</div>
                    <div>Cantidad: {p.quantity}</div>
                    <div className="text-green-600 font-semibold">Ganancia: {Math.round(profit).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(p)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Totales */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Resumen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-lg bg-muted/40">
              <p className="text-sm text-gray-500">Total invertido (CLP)</p>
              <p className="text-xl font-bold">{totalCLP.toLocaleString()} CLP</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/40">
              <p className="text-sm text-gray-500">Total invertido (ARS)</p>
              <p className="text-xl font-bold">{Math.round(totalARS).toLocaleString()} ARS</p>
            </div>
            <div className="p-4 rounded-lg bg-green-100 border border-green-300">
              <p className="text-sm text-green-700 font-medium">Ganancia total</p>
              <p className="text-2xl font-extrabold text-green-700">{Math.round(totalProfit).toLocaleString()} ARS</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
