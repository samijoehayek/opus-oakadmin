"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
  GripVertical,
  Box,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Product,
  ProductSize,
  Fabric,
  FabricCategory,
} from "@/types/product";

// ===========================================
// TYPES
// ===========================================

interface ProductFormProps {
  product?: Product;
  isEditing?: boolean;
}

interface UploadedFile {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  type: "image" | "model";
}

interface ImageItem {
  id?: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface ModelData {
  lowPolyUrl: string;
  highPolyUrl?: string;
  posterUrl?: string;
  environmentPreset: string;
  scale: number;
  autoRotate: boolean;
}

interface SizeItem {
  id: string;
  label: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
    seatHeight?: number;
  };
  bedDimensions?: {
    width: number;
    length: number;
  };
  inStock: boolean;
  leadTime?: string;
  sortOrder: number;
  isDefault: boolean;
}

interface FabricItem {
  id: string;
  name: string;
  hexColor: string;
  textureUrl?: string;
  price: number;
  inStock: boolean;
  category: string;
  sortOrder: number;
  isDefault: boolean;
}

interface FabricCategoryItem {
  id: string;
  name: string;
  sortOrder: number;
  fabrics: FabricItem[];
}

interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface SpecificationItem {
  label: string;
  value: string;
}

// ===========================================
// CONSTANTS
// ===========================================

const CATEGORIES = [
  { value: "SOFAS", label: "Sofas" },
  { value: "BEDS", label: "Beds" },
  { value: "TABLES", label: "Tables" },
  { value: "CHAIRS", label: "Chairs" },
  { value: "STORAGE", label: "Storage" },
  { value: "LIGHTING", label: "Lighting" },
  { value: "OUTDOOR", label: "Outdoor" },
  { value: "ACCESSORIES", label: "Accessories" },
];

const ENVIRONMENT_PRESETS = [
  { value: "STUDIO", label: "Studio" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "CITY", label: "City" },
  { value: "DAWN", label: "Dawn" },
  { value: "FOREST", label: "Forest" },
  { value: "LOBBY", label: "Lobby" },
  { value: "NIGHT", label: "Night" },
  { value: "PARK", label: "Park" },
  { value: "SUNSET", label: "Sunset" },
  { value: "WAREHOUSE", label: "Warehouse" },
];

const FEATURE_ICONS = [
  { value: "sparkles", label: "✨ Sparkles" },
  { value: "hammer", label: "🔨 Hammer" },
  { value: "cloud", label: "☁️ Cloud" },
  { value: "bed", label: "🛏️ Bed" },
  { value: "frame", label: "🖼️ Frame" },
  { value: "truck", label: "🚚 Truck" },
  { value: "return", label: "↩️ Return" },
  { value: "shield", label: "🛡️ Shield" },
  { value: "leaf", label: "🍃 Leaf" },
  { value: "award", label: "🏆 Award" },
  { value: "heart", label: "❤️ Heart" },
  { value: "zap", label: "⚡ Zap" },
];

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function initializeFormData(product?: Product) {
  return {
    sku: product?.sku || "",
    name: product?.name || "",
    tagline: product?.tagline || "",
    description: product?.description || "",
    longDescription: product?.longDescription || "",
    category: product?.category || "SOFAS",
    subcategory: product?.subcategory || "",
    basePrice: product?.basePrice || 0,
    originalPrice: product?.originalPrice,
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    leadTimeDays: product?.leadTimeDays || 21,
    deliveryPrice: product?.deliveryInfo?.price || 0,
    deliveryInfo: product?.deliveryInfo?.description || "",
    returnDays: product?.returns?.days || 14,
    returnInfo: product?.returns?.description || "",
    warrantyYears: product?.warranty?.years || 2,
    warrantyInfo: product?.warranty?.description || "",
    madeIn: product?.madeIn || "",
    careInstructions: product?.careInstructions || [],
  };
}

function initializeImages(product?: Product): ImageItem[] {
  if (!product?.images) return [];
  return product.images.map((img, idx) => ({
    id: img.id,
    url: img.url,
    altText: img.altText,
    isPrimary: img.isPrimary,
    sortOrder: idx,
  }));
}

function initializeModel(product?: Product): ModelData | null {
  if (!product?.model) return null;
  return {
    lowPolyUrl: product.model.lowPolyUrl,
    highPolyUrl: product.model.highPolyUrl,
    posterUrl: product.model.posterUrl,
    environmentPreset: product.model.environmentPreset,
    scale: product.model.scale,
    autoRotate: product.model.controls.autoRotate,
  };
}

function initializeSizes(product?: Product): SizeItem[] {
  if (!product?.sizes) return [];
  return product.sizes.map((size) => ({
    id: size.id,
    label: size.label,
    sku: size.sku,
    price: size.price,
    originalPrice: size.originalPrice,
    dimensions: { ...size.dimensions },
    bedDimensions: size.bedDimensions ? { ...size.bedDimensions } : undefined,
    inStock: size.inStock,
    leadTime: size.leadTime,
    sortOrder: size.sortOrder,
    isDefault: size.isDefault,
  }));
}

function initializeFabricCategories(product?: Product): FabricCategoryItem[] {
  if (!product?.fabricCategories) return [];
  return product.fabricCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    sortOrder: cat.sortOrder,
    fabrics: product.fabrics
      .filter((f) => f.category === cat.name)
      .map((f) => ({
        id: f.id,
        name: f.name,
        hexColor: f.hexColor,
        textureUrl: f.textureUrl,
        price: f.price,
        inStock: f.inStock,
        category: f.category,
        sortOrder: f.sortOrder,
        isDefault: f.isDefault,
      })),
  }));
}

function initializeFeatures(product?: Product): FeatureItem[] {
  if (!product?.features) return [];
  return product.features.map((f) => ({
    id: f.id,
    icon: f.icon,
    title: f.title,
    description: f.description,
  }));
}

function initializeSpecifications(product?: Product): SpecificationItem[] {
  if (!product?.specifications) return [];
  return product.specifications.map((s) => ({
    label: s.label,
    value: s.value,
  }));
}

// ===========================================
// MAIN COMPONENT
// ===========================================

export function ProductForm({ product, isEditing = false }: ProductFormProps) {
  const router = useRouter();

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "basic" | "media" | "variants" | "details"
  >("basic");
  const [formData, setFormData] = useState(() => initializeFormData(product));
  const [images, setImages] = useState<ImageItem[]>(() =>
    initializeImages(product)
  );
  const [model, setModel] = useState<ModelData | null>(() =>
    initializeModel(product)
  );
  const [sizes, setSizes] = useState<SizeItem[]>(() =>
    initializeSizes(product)
  );
  const [fabricCategories, setFabricCategories] = useState<
    FabricCategoryItem[]
  >(() => initializeFabricCategories(product));
  const [features, setFeatures] = useState<FeatureItem[]>(() =>
    initializeFeatures(product)
  );
  const [specifications, setSpecifications] = useState<SpecificationItem[]>(
    () => initializeSpecifications(product)
  );

  // Upload states
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isUploadingModel, setIsUploadingModel] = useState(false);

  // ===========================================
  // FORM HANDLERS
  // ===========================================

  const updateFormField = useCallback(
    <K extends keyof typeof formData>(
      field: K,
      value: (typeof formData)[K]
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // ===========================================
  // IMAGE HANDLERS
  // ===========================================

  const handleImageUpload = async (files: FileList) => {
    setIsUploadingImages(true);
    const formDataUpload = new FormData();
    Array.from(files).forEach((file) => formDataUpload.append("files", file));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/uploads/images`,
        {
          method: "POST",
          credentials: "include",
          body: formDataUpload,
        }
      );

      if (!response.ok) throw new Error("Upload failed");

      const uploaded: UploadedFile[] = await response.json();
      const newImages: ImageItem[] = uploaded.map((file, idx) => ({
        url: file.url,
        altText: file.originalName,
        isPrimary: images.length === 0 && idx === 0,
        sortOrder: images.length + idx,
      }));

      setImages((prev) => [...prev, ...newImages]);
    } catch (error) {
      console.error("Failed to upload images:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setIsUploadingImages(false);
    }
  };

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      if (prev[index].isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }
      return newImages;
    });
  }, []);

  const setPrimaryImage = useCallback((index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index }))
    );
  }, []);

  // ===========================================
  // MODEL HANDLERS
  // ===========================================

  const handleModelUpload = async (file: File, type: "low" | "high") => {
    setIsUploadingModel(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/uploads/model`,
        {
          method: "POST",
          credentials: "include",
          body: formDataUpload,
        }
      );

      if (!response.ok) throw new Error("Upload failed");

      const uploaded: UploadedFile = await response.json();

      setModel((prev) => {
        const base: ModelData = prev || {
          lowPolyUrl: "",
          environmentPreset: "STUDIO",
          scale: 1,
          autoRotate: true,
        };

        if (type === "low") {
          return { ...base, lowPolyUrl: uploaded.url };
        } else {
          return { ...base, highPolyUrl: uploaded.url };
        }
      });
    } catch (error) {
      console.error("Failed to upload model:", error);
      alert("Failed to upload model. Please try again.");
    } finally {
      setIsUploadingModel(false);
    }
  };

  const removeModel = useCallback((type: "low" | "high") => {
    setModel((prev) => {
      if (!prev) return null;
      if (type === "low") {
        return { ...prev, lowPolyUrl: "" };
      } else {
        return { ...prev, highPolyUrl: undefined };
      }
    });
  }, []);

  const updateModelField = useCallback(
    <K extends keyof ModelData>(field: K, value: ModelData[K]) => {
      setModel((prev) => (prev ? { ...prev, [field]: value } : null));
    },
    []
  );

  // ===========================================
  // SIZE HANDLERS
  // ===========================================

  const addSize = useCallback(() => {
    setSizes((prev) => [
      ...prev,
      {
        id: generateTempId(),
        label: "",
        price: formData.basePrice,
        dimensions: { width: 0, height: 0, depth: 0 },
        inStock: true,
        sortOrder: prev.length,
        isDefault: prev.length === 0,
      },
    ]);
  }, [formData.basePrice]);

  const removeSize = useCallback((index: number) => {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateSize = useCallback(
    (index: number, updates: Partial<SizeItem>) => {
      setSizes((prev) =>
        prev.map((size, i) => (i === index ? { ...size, ...updates } : size))
      );
    },
    []
  );

  const updateSizeDimension = useCallback(
    (index: number, dimension: keyof SizeItem["dimensions"], value: number) => {
      setSizes((prev) =>
        prev.map((size, i) =>
          i === index
            ? {
                ...size,
                dimensions: { ...size.dimensions, [dimension]: value },
              }
            : size
        )
      );
    },
    []
  );

  const setDefaultSize = useCallback((index: number) => {
    setSizes((prev) =>
      prev.map((size, i) => ({ ...size, isDefault: i === index }))
    );
  }, []);

  // ===========================================
  // FABRIC CATEGORY HANDLERS
  // ===========================================

  const addFabricCategory = useCallback(() => {
    setFabricCategories((prev) => [
      ...prev,
      {
        id: generateTempId(),
        name: "",
        sortOrder: prev.length,
        fabrics: [],
      },
    ]);
  }, []);

  const removeFabricCategory = useCallback((index: number) => {
    setFabricCategories((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateFabricCategoryName = useCallback(
    (index: number, name: string) => {
      setFabricCategories((prev) =>
        prev.map((cat, i) => (i === index ? { ...cat, name } : cat))
      );
    },
    []
  );

  const addFabricToCategory = useCallback((categoryIndex: number) => {
    setFabricCategories((prev) =>
      prev.map((cat, i) =>
        i === categoryIndex
          ? {
              ...cat,
              fabrics: [
                ...cat.fabrics,
                {
                  id: generateTempId(),
                  name: "",
                  hexColor: "#CCCCCC",
                  price: 0,
                  inStock: true,
                  category: cat.name,
                  sortOrder: cat.fabrics.length,
                  isDefault: false,
                },
              ],
            }
          : cat
      )
    );
  }, []);

  const removeFabricFromCategory = useCallback(
    (categoryIndex: number, fabricIndex: number) => {
      setFabricCategories((prev) =>
        prev.map((cat, i) =>
          i === categoryIndex
            ? {
                ...cat,
                fabrics: cat.fabrics.filter((_, j) => j !== fabricIndex),
              }
            : cat
        )
      );
    },
    []
  );

  const updateFabric = useCallback(
    (
      categoryIndex: number,
      fabricIndex: number,
      updates: Partial<FabricItem>
    ) => {
      setFabricCategories((prev) =>
        prev.map((cat, i) =>
          i === categoryIndex
            ? {
                ...cat,
                fabrics: cat.fabrics.map((fabric, j) =>
                  j === fabricIndex ? { ...fabric, ...updates } : fabric
                ),
              }
            : cat
        )
      );
    },
    []
  );

  // ===========================================
  // FEATURE HANDLERS
  // ===========================================

  const addFeature = useCallback(() => {
    setFeatures((prev) => [
      ...prev,
      {
        id: generateTempId(),
        icon: "sparkles",
        title: "",
        description: "",
      },
    ]);
  }, []);

  const removeFeature = useCallback((index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateFeature = useCallback(
    (index: number, updates: Partial<FeatureItem>) => {
      setFeatures((prev) =>
        prev.map((feature, i) =>
          i === index ? { ...feature, ...updates } : feature
        )
      );
    },
    []
  );

  // ===========================================
  // SPECIFICATION HANDLERS
  // ===========================================

  const addSpecification = useCallback(() => {
    setSpecifications((prev) => [...prev, { label: "", value: "" }]);
  }, []);

  const removeSpecification = useCallback((index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateSpecification = useCallback(
    (index: number, updates: Partial<SpecificationItem>) => {
      setSpecifications((prev) =>
        prev.map((spec, i) => (i === index ? { ...spec, ...updates } : spec))
      );
    },
    []
  );

  // ===========================================
  // CARE INSTRUCTIONS HANDLERS
  // ===========================================

  const addCareInstruction = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      careInstructions: [...prev.careInstructions, ""],
    }));
  }, []);

  const removeCareInstruction = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      careInstructions: prev.careInstructions.filter((_, i) => i !== index),
    }));
  }, []);

  const updateCareInstruction = useCallback((index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      careInstructions: prev.careInstructions.map((c, i) =>
        i === index ? value : c
      ),
    }));
  }, []);

  // ===========================================
  // FORM SUBMISSION
  // ===========================================

  const buildRequestBody = () => {
    return {
      ...formData,
      images: images.map((img, idx) => ({
        url: img.url,
        altText: img.altText,
        isPrimary: img.isPrimary,
        sortOrder: idx,
      })),
      model: model?.lowPolyUrl
        ? {
            lowPolyUrl: model.lowPolyUrl,
            highPolyUrl: model.highPolyUrl,
            posterUrl: model.posterUrl,
            environmentPreset: model.environmentPreset,
            scale: model.scale,
            autoRotate: model.autoRotate,
          }
        : undefined,
      sizes: sizes.map((size, idx) => ({
        label: size.label,
        sku: size.sku,
        price: size.price,
        originalPrice: size.originalPrice,
        width: size.dimensions.width,
        height: size.dimensions.height,
        depth: size.dimensions.depth,
        seatHeight: size.dimensions.seatHeight,
        bedWidth: size.bedDimensions?.width,
        bedLength: size.bedDimensions?.length,
        inStock: size.inStock,
        leadTime: size.leadTime,
        sortOrder: idx,
        isDefault: size.isDefault,
      })),
      fabricCategories: fabricCategories.map((cat, idx) => ({
        name: cat.name,
        sortOrder: idx,
        fabrics: cat.fabrics.map((fabric, fIdx) => ({
          name: fabric.name,
          hexColor: fabric.hexColor,
          textureUrl: fabric.textureUrl,
          price: fabric.price,
          inStock: fabric.inStock,
          sortOrder: fIdx,
          isDefault: fabric.isDefault,
        })),
      })),
      features: features.map((f, idx) => ({
        icon: f.icon,
        title: f.title,
        description: f.description,
        sortOrder: idx,
      })),
      specifications: specifications.map((s, idx) => ({
        label: s.label,
        value: s.value,
        sortOrder: idx,
      })),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const body = buildRequestBody();

    try {
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_API_URL}/products/${product?.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/products`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to save product:", error);
      alert(error.message || "Failed to save product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===========================================
  // TABS CONFIGURATION
  // ===========================================

  const tabs = [
    { id: "basic" as const, label: "Basic Info" },
    { id: "media" as const, label: "Media" },
    { id: "variants" as const, label: "Variants" },
    { id: "details" as const, label: "Details" },
  ];

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditing ? "Edit Product" : "New Product"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditing ? `Editing ${product?.name}` : "Create a new product"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSubmitting ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-4 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "basic" && (
        <BasicInfoTab formData={formData} updateFormField={updateFormField} />
      )}

      {activeTab === "media" && (
        <MediaTab
          images={images}
          model={model}
          isUploadingImages={isUploadingImages}
          isUploadingModel={isUploadingModel}
          onImageUpload={handleImageUpload}
          onRemoveImage={removeImage}
          onSetPrimaryImage={setPrimaryImage}
          onModelUpload={handleModelUpload}
          onRemoveModel={removeModel}
          onUpdateModelField={updateModelField}
        />
      )}

      {activeTab === "variants" && (
        <VariantsTab
          sizes={sizes}
          fabricCategories={fabricCategories}
          onAddSize={addSize}
          onRemoveSize={removeSize}
          onUpdateSize={updateSize}
          onUpdateSizeDimension={updateSizeDimension}
          onSetDefaultSize={setDefaultSize}
          onAddFabricCategory={addFabricCategory}
          onRemoveFabricCategory={removeFabricCategory}
          onUpdateFabricCategoryName={updateFabricCategoryName}
          onAddFabricToCategory={addFabricToCategory}
          onRemoveFabricFromCategory={removeFabricFromCategory}
          onUpdateFabric={updateFabric}
        />
      )}

      {activeTab === "details" && (
        <DetailsTab
          formData={formData}
          features={features}
          specifications={specifications}
          updateFormField={updateFormField}
          onAddFeature={addFeature}
          onRemoveFeature={removeFeature}
          onUpdateFeature={updateFeature}
          onAddSpecification={addSpecification}
          onRemoveSpecification={removeSpecification}
          onUpdateSpecification={updateSpecification}
          onAddCareInstruction={addCareInstruction}
          onRemoveCareInstruction={removeCareInstruction}
          onUpdateCareInstruction={updateCareInstruction}
        />
      )}
    </form>
  );
}

// ===========================================
// BASIC INFO TAB
// ===========================================

interface BasicInfoTabProps {
  formData: ReturnType<typeof initializeFormData>;
  updateFormField: <K extends keyof ReturnType<typeof initializeFormData>>(
    field: K,
    value: ReturnType<typeof initializeFormData>[K]
  ) => void;
}

function BasicInfoTab({ formData, updateFormField }: BasicInfoTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU *
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => updateFormField("sku", e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="SOF-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateFormField("category", e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormField("name", e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="The Belmont Sofa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => updateFormField("tagline", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Timeless comfort meets modern elegance"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormField("description", e.target.value)}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                placeholder="A brief description of the product..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Long Description
              </label>
              <textarea
                value={formData.longDescription}
                onChange={(e) =>
                  updateFormField("longDescription", e.target.value)
                }
                rows={6}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                placeholder="A detailed description of the product..."
              />
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) =>
                    updateFormField(
                      "basePrice",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  required
                  min={0}
                  step={0.01}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price (for sales)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  value={formData.originalPrice || ""}
                  onChange={(e) =>
                    updateFormField(
                      "originalPrice",
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  min={0}
                  step={0.01}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Status Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Status</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => updateFormField("isActive", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <span className="text-sm text-gray-700">
                Active (visible on store)
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) =>
                  updateFormField("isFeatured", e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <span className="text-sm text-gray-700">Featured product</span>
            </label>
          </div>
        </div>

        {/* Production Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Production</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead Time (days)
              </label>
              <input
                type="number"
                value={formData.leadTimeDays}
                onChange={(e) =>
                  updateFormField(
                    "leadTimeDays",
                    parseInt(e.target.value) || 21
                  )
                }
                min={1}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Made In
              </label>
              <input
                type="text"
                value={formData.madeIn}
                onChange={(e) => updateFormField("madeIn", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Lebanon"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// MEDIA TAB
// ===========================================

interface MediaTabProps {
  images: ImageItem[];
  model: ModelData | null;
  isUploadingImages: boolean;
  isUploadingModel: boolean;
  onImageUpload: (files: FileList) => void;
  onRemoveImage: (index: number) => void;
  onSetPrimaryImage: (index: number) => void;
  onModelUpload: (file: File, type: "low" | "high") => void;
  onRemoveModel: (type: "low" | "high") => void;
  onUpdateModelField: <K extends keyof ModelData>(
    field: K,
    value: ModelData[K]
  ) => void;
}

function MediaTab({
  images,
  model,
  isUploadingImages,
  isUploadingModel,
  onImageUpload,
  onRemoveImage,
  onSetPrimaryImage,
  onModelUpload,
  onRemoveModel,
  onUpdateModelField,
}: MediaTabProps) {
  return (
    <div className="space-y-6">
      {/* Images */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Product Images</h2>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer">
            {isUploadingImages ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload Images
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files) onImageUpload(e.target.files);
              }}
              className="hidden"
              disabled={isUploadingImages}
            />
          </label>
        </div>

        {images.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
            <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No images uploaded yet</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer">
              <Upload className="h-4 w-4" />
              Upload Images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) onImageUpload(e.target.files);
                }}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className={cn(
                  "relative group aspect-square rounded-lg overflow-hidden border-2",
                  image.isPrimary ? "border-gray-900" : "border-gray-200"
                )}
              >
                <Image
                  src={image.url}
                  alt={image.altText || "Product image"}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSetPrimaryImage(index)}
                    className={cn(
                      "p-2 rounded-lg text-white transition-colors",
                      image.isPrimary
                        ? "bg-green-500"
                        : "bg-white/20 hover:bg-white/30"
                    )}
                    title={image.isPrimary ? "Primary image" : "Set as primary"}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    className="p-2 bg-white/20 hover:bg-red-500 rounded-lg text-white transition-colors"
                    title="Remove image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-gray-900 text-white text-xs rounded">
                    Primary
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3D Model */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">3D Model</h2>
            <p className="text-sm text-gray-500">
              Upload GLB/GLTF files for 3D product viewer
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Low Poly */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Low Poly Model (required for 3D)
            </label>
            {model?.lowPolyUrl ? (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Box className="h-8 w-8 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {model.lowPolyUrl.split("/").pop()}
                  </p>
                  <p className="text-xs text-gray-500">Low poly model</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveModel("low")}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
                {isUploadingModel ? (
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                ) : (
                  <>
                    <Box className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      Upload low poly GLB
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept=".glb,.gltf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onModelUpload(file, "low");
                  }}
                  className="hidden"
                  disabled={isUploadingModel}
                />
              </label>
            )}
          </div>

          {/* High Poly */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              High Poly Model (optional)
            </label>
            {model?.highPolyUrl ? (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Box className="h-8 w-8 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {model.highPolyUrl.split("/").pop()}
                  </p>
                  <p className="text-xs text-gray-500">High poly model</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveModel("high")}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
                {isUploadingModel ? (
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                ) : (
                  <>
                    <Box className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      Upload high poly GLB
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept=".glb,.gltf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onModelUpload(file, "high");
                  }}
                  className="hidden"
                  disabled={isUploadingModel}
                />
              </label>
            )}
          </div>
        </div>

        {/* Model Settings */}
        {model?.lowPolyUrl && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              3D Viewer Settings
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Environment
                </label>
                <select
                  value={model.environmentPreset}
                  onChange={(e) =>
                    onUpdateModelField("environmentPreset", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  {ENVIRONMENT_PRESETS.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scale
                </label>
                <input
                  type="number"
                  value={model.scale}
                  onChange={(e) =>
                    onUpdateModelField("scale", parseFloat(e.target.value) || 1)
                  }
                  min={0.1}
                  max={10}
                  step={0.1}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-3 cursor-pointer mt-6">
                  <input
                    type="checkbox"
                    checked={model.autoRotate}
                    onChange={(e) =>
                      onUpdateModelField("autoRotate", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-700">
                    Auto-rotate model
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================
// VARIANTS TAB
// ===========================================

interface VariantsTabProps {
  sizes: SizeItem[];
  fabricCategories: FabricCategoryItem[];
  onAddSize: () => void;
  onRemoveSize: (index: number) => void;
  onUpdateSize: (index: number, updates: Partial<SizeItem>) => void;
  onUpdateSizeDimension: (
    index: number,
    dimension: keyof SizeItem["dimensions"],
    value: number
  ) => void;
  onSetDefaultSize: (index: number) => void;
  onAddFabricCategory: () => void;
  onRemoveFabricCategory: (index: number) => void;
  onUpdateFabricCategoryName: (index: number, name: string) => void;
  onAddFabricToCategory: (categoryIndex: number) => void;
  onRemoveFabricFromCategory: (
    categoryIndex: number,
    fabricIndex: number
  ) => void;
  onUpdateFabric: (
    categoryIndex: number,
    fabricIndex: number,
    updates: Partial<FabricItem>
  ) => void;
}

function VariantsTab({
  sizes,
  fabricCategories,
  onAddSize,
  onRemoveSize,
  onUpdateSize,
  onUpdateSizeDimension,
  onSetDefaultSize,
  onAddFabricCategory,
  onRemoveFabricCategory,
  onUpdateFabricCategoryName,
  onAddFabricToCategory,
  onRemoveFabricFromCategory,
  onUpdateFabric,
}: VariantsTabProps) {
  return (
    <div className="space-y-6">
      {/* Sizes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Sizes</h2>
          <button
            type="button"
            onClick={onAddSize}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Size
          </button>
        </div>

        {sizes.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No sizes added. Click &quot;Add Size&quot; to create size variants.
          </p>
        ) : (
          <div className="space-y-4">
            {sizes.map((size, index) => (
              <div
                key={size.id}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      Size {index + 1}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveSize(index)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={size.label}
                      onChange={(e) =>
                        onUpdateSize(index, { label: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="e.g., 3 Seater"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      value={size.price}
                      onChange={(e) =>
                        onUpdateSize(index, {
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      min={0}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Lead Time
                    </label>
                    <input
                      type="text"
                      value={size.leadTime || ""}
                      onChange={(e) =>
                        onUpdateSize(index, { leadTime: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="6-8 weeks"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Width (cm)
                    </label>
                    <input
                      type="number"
                      value={size.dimensions.width}
                      onChange={(e) =>
                        onUpdateSizeDimension(
                          index,
                          "width",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min={0}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={size.dimensions.height}
                      onChange={(e) =>
                        onUpdateSizeDimension(
                          index,
                          "height",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min={0}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Depth (cm)
                    </label>
                    <input
                      type="number"
                      value={size.dimensions.depth}
                      onChange={(e) =>
                        onUpdateSizeDimension(
                          index,
                          "depth",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min={0}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex items-end gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={size.inStock}
                        onChange={(e) =>
                          onUpdateSize(index, { inStock: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-gray-300 text-gray-900"
                      />
                      <span className="text-sm text-gray-700">In Stock</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="defaultSize"
                        checked={size.isDefault}
                        onChange={() => onSetDefaultSize(index)}
                        className="h-4 w-4 border-gray-300 text-gray-900"
                      />
                      <span className="text-sm text-gray-700">Default</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fabric Categories */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Fabric Categories
          </h2>
          <button
            type="button"
            onClick={onAddFabricCategory}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>

        {fabricCategories.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No fabric categories added.
          </p>
        ) : (
          <div className="space-y-6">
            {fabricCategories.map((category, catIndex) => (
              <div
                key={category.id}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) =>
                      onUpdateFabricCategoryName(catIndex, e.target.value)
                    }
                    className="text-sm font-medium text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-gray-900 focus:outline-none px-1"
                    placeholder="Category Name"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onAddFabricToCategory(catIndex)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      + Add Fabric
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveFabricCategory(catIndex)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Fabrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {category.fabrics.map((fabric, fabIndex) => (
                    <div
                      key={fabric.id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="color"
                          value={fabric.hexColor}
                          onChange={(e) =>
                            onUpdateFabric(catIndex, fabIndex, {
                              hexColor: e.target.value,
                            })
                          }
                          className="h-8 w-8 rounded cursor-pointer border-0"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            onRemoveFabricFromCategory(catIndex, fabIndex)
                          }
                          className="ml-auto p-1 text-gray-400 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={fabric.name}
                        onChange={(e) =>
                          onUpdateFabric(catIndex, fabIndex, {
                            name: e.target.value,
                          })
                        }
                        className="w-full text-xs px-2 py-1 border border-gray-200 rounded mb-1"
                        placeholder="Fabric name"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">+$</span>
                        <input
                          type="number"
                          value={fabric.price}
                          onChange={(e) =>
                            onUpdateFabric(catIndex, fabIndex, {
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                          min={0}
                          className="w-full text-xs px-2 py-1 border border-gray-200 rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================
// DETAILS TAB
// ===========================================

interface DetailsTabProps {
  formData: ReturnType<typeof initializeFormData>;
  features: FeatureItem[];
  specifications: SpecificationItem[];
  updateFormField: <K extends keyof ReturnType<typeof initializeFormData>>(
    field: K,
    value: ReturnType<typeof initializeFormData>[K]
  ) => void;
  onAddFeature: () => void;
  onRemoveFeature: (index: number) => void;
  onUpdateFeature: (index: number, updates: Partial<FeatureItem>) => void;
  onAddSpecification: () => void;
  onRemoveSpecification: (index: number) => void;
  onUpdateSpecification: (
    index: number,
    updates: Partial<SpecificationItem>
  ) => void;
  onAddCareInstruction: () => void;
  onRemoveCareInstruction: (index: number) => void;
  onUpdateCareInstruction: (index: number, value: string) => void;
}

function DetailsTab({
  formData,
  features,
  specifications,
  updateFormField,
  onAddFeature,
  onRemoveFeature,
  onUpdateFeature,
  onAddSpecification,
  onRemoveSpecification,
  onUpdateSpecification,
  onAddCareInstruction,
  onRemoveCareInstruction,
  onUpdateCareInstruction,
}: DetailsTabProps) {
  return (
    <div className="space-y-6">
      {/* Features */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Features</h2>
          <button
            type="button"
            onClick={onAddFeature}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Feature
          </button>
        </div>

        {features.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No features added. Add features to highlight key product benefits.
          </p>
        ) : (
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
              >
                <select
                  value={feature.icon}
                  onChange={(e) =>
                    onUpdateFeature(index, { icon: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  {FEATURE_ICONS.map((icon) => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label}
                    </option>
                  ))}
                </select>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) =>
                      onUpdateFeature(index, { title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="Feature title"
                  />
                  <textarea
                    value={feature.description}
                    onChange={(e) =>
                      onUpdateFeature(index, { description: e.target.value })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                    placeholder="Feature description"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveFeature(index)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Specifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Specifications</h2>
          <button
            type="button"
            onClick={onAddSpecification}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Specification
          </button>
        </div>

        {specifications.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No specifications added.
          </p>
        ) : (
          <div className="space-y-3">
            {specifications.map((spec, index) => (
              <div key={index} className="flex items-center gap-4">
                <input
                  type="text"
                  value={spec.label}
                  onChange={(e) =>
                    onUpdateSpecification(index, { label: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="Label (e.g., Material)"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) =>
                    onUpdateSpecification(index, { value: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="Value (e.g., Solid Oak)"
                />
                <button
                  type="button"
                  onClick={() => onRemoveSpecification(index)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delivery & Returns */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Delivery & Returns
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Delivery</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Delivery Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.deliveryPrice}
                    onChange={(e) =>
                      updateFormField(
                        "deliveryPrice",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    min={0}
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Delivery Info
              </label>
              <textarea
                value={formData.deliveryInfo}
                onChange={(e) =>
                  updateFormField("deliveryInfo", e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                placeholder="Delivery information..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Returns</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Return Period (days)
                </label>
                <input
                  type="number"
                  value={formData.returnDays}
                  onChange={(e) =>
                    updateFormField(
                      "returnDays",
                      parseInt(e.target.value) || 14
                    )
                  }
                  min={0}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Warranty (years)
                </label>
                <input
                  type="number"
                  value={formData.warrantyYears}
                  onChange={(e) =>
                    updateFormField(
                      "warrantyYears",
                      parseInt(e.target.value) || 2
                    )
                  }
                  min={0}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Return Info
              </label>
              <textarea
                value={formData.returnInfo}
                onChange={(e) => updateFormField("returnInfo", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                placeholder="Return policy details..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Care Instructions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Care Instructions
        </h2>
        <div className="space-y-3">
          {formData.careInstructions.map((instruction, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                value={instruction}
                onChange={(e) => onUpdateCareInstruction(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                placeholder="Care instruction"
              />
              <button
                type="button"
                onClick={() => onRemoveCareInstruction(index)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={onAddCareInstruction}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Instruction
          </button>
        </div>
      </div>
    </div>
  );
}
