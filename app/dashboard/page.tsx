"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Pencil,
  Trash2,
  ArrowDownAZ,
  DollarSign,
  TrendingUp,
  Plus,
  Package,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@radix-ui/react-separator";

// --- Types ---
interface Product {
  _id: string;
  name: string;
  costCLP: number;
  priceARS: number;
  quantity: number;
}


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
  const [loading, setLoading] = useState(false);
  const [conversionRate, setConversionRate] = useState(1.55);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // --- React Hook Form ---
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      costCLP: "",
      priceARS: "",
      quantity: "1",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    if (!API_URL) return toast.error("API_URL no está definida");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/compras`);
      if (!res.ok) throw new Error("Error cargando productos");
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      toast.error("Error al cargar productos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (form: ProductFormData) => {
    if (!API_URL) return toast.error("API_URL no está definida");

    const newProduct = {
      name: form.name,
      costCLP: parseFloat(form.costCLP),
      priceARS: parseFloat(form.priceARS),
      quantity: parseInt(form.quantity) || 1,
    };

    setLoading(true);
    try {
      if (editingId) {
        const res = await fetch(`${API_URL}/compras/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProduct),
        });
        if (!res.ok) throw new Error("Error al actualizar producto");

        setProducts((prev) =>
          prev.map((p) => (p._id === editingId ? { ...p, ...newProduct } : p))
        );
        toast.success("Producto editado correctamente");
        setEditingId(null);
      } else {
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
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product._id);
    setValue("name", product.name);
    setValue("costCLP", product.costCLP.toString());
    setValue("priceARS", product.priceARS.toString());
    setValue("quantity", product.quantity.toString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = async (product: Product) => {
    if (!API_URL || !product) return toast.error("No se pudo eliminar");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/compras/${product._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar producto");
      setProducts(prev => prev.filter(p => p._id !== product._id));
      toast.success("Producto eliminado correctamente");
    } catch (err: any) {
      console.error(err);
      toast.error("Error al eliminar producto");
    } finally {
      setLoading(false);
    }
  };

  const totalCLP = products.reduce((acc, p) => acc + p.costCLP * p.quantity, 0);
  const totalARS = totalCLP * conversionRate;
  const totalRevenueARS = products.reduce((acc, p) => acc + p.priceARS * p.quantity, 0);
  const totalProfit = totalRevenueARS - totalARS;

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    if (sortByProfit) {
      sorted.sort((a, b) => {
        const profitA = (a.priceARS - a.costCLP * conversionRate) * a.quantity;
        const profitB = (b.priceARS - b.costCLP * conversionRate) * b.quantity;
        return profitB - profitA;
      });
    }
    return sorted;
  }, [products, sortByProfit]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">


<div>
  <Label>Tipo de cambio CLP → ARS</Label>
  <Input
    type="number"
    value={conversionRate}
    step={0.01}
    min={0}
    onChange={(e) => setConversionRate(parseFloat(e.target.value))}
    placeholder="Ej: 1.55"
  />
  <p className="text-xs text-muted-foreground mt-1">
    Ajusta la tasa de conversión usada para calcular costos y ganancias en ARS.
  </p>
</div>

      {/* Formulario */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Plus className="w-6 h-6 text-green-600" />
            {editingId ? `Editando producto` : "Agregar producto"}
          </CardTitle>
          {editingId && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                reset();
                setEditingId(null);
              }}
            >
              Cancelar edición
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div>
              <Label>Nombre del producto</Label>
              <Input {...register("name")} placeholder="Ej: Tabla Skate" />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label>Precio en CLP (costo)</Label>
              <Input type="number" {...register("costCLP")} placeholder="Ej: 20,000 CLP" />
              {errors.costCLP && (
                <p className="text-red-500 text-sm">{errors.costCLP.message}</p>
              )}
            </div>
            <div>
              <Label>Precio en ARS (venta)</Label>
              <Input type="number" {...register("priceARS")} placeholder="Ej: 50,000 ARS" />
              {errors.priceARS && (
                <p className="text-red-500 text-sm">{errors.priceARS.message}</p>
              )}
            </div>
            <div>
              <Label>Cantidad</Label>
              <Input type="number" {...register("quantity")} placeholder="Ej: 2" />
              {errors.quantity && (
                <p className="text-red-500 text-sm">{errors.quantity.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
              {editingId ? "Guardar cambios" : "Agregar producto"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de productos */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Lista de productos
          </CardTitle>

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
          {loading && <p className="text-center text-gray-500">Cargando...</p>}
          {!loading && sortedProducts.length === 0 && (
            <p className="text-center text-gray-500">No hay productos agregados</p>
          )}

          {/* Tabla desktop */}
          <div className="hidden sm:block">
            <Table>
              <TableCaption>Lista de productos</TableCaption>
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
                {sortedProducts.map((p) => {
                  const totalCLPItem = p.costCLP * p.quantity;
                  const profit = (p.priceARS - p.costCLP * conversionRate) * p.quantity;

                  return (
                    <TableRow key={p._id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.costCLP.toLocaleString()} CLP</TableCell>
                      <TableCell>{totalCLPItem.toLocaleString()} CLP</TableCell>
                      <TableCell>
                        {Math.round(p.costCLP * conversionRate).toLocaleString()} ARS
                      </TableCell>
                      <TableCell>{p.priceARS.toLocaleString()} ARS</TableCell>
                      <TableCell>{p.quantity}</TableCell>
                      <TableCell
                        className={`font-semibold ${
                          profit < 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {Math.round(profit).toLocaleString()} ARS
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button size="icon" variant="ghost" title="Editar" onClick={() => handleEdit(p)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" title="Eliminar">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. ¿Deseas eliminar {p.name}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>CANCELAR</AlertDialogCancel>
                              <AlertDialogAction onClick={() => confirmDelete(p)}>
                                ELIMINAR
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Cards mobile con acordeón */}
   
<div className="sm:hidden flex flex-col gap-4">
  {sortedProducts.map((p) => {
    const totalCLPItem = p.costCLP * p.quantity;
    const profit = (p.priceARS - p.costCLP * conversionRate) * p.quantity;

    return (
      <Card key={p._id} className="p-4 bg-muted/20 rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-3 border-b border-muted/40 pb-2">
          <p className="font-semibold text-lg">{p.name}</p>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" title="Editar" onClick={() => handleEdit(p)}>
              <Pencil className="w-5 h-5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="ghost" title="Eliminar">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. ¿Deseas eliminar <strong>{p.name}</strong>?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>CANCELAR</AlertDialogCancel>
                  <AlertDialogAction onClick={() => confirmDelete(p)}>ELIMINAR</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between items-center p-2 rounded bg-muted/10">
            <span className="font-medium text-muted-foreground">Costo (CLP):</span>
            <span>${p.costCLP.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center p-2 rounded bg-muted/10">
            <span className="font-medium text-muted-foreground">Total (CLP):</span>
            <span>${totalCLPItem.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center p-2 rounded bg-muted/10">
            <span className="font-medium text-muted-foreground">Costo (ARS):</span>
            <span>${Math.round(p.costCLP * conversionRate).toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center p-2 rounded bg-muted/10">
            <span className="font-medium text-muted-foreground">Venta (ARS):</span>
            <span>${p.priceARS.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center p-2 rounded bg-muted/10">
            <span className="font-medium text-muted-foreground">Cantidad:</span>
            <span>{p.quantity}</span>
          </div>
        </div>

        {/* Separator antes de Ganancia */}
        <Separator className="my-2" />

        {/* Profit */}
        <div className="flex justify-between items-center mt-1">
          <span className="font-semibold text-lg">Ganancia:</span>
          <span className={`font-bold text-lg ${profit < 0 ? "text-red-600" : "text-green-600"}`}>
            ${Math.round(profit).toLocaleString()}
          </span>
        </div>
      </Card>
    );
  })}
</div>


{/* --------------------------- */}
        </CardContent>
      </Card>

      {/* Totales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            Resumen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="bg-muted/40 text-center">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total invertido (CLP)</p>
                <p className="text-xl font-bold">{totalCLP.toLocaleString()} 🇨🇱</p>
              </CardContent>
            </Card>

            <Card className="bg-muted/40 text-center">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total invertido (ARS)</p>
                <p className="text-xl font-bold">{Math.round(totalARS).toLocaleString()} 🇦🇷</p>
              </CardContent>
            </Card>

            <Card className={`text-center ${totalProfit < 0 ? "bg-red-100 border-red-300 text-red-700" : "bg-green-100 border-green-300 text-green-700"}`}>
              <CardContent className="p-4">
                <p className="text-sm font-medium flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Ganancia total
                </p>
                <p className="text-2xl font-extrabold">{Math.round(totalProfit).toLocaleString()} ARS</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Botón flotante en mobile para agregar producto */}
      {!editingId && (
        <Button
          size="icon"
          className="fixed bottom-6 right-6 sm:hidden p-4 rounded-full shadow-lg"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Plus className="w-6 h-6 text-white" />
        </Button>
      )}
    </div>
  );
}
