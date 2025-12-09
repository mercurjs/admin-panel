import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Heading, toast } from "@medusajs/ui"
import { useEffect } from "react"

import { useOrder, useOrderPreview } from "../../../hooks/api/orders"
import { RouteDrawer } from "../../../components/modals"
import { OrderReceiveReturnForm } from "./components/order-receive-return-form"
import {
  useAddReceiveItems,
  useInitiateReceiveReturn,
  useReturn,
} from "../../../hooks/api/returns"
import { getErrorMessage } from "@utils/error-helper"

let IS_REQUEST_RUNNING = false

export function OrderReceiveReturn() {
  const { id: order_id, return_id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const id = order_id ?? ""
  const returnId = return_id ?? ""

  const { order } = useOrder(id, { fields: "+currency_code,*items" }, { enabled: !!id })
  const { order: preview } = useOrderPreview(id, {}, { enabled: !!id })
  const { return: orderReturn } = useReturn(returnId, {
    fields: "*items.item,*items.item.variant,*items.item.variant.product",
  }, 
  {
    enabled: !!returnId,
  }) // TODO: fix API needs to return 404 if return not exists and not an empty object

  const { mutateAsync: initiateReceiveReturn } = useInitiateReceiveReturn(
    returnId,
    id,
  )

  const { mutateAsync: addReceiveItems } = useAddReceiveItems(returnId, id)

  useEffect(() => {
    (async function () {
      if (IS_REQUEST_RUNNING || !preview) {
        return
      }

      if (preview.order_change) {
        if (preview.order_change.change_type !== "return_receive") {
          navigate(`/orders/${id}`, { replace: true })
          toast.error(t("orders.returns.activeChangeError"))
        }

        return
      }

      IS_REQUEST_RUNNING = true

      try {
        const { return: _return } = await initiateReceiveReturn({})

        await addReceiveItems({
          items: _return.items.map((i) => ({
            id: i.item_id,
            quantity: i.quantity,
          })),
        })
      } catch (e) {
        toast.error(getErrorMessage(e))
      } finally {
        IS_REQUEST_RUNNING = false
      }
    })()
  }, [preview])

  const ready = order && orderReturn && preview

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <Heading>
          {t("orders.returns.receive.title", {
            returnId: return_id?.slice(-7),
          })}
        </Heading>
      </RouteDrawer.Header>
      {ready && (
        <OrderReceiveReturnForm
          order={order}
          orderReturn={orderReturn}
          preview={preview}
        />
      )}
    </RouteDrawer>
  )
}
