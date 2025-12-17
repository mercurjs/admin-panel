import { HttpTypes } from "@medusajs/types"
import { castNumber } from "../../../lib/cast-number"
import { ProductCreateSchemaType } from "./types"

export const normalizeProductFormValues = (
  values: ProductCreateSchemaType & {
    status: HttpTypes.AdminProductStatus
    regionsCurrencyMap: Record<string, string>
  }
): HttpTypes.AdminCreateProduct => {
  const thumbnail = values.media?.find((media) => media.isThumbnail)?.url
  const images = values.media
    ?.filter((media) => !media.isThumbnail)
    .map((media) => ({ url: media.url }))

  return {
    status: values.status,
    is_giftcard: false,
    tags: values?.tags?.length
      ? values.tags?.map((tag) => ({ id: tag }))
      : undefined,
    sales_channels: values?.sales_channels?.length
      ? values.sales_channels?.map((sc) => ({ id: sc.id }))
      : undefined,
    images,
    collection_id: values.collection_id || undefined,
    shipping_profile_id: values.shipping_profile_id || undefined,
    categories: values.categories.map((id) => ({ id })),
    type_id: values.type_id || undefined,
    handle: values.handle?.trim(),
    origin_country: values.origin_country || undefined,
    material: values.material || undefined,
    mid_code: values.mid_code || undefined,
    hs_code: values.hs_code || undefined,
    thumbnail,
    title: values.title.trim(),
    subtitle: values.subtitle?.trim(),
    description: values.description?.trim(),
    discountable: values.discountable,
    width: values.width ? parseFloat(values.width) : undefined,
    length: values.length ? parseFloat(values.length) : undefined,
    height: values.height ? parseFloat(values.height) : undefined,
    weight: values.weight ? parseFloat(values.weight) : undefined,
    options: values.options.filter((o) => o.title), // clean temp. values
    variants: normalizeVariants(
      values.variants.filter((variant) => variant.should_create),
      values.regionsCurrencyMap
    ),
  }
}

type InventoryItem = {
  inventory_item_id: string
  required_quantity: number
}

type PriceItem = {
  currency_code: string
  amount: number
  rules?: { region_id: string }
}

const normalizeInventoryItem = (
  item: { inventory_item_id: string; required_quantity?: number | string | null }
): InventoryItem | null => {
  const quantity = item.required_quantity
    ? castNumber(item.required_quantity)
    : null

  if (!item.inventory_item_id || !quantity) {
    return null
  }

  return {
    ...item,
    required_quantity: quantity,
  }
}

const normalizePriceItem = (
  key: string,
  value: number | string | undefined,
  regionsCurrencyMap: Record<string, string>
): PriceItem | null => {
  if (value === "" || value === undefined) {
    return null
  }

  if (key.startsWith("reg_")) {
    return {
      currency_code: regionsCurrencyMap[key],
      amount: castNumber(value),
      rules: { region_id: key },
    }
  }

  return {
    currency_code: key,
    amount: castNumber(value),
  }
}

export const normalizeVariants = (
  variants: ProductCreateSchemaType["variants"],
  regionsCurrencyMap: Record<string, string>
): HttpTypes.AdminCreateProductVariant[] => {
  return variants.map((variant) => ({
    title: variant.title || Object.values(variant.options || {}).join(" / "),
    options: variant.options,
    sku: variant.sku || undefined,
    manage_inventory: !!variant.manage_inventory,
    allow_backorder: !!variant.allow_backorder,
    variant_rank: variant.variant_rank,
    inventory_items: (variant.inventory || [])
      .map(normalizeInventoryItem)
      .filter((item): item is InventoryItem => item !== null),
    prices: Object.entries(variant.prices || {})
      .map(([key, value]) => normalizePriceItem(key, value, regionsCurrencyMap))
      .filter((price): price is PriceItem => price !== null),
  }))
}

export const decorateVariantsWithDefaultValues = (
  variants: ProductCreateSchemaType["variants"]
) => {
  return variants.map((variant) => ({
    ...variant,
    title: variant.title || "",
    sku: variant.sku || "",
    manage_inventory: variant.manage_inventory || false,
    allow_backorder: variant.allow_backorder || false,
    inventory_kit: variant.inventory_kit || false,
  }))
}
