"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Package, Plus, TrendingUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ReactCountryFlag from "react-country-flag";

interface Product {
  id: string;
  name: string;
  costCLP: number;
  priceARS: number;
  quantity: number;
  profit: number;
  url?: string; // opcional
}

export default function ProfitChecker() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [costCLP, setCostCLP] = useState<number | "">("");
  const [priceARS, setPriceARS] = useState<number | "">("");
  const [quantity, setQuantity] = useState(1);
  const [conversionRate, setConversionRate] = useState(1.66);
  const [products, setProducts] = useState<Product[]>([]);

  const parsedCost = typeof costCLP === "number" ? costCLP : 0;
  const parsedPrice = typeof priceARS === "number" ? priceARS : 0;

  const convertedCostARS = parsedCost * conversionRate;
  const profit = (parsedPrice - convertedCostARS) * quantity;

  const handleAdd = () => {
    if (!name || profit <= 0) return;

    const newProduct: Product = {
      id: crypto.randomUUID(),
      name,
      costCLP: parsedCost,
      priceARS: parsedPrice,
      quantity,
      profit,
      url: url.trim() || undefined,
    };

    setProducts((prev) => [...prev, newProduct]);

    // reset form
    setName("");
    setUrl("");
    setCostCLP("");
    setPriceARS("");
    setQuantity(1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Tasa de conversión */}
      <div>
        <Label>Tasa de cambio CLP → ARS</Label>
        <Input
          type="number"
          value={conversionRate}
          step={0.01}
          min={0}
          onChange={(e) => setConversionRate(parseFloat(e.target.value))}
        />
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Comprobar producto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label>Nombre del producto</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Link del producto (opcional)</Label>
              <Input
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div>
              <Label>
                Costo en CLP{" "}
                <ReactCountryFlag
                  countryCode="CL"
                  svg
                  style={{ width: 16, height: 16 }}
                />
              </Label>
              <Input
                type="number"
                value={costCLP}
                onChange={(e) =>
                  setCostCLP(e.target.value ? parseFloat(e.target.value) : "")
                }
              />
            </div>
            <div>
              <Label>
                Precio de venta ARS{" "}
                <ReactCountryFlag
                  countryCode="AR"
                  svg
                  style={{ width: 16, height: 16 }}
                />
              </Label>
              <Input
                type="number"
                value={priceARS}
                onChange={(e) =>
                  setPriceARS(e.target.value ? parseFloat(e.target.value) : "")
                }
              />
            </div>
            <div>
              <Label>Cantidad</Label>
              <Input
                type="number"
                value={quantity}
                min={1}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </div>

            {/* Costo invertido */}
            {parsedCost > 0 && (
              <div className="p-4 rounded-lg font-bold text-lg bg-yellow-100 text-yellow-700">
                Costo invertido: $
                {Math.round(convertedCostARS).toLocaleString("es-AR")} ARS
              </div>
            )}

            {/* Ganancia estimada */}
            {parsedPrice > 0 && (
              <div
                className={`p-4 rounded-lg font-bold text-lg ${
                  profit > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                Ganancia estimada: $
                {Math.round(profit).toLocaleString("es-AR")}
              </div>
            )}

            <Button
              onClick={handleAdd}
              disabled={!name || profit <= 0}
              className="w-full"
            >
              <Plus className="w-5 h-5 mr-2" />
              Agregar a lista de compras
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de productos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Lista para comprar
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-center text-gray-500">No hay productos aún</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Costo CLP</TableHead>
                  <TableHead>Venta ARS</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Ganancia</TableHead>
                  <TableHead>Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>${p.costCLP.toLocaleString()}</TableCell>
                    <TableCell>${p.priceARS.toLocaleString()}</TableCell>
                    <TableCell>{p.quantity}</TableCell>
                    <TableCell
                      className={
                        p.profit > 0
                          ? "text-green-600 font-semibold"
                          : "text-red-600"
                      }
                    >
                      ${Math.round(p.profit).toLocaleString("es-AR")}
                    </TableCell>
                    <TableCell>
                      {p.url ? (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Ver producto
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
