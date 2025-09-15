"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

  // Calcular totales
  const totalCLP = products.reduce((acc, p) => acc + p.costCLP * p.quantity, 0);
  const totalARS = totalCLP * CONVERSION_RATE;
  const totalRevenueARS = products.reduce((acc, p) => acc + p.priceARS * p.quantity, 0);
  const totalProfit = totalRevenueARS - totalARS;

  // Ordenar productos si está activado el filtro
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
        <CardHeader className="flex justify-between items-center">
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
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Costo (CLP)</TableHead>
                <TableHead>Total (CLP)</TableHead>
                <TableHead>Costo (ARS)</TableHead>
                <TableHead>Venta (ARS)</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Ganancia (ARS)</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map(p => {
                const totalCLPItem = p.costCLP * p.quantity;
                const profit = (p.priceARS - p.costCLP * CONVERSION_RATE) * p.quantity;

                return (
                  <TableRow key={p.id} className="even:bg-muted/30">
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.costCLP.toLocaleString()} CLP</TableCell>
                    <TableCell>{totalCLPItem.toLocaleString()} CLP</TableCell>
                    <TableCell>{Math.round(p.costCLP * CONVERSION_RATE).toLocaleString()} ARS</TableCell>
                    <TableCell>{p.priceARS.toLocaleString()} ARS</TableCell>
                    <TableCell>{p.quantity}</TableCell>
                    <TableCell className="text-green-600 font-semibold">
                      {Math.round(profit).toLocaleString()} ARS
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(p)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Totales */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Resumen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
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
              <p className="text-2xl font-extrabold text-green-700">
                {Math.round(totalProfit).toLocaleString()} ARS
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
