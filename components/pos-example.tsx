"use client"

import React from "react"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Trash2, Calculator } from "lucide-react"

// --- Schema dinámico ---
const createOrderSchema = (hasUserId, isDebt) => {
  const baseSchema = {
    user_id: z.string().optional(),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          name: z.string().optional(),
          quantity: z.number().min(1),
          price: z.number().min(0),
        }),
      )
      .min(1),
    payment_type: z.enum(["card", "cash"]),
  }
  if (hasUserId) {
    baseSchema.payment_status = z.enum(["debt", "paid"])
    if (isDebt) baseSchema.amount_paid = z.number().min(0)
  }
  return z.object(baseSchema)
}

// --- Mock categories ---
const MOCK_CATEGORIES = [
  { id: "c1", name: "Bebidas" },
  { id: "c2", name: "Comidas" },
  { id: "c3", name: "Promos" },
]

// --- Centro: productos ---
function ProductCenter({ onAddProduct }) {
  const [query, setQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState(null)
  const [products, setProducts] = React.useState([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const res = await fetch("http://localhost:4000/products/find")
        if (!res.ok) throw new Error("Error al obtener productos")
        const data = await res.json()
        const dataWithFeatured = data.map((p) => ({
          ...p,
          featured: p.featured ?? false,
        }))
        setProducts(dataWithFeatured)
      } catch (err) {
        console.error(err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filtered = React.useMemo(() => {
    return products.filter((p) => {
      if (activeCategory && p.category_id !== activeCategory) return false
      if (query) return p.name.toLowerCase().includes(query.toLowerCase())
      return true
    })
  }, [products, activeCategory, query])

  const featured = React.useMemo(() => {
    const f = products.filter((p) => p.featured)
    return f.length ? f : products
  }, [products])

  if (loading) return <div className="p-4">Cargando productos...</div>

  const productsToShow = query || activeCategory ? filtered : featured

  return (
    <div className="p-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar productos..."
        className="w-full px-3 py-2 rounded-lg border mb-3 focus:ring-2 focus:ring-green-500"
      />

      <div className="flex gap-2 flex-wrap mb-3">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1 rounded-full border ${!activeCategory ? "bg-green-600 text-white" : "bg-white"}`}
        >
          Todas
        </button>
        {MOCK_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3 py-1 rounded-full border ${
              activeCategory === c.id ? "bg-green-600 text-white" : "bg-white"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <h4 className="font-semibold mb-2">{query || activeCategory ? "Resultados" : "Destacados"}</h4>

      {productsToShow.length === 0 ? (
        <div className="text-gray-500 text-sm">No hay productos disponibles</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {productsToShow.map((p) => (
            <div key={p._id} className="bg-white p-3 rounded-lg border shadow-sm flex flex-col justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-gray-500">${Number(p.price ?? 0).toFixed(2)}</div>
              </div>
              <button
                onClick={() =>
                  onAddProduct({
                    productId: p._id,
                    name: p.name,
                    quantity: 1,
                    price: Number(p.price ?? 0),
                  })
                }
                className="mt-3 px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              >
                Añadir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Derecha: formulario POS ---
function RightPOS({ form, fields, remove }) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
    reset,
  } = form

  const watchedUserId = useWatch({ control, name: "user_id" })
  const watchedPaymentStatus = useWatch({ control, name: "payment_status" })
  const watchedItems = useWatch({ control, name: "items" }) || []

  const hasUserId = Boolean(watchedUserId?.trim())
  const isDebt = watchedPaymentStatus === "debt"
  const shouldShowPaymentStatus = hasUserId
  const shouldShowAmountPaid = hasUserId && isDebt

  const totalAmount = React.useMemo(
    () => (watchedItems || []).reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.price || 0), 0) || 0,
    [watchedItems],
  )

  React.useEffect(() => {
    clearErrors()
    if (!hasUserId) {
      setValue("payment_status", undefined)
      setValue("amount_paid", undefined)
    }
    if (hasUserId && !isDebt) setValue("amount_paid", undefined)
  }, [hasUserId, isDebt, setValue, clearErrors])

  const onSubmit = (data) => {
    const submitData = { ...data }
    if (!hasUserId) {
      submitData.amount_paid = totalAmount
      submitData.payment_status = "paid"
      delete submitData.user_id
    } else if (!isDebt) submitData.amount_paid = totalAmount

    console.log("Enviar a backend:", submitData)
    reset({
      user_id: "",
      items: [],
      payment_type: "card",
      payment_status: undefined,
      amount_paid: 0,
    })
    alert("Venta procesada")
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-2">Point of Sale</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="text-xs font-semibold">Cliente (Opcional)</label>
          <input {...register("user_id")} className="w-full px-3 py-2 border rounded mt-1" placeholder="ID cliente" />
          {errors.user_id && <p className="text-red-500 text-xs">{errors.user_id.message}</p>}
        </div>

        {/* Productos añadidos */}
        <div>
          <label className="text-xs font-semibold">Productos añadidos</label>
          {fields.length === 0 ? (
            <p className="text-gray-500 text-sm mt-1">No hay productos seleccionados</p>
          ) : (
            <div className="space-y-2 mt-2">
              {fields.map((f, idx) => (
                <div key={f.id} className="flex justify-between items-center bg-gray-50 border rounded px-3 py-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{f.name || "—"}</p>
                    <p className="text-xs text-gray-500">${Number(f.price ?? 0).toFixed(2)}</p>
                    {/* Subtotal pequeño */}
                    <p className="text-xs text-gray-600 mt-1">
                      Subtotal: ${(Number(f.price ?? 0) * Number(f.quantity ?? 0)).toFixed(2)}
                    </p>

                    {/* Hidden inputs para asegurar que productId/name/price se envían */}
                    <input type="hidden" {...register(`items.${idx}.productId`)} defaultValue={f.productId} />
                    <input type="hidden" {...register(`items.${idx}.name`)} defaultValue={f.name} />
                    <input
                      type="hidden"
                      {...register(`items.${idx}.price`, {
                        valueAsNumber: true,
                      })}
                      defaultValue={f.price}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      defaultValue={f.quantity}
                      {...register(`items.${idx}.quantity`, {
                        valueAsNumber: true,
                      })}
                      className="w-16 px-2 py-1 border rounded text-center"
                    />
                    <button type="button" onClick={() => remove(idx)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-2 p-2 bg-gray-50 rounded border flex justify-between items-center">
          <span className="flex items-center gap-1 text-sm font-semibold">
            <Calculator size={14} /> Total
          </span>
          <span className="font-bold">${totalAmount.toFixed(2)}</span>
        </div>

        <div className="mt-2">
          <label className="text-sm font-semibold">Método de Pago</label>
          <select {...register("payment_type")} className="w-full px-3 py-2 border rounded mt-1">
            <option value="card">Tarjeta</option>
            <option value="cash">Efectivo</option>
          </select>
        </div>

        {shouldShowPaymentStatus && (
          <div className="mt-2">
            <label className="text-sm font-semibold">Estado del Pago</label>
            <select {...register("payment_status")} className="w-full px-3 py-2 border rounded mt-1">
              <option value="">Seleccionar...</option>
              <option value="paid">Pago Completo (${totalAmount.toFixed(2)})</option>
              <option value="debt">Pago Parcial / A Cuenta</option>
            </select>
          </div>
        )}

        {shouldShowAmountPaid && (
          <div className="mt-2">
            <label className="text-sm font-semibold">Monto a Pagar Ahora</label>
            <input
              type="number"
              step="0.01"
              max={totalAmount}
              {...register("amount_paid", { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded mt-1"
            />
            <div className="text-xs text-gray-500">
              Deuda restante: ${Math.max(0, totalAmount - (watch("amount_paid") || 0)).toFixed(2)}
            </div>
          </div>
        )}

        <button type="submit" className="w-full py-2 rounded bg-green-600 text-white font-semibold">
          {isSubmitting ? "Procesando..." : "Procesar Venta"}
        </button>
      </form>
    </div>
  )
}

// --- POS Page ---
export default function POSPage() {
  const form = useForm({
    resolver: zodResolver(createOrderSchema(false, false)),
    defaultValues: {
      user_id: "",
      items: [], // empezamos vacío
      payment_type: "card",
      payment_status: undefined,
      amount_paid: 0,
    },
  })

  const { control, getValues } = form

  // useFieldArray en el padre para poder usar append/update/remove desde acá
  const { fields, append, update, remove } = useFieldArray({
    control,
    name: "items",
  })

  const addProductFromCenter = (product) => {
    const values = getValues()
    const items = values.items || []
    const idx = items.findIndex((i) => i.productId === product.productId)

    if (idx >= 0) {
      const currentQty = Number(items[idx].quantity || 0)
      const toAdd = Number(product.quantity || 1)
      update(idx, { ...items[idx], quantity: currentQty + toAdd })
    } else {
      // append espera shape: { productId, name, quantity, price }
      append({
        productId: product.productId,
        name: product.name,
        quantity: Number(product.quantity || 1),
        price: Number(product.price || 0),
      })
    }
  }

  return (
    <div className="max-w-7xl mx-auto h-screen grid grid-cols-12 gap-4 p-4">
      <div className="col-span-7 bg-gray-50 rounded-lg overflow-auto shadow-inner">
        <ProductCenter onAddProduct={addProductFromCenter} />
      </div>

      <div className="col-span-5 bg-white rounded-lg overflow-auto shadow-inner p-4">
        <RightPOS form={form} fields={fields} remove={remove} />
      </div>
    </div>
  )
}
