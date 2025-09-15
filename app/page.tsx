"use client"


import { z } from "zod"
import { BarChart3, Users, Package, Shield, ShoppingCart, X, Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth, hasPermission, type UserRole } from "@/components/auth-context"
import { useMemo, useState } from "react"

interface Product {
  id: string
  name: string
  description?: string
  price: number
  categoryId: string
  stock: number
  barcode?: string
  featured?: boolean
}

interface Category {
  id: string
  name: string
  description?: string
  color?: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  creditLimit: number
  currentDebt: number
  isActive: boolean
}

interface Order {
  id: string
  customerId?: string
  items: Array<{ productId: string; name: string; quantity: number; price: number }>
  subtotal: number
  tax: number
  total: number
  paymentMethod: "cash" | "card" | "credit" | "partial"
  amountPaid: number
  status: "completed" | "pending" | "cancelled"
  createdAt: string
  employeeId?: string
}

interface Sale {
  id: string
  employeeId: string
  employeeName: string
  total: number
  items: number
  timestamp: string
  paymentMethod: string
}

interface Employee {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  hireDate: string
  phone: string
  totalSales: number
  totalTransactions: number
  averageTicket: number
}

const createOrderSchema = (hasCustomerId: boolean, isDebt: boolean) => {
  const baseSchema = {
    customer_id: z.string().optional(),
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
    payment_type: z.enum(["card", "cash", "credit"]),
  }
  if (hasCustomerId) {
    baseSchema.payment_status = z.enum(["debt", "paid"])
    if (isDebt) baseSchema.amount_paid = z.number().min(0)
  }
  return z.object(baseSchema)
}

const MOCK_CATEGORIES: Category[] = [
  { id: "1", name: "Bebidas", color: "bg-blue-500" },
  { id: "2", name: "Snacks", color: "bg-green-500" },
  { id: "3", name: "Comida", color: "bg-orange-500" },
]

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Coca Cola",
    description: "Refresco 500ml",
    price: 2.5,
    categoryId: "1",
    stock: 50,
    featured: true,
  },
  {
    id: "2",
    name: "Pepsi",
    description: "Refresco 500ml",
    price: 2.3,
    categoryId: "1",
    stock: 45,
    featured: true,
  },
  {
    id: "3",
    name: "Papas Fritas",
    description: "Papas naturales",
    price: 1.8,
    categoryId: "2",
    stock: 30,
    featured: false,
  },
  {
    id: "4",
    name: "Hamburguesa",
    description: "Con queso y papas",
    price: 8.5,
    categoryId: "3",
    stock: 15,
    featured: true,
  },
]

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juan@email.com",
    phone: "123456789",
    creditLimit: 500,
    currentDebt: 125.5,
    isActive: true,
  },
  {
    id: "2",
    name: "María García",
    email: "maria@email.com",
    phone: "987654321",
    creditLimit: 300,
    currentDebt: 0,
    isActive: true,
  },
]

const MOCK_SALES: Sale[] = [
  // Ventas de hoy
  {
    id: "1",
    employeeId: "1",
    employeeName: "Juan Cajero",
    total: 25.5,
    items: 3,
    timestamp: "2024-01-15T10:30:00",
    paymentMethod: "card",
  },
  {
    id: "2",
    employeeId: "1",
    employeeName: "Juan Cajero",
    total: 45.75,
    items: 5,
    timestamp: "2024-01-15T11:15:00",
    paymentMethod: "cash",
  },
  {
    id: "3",
    employeeId: "2",
    employeeName: "María Admin",
    total: 120.0,
    items: 8,
    timestamp: "2024-01-15T14:20:00",
    paymentMethod: "credit",
  },
  // Ventas de ayer
  {
    id: "4",
    employeeId: "1",
    employeeName: "Juan Cajero",
    total: 85.25,
    items: 6,
    timestamp: "2024-01-14T09:45:00",
    paymentMethod: "card",
  },
  {
    id: "5",
    employeeId: "1",
    employeeName: "Juan Cajero",
    total: 67.5,
    items: 4,
    timestamp: "2024-01-14T16:30:00",
    paymentMethod: "cash",
  },
  // Ventas de la semana pasada
  {
    id: "6",
    employeeId: "2",
    employeeName: "María Admin",
    total: 156.75,
    items: 12,
    timestamp: "2024-01-10T13:20:00",
    paymentMethod: "card",
  },
  {
    id: "7",
    employeeId: "1",
    employeeName: "Juan Cajero",
    total: 234.5,
    items: 15,
    timestamp: "2024-01-09T11:45:00",
    paymentMethod: "cash",
  },
]

const MOCK_PRODUCT_SALES = [
  { productId: "1", productName: "Coca Cola", quantitySold: 45, revenue: 112.5 },
  { productId: "4", productName: "Hamburguesa", quantitySold: 12, revenue: 102.0 },
  { productId: "2", productName: "Pepsi", quantitySold: 38, revenue: 87.4 },
  { productId: "3", productName: "Papas Fritas", quantitySold: 25, revenue: 45.0 },
]

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "1",
    name: "Juan Cajero",
    email: "cajero@pos.com",
    role: "user",
    isActive: true,
    hireDate: "2024-01-01",
    phone: "+1234567890",
    totalSales: 2450.75,
    totalTransactions: 45,
    averageTicket: 54.46,
  },
  {
    id: "2",
    name: "María Admin",
    email: "admin@pos.com",
    role: "admin",
    isActive: true,
    hireDate: "2023-12-15",
    phone: "+1234567891",
    totalSales: 1875.25,
    totalTransactions: 32,
    averageTicket: 58.6,
  },
  {
    id: "3",
    name: "Carlos SuperAdmin",
    email: "super@pos.com",
    role: "super_admin",
    isActive: true,
    hireDate: "2023-11-01",
    phone: "+1234567892",
    totalSales: 3200.5,
    totalTransactions: 58,
    averageTicket: 55.18,
  },
  {
    id: "4",
    name: "Ana Cajera",
    email: "ana@pos.com",
    role: "user",
    isActive: false,
    hireDate: "2024-02-01",
    phone: "+1234567893",
    totalSales: 890.25,
    totalTransactions: 18,
    averageTicket: 49.46,
  },
]

function Sidebar({
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen,
}: {
  activeView: string
  setActiveView: (view: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}) {
  const { user, logout } = useAuth()

  const menuItems = [
    { id: "pos", label: "Punto de Venta", icon: ShoppingCart, requiredRole: "user" as UserRole },
    { id: "sales", label: "Ventas", icon: BarChart3, requiredRole: "user" as UserRole },
    { id: "products", label: "Productos", icon: Package, requiredRole: "admin" as UserRole },
    { id: "users", label: "Usuarios", icon: Users, requiredRole: "admin" as UserRole },
    { id: "employees", label: "Empleados", icon: Shield, requiredRole: "super_admin" as UserRole },
  ]

  const filteredMenuItems = menuItems.filter((item) => user && hasPermission(user.role, item.requiredRole))

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-800">POS System</h1>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="lg:hidden">
                <X className="h-4 w-4" />
              </Button>
            </div>
            {user && (
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs capitalize">{user.role.replace("_", " ")}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id)
                      setSidebarOpen(false)
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                      ${
                        activeView === item.id
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={logout}
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

function POSSystem() {
  const [activeView, setActiveView] = useState("pos")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [fields, setFields] = useState<any[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today")

  const addProduct = (product: any) => {
    const existingIndex = fields.findIndex((item) => item.productId === product.productId)

    if (existingIndex >= 0) {
      const newFields = [...fields]
      newFields[existingIndex].quantity += 1
      setFields(newFields)
    } else {
      setFields([...fields, product])
    }
  }

  const removeProduct = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const renderContent = () => {
    switch (activeView) {
      case "pos":
        return (
          <div className="h-full flex flex-col lg:flex-row">
            <div className="flex-1 lg:flex-[2]">
              <ProductCenter onAddProduct={addProduct} />
            </div>
            <div className="w-full lg:w-96 lg:flex-shrink-0">
              <RightPOS form={null} fields={fields} remove={removeProduct} />
            </div>
          </div>
        )
      case "sales":
      case "products":
      case "users":
      case "employees":
        return (
          <AdminPanel
            initialTab={activeView as any}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
          />
        )
      default:
        return <div>Página no encontrada</div>
    }
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-gray-800">
              {activeView === "pos"
                ? "Punto de Venta"
                : activeView === "sales"
                  ? "Ventas"
                  : activeView === "products"
                    ? "Productos"
                    : activeView === "users"
                      ? "Usuarios"
                      : activeView === "employees"
                        ? "Empleados"
                        : "POS System"}
            </h1>
            <div className="w-8" />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">{renderContent()}</div>
      </div>
    </div>
  )
}

function RoleBasedContent({ children, requiredRole }: { children: React.ReactNode; requiredRole: UserRole }) {
  const { user } = useAuth()

  if (!user || !hasPermission(user.role, requiredRole)) {
    return null
  }

  return <>{children}</>
}

function ProductCenter({ onAddProduct }: { onAddProduct: (product: any) => void }) {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [products] = useState(MOCK_PRODUCTS)

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory && p.categoryId !== activeCategory) return false
      if (query) return p.name.toLowerCase().includes(query.toLowerCase())
      return true
    })
  }, [products, activeCategory, query])

  const featured = useMemo(() => {
    const f = products.filter((p) => p.featured)
    return f.length ? f : products
  }, [products])

  const productsToShow = query || activeCategory ? filtered : featured

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-4 lg:mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full px-3 py-2 lg:px-4 lg:py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-base lg:text-lg"
        />
      </div>

      <div className="flex gap-2 lg:gap-3 flex-wrap mb-4 lg:mb-6">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-full font-medium transition-colors text-sm lg:text-base ${
            !activeCategory ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Todas
        </button>
        {MOCK_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-full font-medium transition-colors text-sm lg:text-base ${
              activeCategory === c.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <h4 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4 text-gray-800">
        {query || activeCategory ? "Resultados" : "Productos Destacados"}
      </h4>

      {productsToShow.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No hay productos disponibles</div>
      ) : (
        /* Responsive product grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
          {productsToShow.map((p) => (
            <Card key={p.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-3 lg:p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-base lg:text-lg text-gray-800 line-clamp-1">{p.name}</h3>
                  <p className="text-xs lg:text-sm text-gray-600 line-clamp-2">{p.description}</p>
                  <p className="text-lg lg:text-xl font-bold text-blue-600 mt-2">${p.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Stock: {p.stock}</p>
                </div>
                <Button
                  onClick={() =>
                    onAddProduct({
                      productId: p.id,
                      name: p.name,
                      quantity: 1,
                      price: p.price,
                    })
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-sm lg:text-base"
                  disabled={p.stock <= 0}
                >
                  {p.stock <= 0 ? "Sin Stock" : "Añadir"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function RightPOS({ form, fields, remove }: any) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "credit">("cash")
  const [amountPaid, setAmountPaid] = useState("")
  const [showCustomerModal, setShowCustomerModal] = useState(false)

  const subtotal = fields.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.16
  const total = subtotal + tax

  const processOrder = () => {
    if (fields.length === 0) return

    const order = {
      id: Date.now().toString(),
      items: fields,
      subtotal,
      tax,
      total,
      customer: selectedCustomer,
      paymentMethod,
      amountPaid: Number.parseFloat(amountPaid) || total,
      timestamp: new Date(),
      cashier: "Juan Pérez",
    }

    console.log("Orden procesada:", order)

    // Reset form
    fields.forEach((_: any, index: number) => remove(index))
    setSelectedCustomer(null)
    setAmountPaid("")
    setPaymentMethod("cash")
  }

  return (
    <div className="h-full flex flex-col bg-white lg:bg-gray-50">
      <div className="p-4 lg:p-6 border-b bg-white">
        <h2 className="text-lg lg:text-xl font-bold text-gray-800">Carrito de Compras</h2>
      </div>

      <div className="flex-1 overflow-auto p-4 lg:p-6 bg-white">
        {fields.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Carrito vacío</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm lg:text-base text-gray-800 truncate">{item.name}</h4>
                  <p className="text-xs lg:text-sm text-gray-600">
                    ${item.price.toFixed(2)} x {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <span className="font-bold text-sm lg:text-base text-blue-600">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <Button onClick={() => remove(index)} variant="outline" size="sm" className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {fields.length > 0 && (
        <div className="border-t bg-white p-4 lg:p-6 space-y-4">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCustomerModal(true)}
                variant="outline"
                className="flex-1 justify-start text-left"
              >
                {selectedCustomer ? selectedCustomer.name : "Seleccionar cliente"}
              </Button>
              {selectedCustomer && (
                <Button onClick={() => setSelectedCustomer(null)} variant="outline" size="sm" className="px-3">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => setPaymentMethod("cash")}
                variant={paymentMethod === "cash" ? "default" : "outline"}
                size="sm"
                className="text-xs lg:text-sm"
              >
                Efectivo
              </Button>
              <Button
                onClick={() => setPaymentMethod("card")}
                variant={paymentMethod === "card" ? "default" : "outline"}
                size="sm"
                className="text-xs lg:text-sm"
              >
                Tarjeta
              </Button>
              <Button
                onClick={() => setPaymentMethod("credit")}
                variant={paymentMethod === "credit" ? "default" : "outline"}
                size="sm"
                className="text-xs lg:text-sm"
                disabled={!selectedCustomer}
              >
                Crédito
              </Button>
            </div>
          </div>

          {/* Amount Paid */}
          {paymentMethod !== "credit" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monto Pagado</label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder={total.toFixed(2)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Totals */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>IVA (16%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Process Order Button */}
          <Button onClick={processOrder} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3">
            Procesar Venta
          </Button>
        </div>
      )}

      {/* Customer Selection Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Seleccionar Cliente</h3>
              <Button onClick={() => setShowCustomerModal(false)} variant="outline" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {MOCK_CUSTOMERS.map((customer) => (
                <Button
                  key={customer.id}
                  onClick={() => {
                    setSelectedCustomer(customer)
                    setShowCustomerModal(false)
                  }}
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.email}</div>
                    {customer.currentDebt > 0 && (
                      <div className="text-sm text-red-600">Deuda: ${customer.currentDebt.toFixed(2)}</div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminPanel({
  initialTab = "sales",
  selectedPeriod,
  setSelectedPeriod,
}: {
  initialTab?: "sales" | "products" | "users" | "employees"
  selectedPeriod: "today" | "week" | "month"
  setSelectedPeriod: (period: "today" | "week" | "month") => void
}) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"sales" | "products" | "users" | "employees">(initialTab)

  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES)
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES)
  const [showProductForm, setShowProductForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null)

  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS)
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearchQuery, setCustomerSearchQuery] = useState("")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")

  const getDateRange = (period: "today" | "week" | "month") => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (period) {
      case "today":
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
      case "week":
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 7)
        return { start: weekStart, end: weekEnd }
      case "month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        return { start: monthStart, end: monthEnd }
    }
  }

  const getSalesForPeriod = (period: "today" | "week" | "month") => {
    const { start, end } = getDateRange(period)
    return MOCK_SALES.filter((sale) => {
      const saleDate = new Date(sale.timestamp)
      return saleDate >= start && saleDate < end
    })
  }

  const todaySales = getSalesForPeriod("today")
  const weekSales = getSalesForPeriod("week")
  const monthSales = getSalesForPeriod("month")

  const currentSales = getSalesForPeriod(selectedPeriod)
  const totalCurrent = currentSales.reduce((sum, sale) => sum + sale.total, 0)
  const transactionsCurrent = currentSales.length

  const getPreviousPeriodSales = (period: "today" | "week" | "month") => {
    const now = new Date()
    let previousStart: Date, previousEnd: Date

    switch (period) {
      case "today":
        previousStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        previousEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case "week":
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay() - 7)
        previousStart = weekStart
        previousEnd = new Date(weekStart)
        previousEnd.setDate(weekStart.getDate() + 7)
        break
      case "month":
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        previousEnd = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    return MOCK_SALES.filter((sale) => {
      const saleDate = new Date(sale.timestamp)
      return saleDate >= previousStart && saleDate < previousEnd
    })
  }

  const previousSales = getPreviousPeriodSales(selectedPeriod)
  const previousTotal = previousSales.reduce((sum, sale) => sum + sale.total, 0)
  const growthPercentage = previousTotal > 0 ? ((totalCurrent - previousTotal) / previousTotal) * 100 : 0

  const salesByEmployee = currentSales.reduce(
    (acc, sale) => {
      acc[sale.employeeName] = (acc[sale.employeeName] || 0) + sale.total
      return acc
    },
    {} as Record<string, number>,
  )

  const averageTicket = transactionsCurrent > 0 ? totalCurrent / transactionsCurrent : 0
  const totalItems = currentSales.reduce((sum, sale) => sum + sale.items, 0)

  const paymentMethodStats = currentSales.reduce(
    (acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const handleAddEmployee = (employeeData: Partial<Employee>) => {
    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: employeeData.name || "",
      email: employeeData.email || "",
      role: employeeData.role || "user",
      isActive: true,
      hireDate: new Date().toISOString().split("T")[0],
      phone: employeeData.phone || "",
      totalSales: 0,
      totalTransactions: 0,
      averageTicket: 0,
    }
    setEmployees([...employees, newEmployee])
    setShowEmployeeForm(false)
  }

  const handleEditEmployee = (employeeData: Partial<Employee>) => {
    if (!editingEmployee) return

    setEmployees(employees.map((emp) => (emp.id === editingEmployee.id ? { ...emp, ...employeeData } : emp)))
    setEditingEmployee(null)
    setShowEmployeeForm(false)
  }

  const handleToggleEmployeeStatus = (employeeId: string) => {
    setEmployees(employees.map((emp) => (emp.id === employeeId ? { ...emp, isActive: !emp.isActive } : emp)))
  }

  const getEmployeeSalesForPeriod = (employeeId: string, period: "today" | "week" | "month") => {
    const periodSales = getSalesForPeriod(period)
    return periodSales.filter((sale) => sale.employeeId === employeeId)
  }

  const handleAddProduct = (productData: Partial<Product>) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: productData.name || "",
      description: productData.description || "",
      price: productData.price || 0,
      categoryId: productData.categoryId || "",
      stock: productData.stock || 0,
      barcode: productData.barcode || "",
      featured: productData.featured || false,
    }
    setProducts([...products, newProduct])
    setShowProductForm(false)
  }

  const handleEditProduct = (productData: Partial<Product>) => {
    if (!editingProduct) return
    setProducts(products.map((prod) => (prod.id === editingProduct.id ? { ...prod, ...productData } : prod)))
    setEditingProduct(null)
    setShowProductForm(false)
  }

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter((prod) => prod.id !== productId))
  }

  const handleAddCategory = (categoryData: Partial<Category>) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: categoryData.name || "",
      description: categoryData.description || "",
      color: categoryData.color || "bg-gray-500",
    }
    setCategories([...categories, newCategory])
    setShowCategoryForm(false)
  }

  const handleEditCategory = (categoryData: Partial<Category>) => {
    if (!editingCategory) return
    setCategories(categories.map((cat) => (cat.id === editingCategory.id ? { ...cat, ...categoryData } : cat)))
    setEditingCategory(null)
    setShowCategoryForm(false)
  }

  const handleDeleteCategory = (categoryId: string) => {
    // Check if category has products
    const hasProducts = products.some((prod) => prod.categoryId === categoryId)
    if (hasProducts) {
      alert("No se puede eliminar una categoría que tiene productos asignados")
      return
    }
    setCategories(categories.filter((cat) => cat.id !== categoryId))
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      product.barcode?.includes(productSearchQuery)
    const matchesCategory = !selectedCategoryFilter || product.categoryId === selectedCategoryFilter
    return matchesSearch && matchesCategory
  })

  const handleAddCustomer = (customerData: Partial<Customer>) => {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: customerData.name || "",
      email: customerData.email || "",
      phone: customerData.phone || "",
      creditLimit: customerData.creditLimit || 0,
      currentDebt: 0,
      isActive: true,
    }
    setCustomers([...customers, newCustomer])
    setShowCustomerForm(false)
  }

  const handleEditCustomer = (customerData: Partial<Customer>) => {
    if (!editingCustomer) return
    setCustomers(customers.map((cust) => (cust.id === editingCustomer.id ? { ...cust, ...customerData } : cust)))
    setEditingCustomer(null)
    setShowCustomerForm(false)
  }

  const handleToggleCustomerStatus = (customerId: string) => {
    setCustomers(customers.map((cust) => (cust.id === customerId ? { ...cust, isActive: !cust.isActive } : cust)))
  }

  const handlePayment = (customerId: string, amount: number) => {
    setCustomers(
      customers.map((cust) =>
        cust.id === customerId ? { ...cust, currentDebt: Math.max(0, cust.currentDebt - amount) } : cust,
      ),
    )
    setShowPaymentModal(false)
    setSelectedCustomer(null)
    setPaymentAmount("")
  }

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.phone.includes(customerSearchQuery)
    return matchesSearch
  })

  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<Customer | null>(null)
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    creditLimit: 0,
  })

  const handleSaveUser = () => {
    if (editingUser) {
      // Update existing user
      const updatedCustomers = customers.map((c) =>
        c.id === editingUser.id
          ? {
              ...c,
              name: userForm.name,
              email: userForm.email,
              phone: userForm.phone,
              creditLimit: userForm.creditLimit,
            }
          : c,
      )
      setCustomers(updatedCustomers)
      setEditingUser(null)
    } else {
      // Create new user
      const newUser: Customer = {
        id: Date.now().toString(),
        name: userForm.name,
        email: userForm.email,
        phone: userForm.phone,
        creditLimit: userForm.creditLimit,
        currentDebt: 0,
        isActive: true,
      }
      setCustomers([...customers, newUser])
    }

    setShowUserModal(false)
    setUserForm({
      name: "",
      email: "",
      phone: "",
      creditLimit: 0,
    })
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="space-y-6">
        <div className="flex gap-2 mb-6">
          <Button onClick={() => setActiveTab("sales")} variant={activeTab === "sales" ? "default" : "outline"}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Ventas
          </Button>

          <RoleBasedContent requiredRole="admin">
            <Button onClick={() => setActiveTab("products")} variant={activeTab === "products" ? "default" : "outline"}>
              <Package className="h-4 w-4 mr-2" />
              Productos
            </Button>
            <Button onClick={() => setActiveTab("users")} variant={activeTab === "users" ? "default" : "outline"}>
              <Users className="h-4 w-4 mr-2" />
              Usuarios
            </Button>
          </RoleBasedContent>

          <RoleBasedContent requiredRole="super_admin">
            <Button
              onClick={() => setActiveTab("employees")}
              variant={activeTab === "employees" ? "default" : "outline"}
            >
              <Shield className="h-4 w-4 mr-2" />
              Empleados
            </Button>
          </RoleBasedContent>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setSelectedPeriod("today")}
            variant={selectedPeriod === "today" ? "default" : "outline"}
          >
            Hoy
          </Button>
          <Button onClick={() => setSelectedPeriod("week")} variant={selectedPeriod === "week" ? "default" : "outline"}>
            Semana
          </Button>
          <Button
            onClick={() => setSelectedPeriod("month")}
            variant={selectedPeriod === "month" ? "default" : "outline"}
          >
            Mes
          </Button>
        </div>

        {/* Sales Content */}
        {activeTab === "sales" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-bold mb-4">Ventas Totales</h3>
              <div className="flex justify-between">
                <span>Total Ventas:</span>
                <span>${totalCurrent.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Transacciones:</span>
                <span>{transactionsCurrent}</span>
              </div>
              <div className="flex justify-between">
                <span>Ticket Promedio:</span>
                <span>${averageTicket.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Crecimiento:</span>
                <span>{growthPercentage.toFixed(2)}%</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-bold mb-4">Ventas por Empleado</h3>
              <ul className="space-y-2">
                {Object.entries(salesByEmployee).map(([employeeName, total]) => (
                  <li key={employeeName}>
                    <span>{employeeName}:</span>
                    <span>${total.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-bold mb-4">Métodos de Pago</h3>
              <ul className="space-y-2">
                {Object.entries(paymentMethodStats).map(([paymentMethod, count]) => (
                  <li key={paymentMethod}>
                    <span>{paymentMethod}:</span>
                    <span>{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Products Content */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-bold mb-4">Lista de Productos</h3>
              <ul className="space-y-2">
                {filteredProducts.map((product) => (
                  <li key={product.id}>
                    <span>{product.name}:</span>
                    <span>${product.price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Users Content */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-bold mb-4">Lista de Usuarios</h3>
              <ul className="space-y-2">
                {filteredCustomers.map((customer) => (
                  <li key={customer.id}>
                    <span>{customer.name}:</span>
                    <span>{customer.email}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Employees Content */}
        {activeTab === "employees" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-bold mb-4">Lista de Empleados</h3>
              <ul className="space-y-2">
                {employees.map((employee) => (
                  <li key={employee.id}>
                    <span>{employee.name}:</span>
                    <span>{employee.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default POSSystem
