"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, ArrowDownAZ } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

// --- Types ---
interface Product {
  _id: string;
  name: string;
  costCLP: number;
  priceARS: number;
  quantity: number;
}

// --- Constants ---
const CONVERSION_RATE = 1.55;

// --- Validation Schema ---
const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  costCLP: z.string().min(1, "El costo en CLP es requerido"),
  priceARS: z.string().min(1, "El precio en ARS es requerido"),
  quantity: z.string().min(1, "La cantidad es requerida"),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortByProfit, setSortByProfit] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // --- React Hook Form ---
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      costCLP: "",
      priceARS: "",
      quantity: "1",
    },
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    if (!API_URL) {
      toast.error("API_URL no está definida");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/compras`);
      if (!res.ok) throw new Error("Error cargando productos");
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      toast.error("Error al cargar productos");
      console.error(err);
    }
  };

  const onSubmit = async (form: ProductFormData) => {
    if (!API_URL) {
      toast.error("API_URL no está definida");
      return;
    }

    const newProduct = {
      name: form.name,
      costCLP: parseFloat(form.costCLP),
      priceARS: parseFloat(form.priceARS),
      quantity: parseInt(form.quantity) || 1,
    };

    try {
      if (editingId) {
        // Editar producto
        const res = await fetch(`${API_URL}/compras/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProduct),
        });
        if (!res.ok) throw new Error("Error al actualizar producto");

        setProducts((prev) =>
          prev.map((p) => (p._id === editingId ? { ...p, ...newProduct } : p))
        );
        setEditingId(null);
        toast.success("Producto editado correctamente");
      } else {
        // Agregar producto
        const res = await fetch(`${API_URL}/compras/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProduct),
        });
        if (!res.ok) throw new Error("Error al guardar producto");

        const data = await res.json();
        setProducts((prev) => [...prev, { ...newProduct, _id: data._id }]);
        toast.success("Producto agregado correctamente");
      }
      reset();
    } catch (err: any) {
      console.error(err);
      toast.error("Ocurrió un error");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product._id);
    setValue("name", product.name);
    setValue("costCLP", product.costCLP.toString());
    setValue("priceARS", product.priceARS.toString());
    setValue("quantity", product.quantity.toString());
  };

  const handleDelete = async (_id: string) => {
    if (!API_URL) {
      toast.error("API_URL no está definida");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/compras/${_id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar producto");
      setProducts((prev) => prev.filter((p) => p._id !== _id));
      toast.success("Producto eliminado correctamente");
    } catch (err: any) {
      console.error(err);
      toast.error("Error al eliminar producto");
    }
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
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div>
              <Label>Nombre del producto</Label>
              <Input {...register("name")} placeholder="Ej: Tabla Skate" />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div>
              <Label>Precio en CLP (costo)</Label>
              <Input type="number" {...register("costCLP")} placeholder="Ej: 20000" />
              {errors.costCLP && <p className="text-red-500 text-sm">{errors.costCLP.message}</p>}
            </div>
            <div>
              <Label>Precio en ARS (venta)</Label>
              <Input type="number" {...register("priceARS")} placeholder="Ej: 50000" />
              {errors.priceARS && <p className="text-red-500 text-sm">{errors.priceARS.message}</p>}
            </div>
            <div>
              <Label>Cantidad</Label>
              <Input type="number" {...register("quantity")} placeholder="Ej: 2" />
              {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
            </div>
            <Button type="submit" className="w-full">
              {editingId ? "Guardar cambios" : "Agregar producto"}
            </Button>
          </form>
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

          {/* Tabla desktop */}
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
                    <tr key={p._id} className="even:bg-muted/20">
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
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(p._id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="sm:hidden flex flex-col gap-4">
            {sortedProducts.map((p) => {
              const totalCLPItem = p.costCLP * p.quantity;
              const profit = (p.priceARS - p.costCLP * CONVERSION_RATE) * p.quantity;
              return (
                <Card key={p._id} className="p-4 bg-muted/10">
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
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(p._id)}>
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
