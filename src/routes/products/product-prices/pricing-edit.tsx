import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@medusajs/ui"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import * as zod from "zod"

import { RouteFocusModal, useRouteModal } from "../../../components/modals"
import { KeyboundForm } from "../../../components/utilities/keybound-form"
import { useUpdateProductVariantsBatch } from "../../../hooks/api/products"
import { useRegions } from "../../../hooks/api/regions"
import { castNumber } from "../../../lib/cast-number"
import { VariantPricingForm } from "../common/variant-pricing-form"
import type { AdminProductWithPriceRules } from "@custom-types/product"

export const UpdateVariantPricesSchema = zod.object({
  variants: zod.array(
    zod.object({
      prices: zod
        .record(zod.string(), zod.string().or(zod.number()).optional())
        .optional(),
    })
  ),
})

export type UpdateVariantPricesSchemaType = zod.infer<
  typeof UpdateVariantPricesSchema
>

export const PricingEdit = ({
  product,
  variantId,
}: {
  product: AdminProductWithPriceRules
  variantId?: string
}) => {
  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()
  const { mutateAsync, isPending } = useUpdateProductVariantsBatch(product.id)

  const { regions } = useRegions({ limit: 9999 })
  const regionsCurrencyMap = useMemo(() => {
    if (!regions?.length) {
      return {} as Record<string, string>
    }

    return regions.reduce<Record<string, string>>((acc, reg) => {
      acc[reg.id] = reg.currency_code
      
      return acc
    }, {})
  }, [regions])

  const variants = variantId
    ? product.variants?.filter((v) => v.id === variantId)
    : product.variants

  const form = useForm<UpdateVariantPricesSchemaType>({
    defaultValues: {
      variants: variants?.map((variant) => ({
        title: variant.title,
        prices: variant.prices?.reduce<Record<string, number>>((acc, price) => {
          if (price.rules?.region_id) {
            acc[price.rules.region_id] = price.amount
          } else {
            acc[price.currency_code] = price.amount
          }

          return acc
        }, {}) ?? {},
      })),
    },

    resolver: zodResolver(UpdateVariantPricesSchema, {}),
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!variants) {
      return
    }

    const reqData = values.variants.map((variant, ind) => ({
      id: variants[ind].id,
      prices: Object.entries(variant.prices || {})
        .filter(
          (entry): entry is [string, string | number] => {
            const [, value] = entry

            return value !== "" && typeof value !== "undefined"
          }
        )
        .map(([currencyCodeOrRegionId, value]) => {
          const regionId = currencyCodeOrRegionId.startsWith("reg_")
            ? currencyCodeOrRegionId
            : undefined
          const currencyCode = currencyCodeOrRegionId.startsWith("reg_")
            ? (regionId ? regionsCurrencyMap[regionId] : currencyCodeOrRegionId)
            : currencyCodeOrRegionId

          let existingId: string | undefined = undefined

          if (regionId) {
            existingId = variants[ind]?.prices?.find(
              (p) => p.rules?.["region_id"] === regionId
            )?.id
          } else {
            existingId = variants[ind]?.prices?.find(
              (p) =>
                p.currency_code === currencyCode &&
                Object.keys(p.rules ?? {}).length === 0
            )?.id
          }

          const amount = castNumber(value)

          return {
            id: existingId,
            currency_code: currencyCode,
            amount,
            ...(regionId ? { rules: { region_id: regionId } } : {}),
          }
        }),
    }))

    await mutateAsync(reqData, {
      onSuccess: () => {
        handleSuccess("..")
      },
    })
  })

  return (
    <RouteFocusModal.Form form={form} data-testid="product-prices-form">
      <KeyboundForm onSubmit={handleSubmit} className="flex size-full flex-col" data-testid="product-prices-keybound-form">
        <RouteFocusModal.Header data-testid="product-prices-form-header" />
        <RouteFocusModal.Body className="flex flex-col overflow-hidden" data-testid="product-prices-form-body">
          <div data-testid="product-prices-form-variant-pricing-wrapper">
            <VariantPricingForm form={form as any} data-testid="product-prices-form-variant-pricing" />
          </div>
        </RouteFocusModal.Body>
        <RouteFocusModal.Footer data-testid="product-prices-form-footer">
          <div className="flex w-full items-center justify-end gap-x-2" data-testid="product-prices-form-footer-actions">
            <RouteFocusModal.Close asChild data-testid="product-prices-form-cancel-button-wrapper">
              <Button variant="secondary" size="small" data-testid="product-prices-form-cancel-button">
                {t("actions.cancel")}
              </Button>
            </RouteFocusModal.Close>
            <Button
              type="submit"
              variant="primary"
              size="small"
              isLoading={isPending}
              data-testid="product-prices-form-save-button"
            >
              {t("actions.save")}
            </Button>
          </div>
        </RouteFocusModal.Footer>
      </KeyboundForm>
    </RouteFocusModal.Form>
  )
}
