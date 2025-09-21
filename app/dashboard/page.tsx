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
import ReactCountryFlag from "react-country-flag";

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

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", costCLP: "", priceARS: "", quantity: "1" },
    mode: "onBlur",
  });

  useEffect(() => { fetchProducts(); }, []);

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
      
    } finally { setLoading(false); }
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
        setProducts(prev => prev.map(p => p._id === editingId ? { ...p, ...newProduct } : p));
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
        setProducts(prev => [...prev, { ...newProduct, _id: data._id }]);
        toast.success("Producto agregado correctamente");
      }
      reset();
    } catch (err: any) {
      console.error(err);
      toast.error("Ocurrió un error");
    } finally { setLoading(false); }
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
    } finally { setLoading(false); }
  };

  const totalCLP = products.reduce((acc, p) => acc + p.costCLP * p.quantity, 0);
  const totalARS = totalCLP * conversionRate;
  const totalRevenueARS = products.reduce((acc, p) => acc + p.priceARS * p.quantity, 0);
  const totalProfit = totalRevenueARS - totalARS;

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    if (sortByProfit) {
      sorted.sort((a, b) => ((b.priceARS - b.costCLP * conversionRate) * b.quantity) - ((a.priceARS - a.costCLP * conversionRate) * a.quantity));
    }
    return sorted;
  }, [products, sortByProfit]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* Tasa de conversión */}
      <div>
        <Label>Tasa de cambio CLP → ARS</Label>
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
            {editingId ? "Editando producto" : "Agregar producto"}
          </CardTitle>
          {editingId && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => { reset(); setEditingId(null); }}
            >
              Cancelar edición
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div>
              <Label>Nombre del producto</Label>
              <Input {...register("name")} />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div>
              <Label>
                Precio de compra{" "}
                <span className="inline-block w-5 h-5 rounded-full overflow-hidden align-middle">
                  <ReactCountryFlag countryCode="CL" svg style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} title="Chile" />
                </span>
              </Label>
              <Input type="number" {...register("costCLP")} />
              {errors.costCLP && <p className="text-red-500 text-sm">{errors.costCLP.message}</p>}
            </div>
            <div>
              <Label>
                Precio de venta{" "}
                <span className="inline-block w-5 h-5 rounded-full overflow-hidden align-middle">
                  <ReactCountryFlag countryCode="AR" svg style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} title="Argentina" />
                </span>
              </Label>
              <Input type="number" {...register("priceARS")} />
              {errors.priceARS && <p className="text-red-500 text-sm">{errors.priceARS.message}</p>}
            </div>
            <div>
              <Label>Cantidad</Label>
              <Input type="number" {...register("quantity")} />
              {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
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
          <Button variant={sortByProfit ? "secondary" : "outline"} size="sm" onClick={() => setSortByProfit(!sortByProfit)}>
            <ArrowDownAZ className="w-4 h-4 mr-2" />
            {sortByProfit ? "Ordenado por ganancia" : "Ordenar por ganancia"}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          {loading && <p className="text-center text-gray-500">Cargando...</p>}
          {!loading && sortedProducts.length === 0 && <p className="text-center text-gray-500">No hay productos agregados</p>}

          {/* Tabla desktop */}
          <div className="hidden sm:block">
  
<Table className="w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
  <TableCaption className="text-sm text-gray-500">Lista de productos</TableCaption>
  <TableHeader className="bg-gray-100">
    <TableRow>
      <TableHead className="px-4 py-2 text-left font-bold">PRODUCTO</TableHead>
      <TableHead className="px-4 py-2 text-left font-bold">
        COSTO
        <span className="ml-1 inline-block">
          <ReactCountryFlag
            countryCode="CL"
            svg
            style={{ width: 14, height: 14, objectFit: "cover", borderRadius: "50%" }}
            title="Chile"
          />
        </span>
      </TableHead>
      <TableHead className="px-4 py-2 text-left font-bold">
        TOTAL
        <span className="ml-1 inline-block">
          <ReactCountryFlag
            countryCode="CL"
            svg
            style={{ width: 14, height: 14, objectFit: "cover", borderRadius: "50%" }}
            title="Chile"
          />
        </span>
      </TableHead>
      <TableHead className="px-4 py-2 text-left font-bold">
        COSTO
        <span className="ml-1 inline-block">
          <ReactCountryFlag
            countryCode="AR"
            svg
            style={{ width: 14, height: 14, objectFit: "cover", borderRadius: "50%" }}
            title="Argentina"
          />
        </span>
      </TableHead>
      <TableHead className="px-4 py-2 text-left font-bold">
        VENTA
        <span className="ml-1 inline-block">
          <ReactCountryFlag
            countryCode="AR"
            svg
            style={{ width: 14, height: 14, objectFit: "cover", borderRadius: "50%" }}
            title="Argentina"
          />
        </span>
      </TableHead>
      <TableHead className="px-4 py-2 text-left font-bold">CANTIDAD</TableHead>
      <TableHead className="px-4 py-2 text-left font-bold">
        GANANCIA
        <span className="ml-1 inline-block">
          <ReactCountryFlag
            countryCode="AR"
            svg
            style={{ width: 14, height: 14, objectFit: "cover", borderRadius: "50%" }}
            title="Argentina"
          />
        </span>
      </TableHead>
      <TableHead className="px-4 py-2"></TableHead>
    </TableRow>
  </TableHeader>

  <TableBody>
    {sortedProducts.map((p, index) => {
      const totalCLPItem = p.costCLP * p.quantity;
      const profit = (p.priceARS - p.costCLP * conversionRate) * p.quantity;
      return (
        <TableRow
          key={p._id}
          className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors`}
        >
          <TableCell className="px-4 py-2 font-medium">{p.name}</TableCell>
          <TableCell className="px-4 py-2">${p.costCLP.toLocaleString()}</TableCell>
          <TableCell className="px-4 py-2">${totalCLPItem.toLocaleString()}</TableCell>
          <TableCell className="px-4 py-2">${Math.round(p.costCLP * conversionRate).toLocaleString()}</TableCell>
          <TableCell className="px-4 py-2">${p.priceARS.toLocaleString()}</TableCell>
          <TableCell className="px-4 py-2">{p.quantity}</TableCell>
          <TableCell className={`px-4 py-2 font-semibold ${profit < 0 ? "text-red-600" : "text-green-600"}`}>
            ${Math.round(profit).toLocaleString()}
          </TableCell>
          <TableCell className="px-4 py-2 flex gap-2">
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
                  <AlertDialogAction onClick={() => confirmDelete(p)}>ELIMINAR</AlertDialogAction>
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


          {/* Cards mobile */}
 {/* Cards mobile */}
<div className="sm:hidden flex flex-col gap-4">
  {sortedProducts.map((p) => {
    const totalCLPItem = p.costCLP * p.quantity;
    const profit = (p.priceARS - p.costCLP * conversionRate) * p.quantity;
    return (
      <Card key={p._id} className="p-4 bg-muted/20 rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-muted/40 pb-2 mb-2">
          <p className="font-semibold text-lg">{p.name}</p>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              title="Editar"
              onClick={() => handleEdit(p)}
              className="border"
            >
              <Pencil className="w-5 h-5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="ghost" title="Eliminar" className="border">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. ¿Deseas eliminar{" "}
                    <strong>{p.name}</strong>?
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
          </div>
        </div>

        {/* Detalles */}
        <div className="flex flex-col text-sm divide-y divide-muted/40 rounded-lg overflow-hidden">
          {[
            { label: "Costo", value: `$${p.costCLP.toLocaleString()}`, flag: "CL" },
            { label: "Total", value: `$${totalCLPItem.toLocaleString()}`, flag: "CL" },
            { label: "Costo", value: `$${Math.round(p.costCLP * conversionRate).toLocaleString()}`, flag: "AR" },
            { label: "Venta", value: `$${p.priceARS.toLocaleString()}`, flag: "AR" },
            { label: "Cantidad", value: p.quantity.toString(), flag: null },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center px-2 py-2 bg-white/50">
              <span className="font-medium text-muted-foreground flex items-center gap-2">
                {item.label}
                {item.flag && (
                  <ReactCountryFlag
                    countryCode={item.flag}
                    svg
                    className="align-middle"
                    style={{ width: 16, height: 16, borderRadius: "50%" }}
                  />
                )}
              </span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Ganancia */}
        <div className="flex justify-between items-center border-t border-muted/40 mt-2 pt-2">
          <span className="font-semibold text-lg flex items-center gap-2">
            Ganancia
            <ReactCountryFlag
              countryCode="AR"
              svg
              className="align-middle"
              style={{ width: 16, height: 16, borderRadius: "50%" }}
            />
          </span>
          <span
            className={`font-bold text-lg ${
              profit < 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            ${Math.round(profit).toLocaleString()}
          </span>
        </div>
      </Card>
    );
  })}
</div>

{/* dddddddddddddddddddd */}
        </CardContent>
      </Card>

      {/* Totales */}
      <Card>
        <CardHeader><CardTitle className="text-2xl font-bold">Resumen</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="bg-muted/40 text-center"><CardContent className="p-4">
              <p className="text-sm text-gray-700 flex items-center justify-center gap-1">
                Total invertido <ReactCountryFlag countryCode="CL" svg style={{ width: 20, height: 20, objectFit: "cover", borderRadius: "50%" }} />
              </p>
              <p className="text-xl font-bold text-gray-900">${totalCLP.toLocaleString("es-CL")}</p>
            </CardContent></Card>

            <Card className="bg-muted/40 text-center"><CardContent className="p-4">
              <p className="text-sm text-gray-700 flex items-center justify-center gap-1">
                Total invertido <ReactCountryFlag countryCode="AR" svg style={{ width: 20, height: 20, objectFit: "cover", borderRadius: "50%" }} />
              </p>
              <p className="text-xl font-bold text-gray-900">${Math.round(totalARS).toLocaleString("es-AR")}</p>
            </CardContent></Card>

            <Card className={`text-center ${totalProfit < 0 ? "bg-red-100 border-red-300 text-red-700" : "bg-green-100 border-green-300 text-green-700"}`}>
              <CardContent className="p-4">
                <p className="text-sm font-medium flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4" /> Ganancia total
                </p>
                <p className="text-2xl font-extrabold">${Math.round(totalProfit).toLocaleString("es-AR")}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Botón flotante mobile */}
      {!editingId && (
        <Button
          size="icon"
          className="fixed bottom-6 right-6 sm:hidden p-4 rounded-full shadow-lg cursor-pointer active:scale-95 transition-transform"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Plus className="w-6 h-6 text-white" />
        </Button>
      )}

    </div>
  );
}
