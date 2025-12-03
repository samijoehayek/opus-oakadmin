import Link from "next/link";
import { Package, Plus } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to the admin panel</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/products"
          className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
        >
          <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">View Products</h3>
            <p className="text-sm text-gray-500">Manage your product catalog</p>
          </div>
        </Link>

        <Link
          href="/admin/products/new"
          className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
        >
          <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
            <Plus className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Add Product</h3>
            <p className="text-sm text-gray-500">Create a new product</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
