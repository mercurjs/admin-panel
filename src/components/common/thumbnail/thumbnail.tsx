import { Photo } from "@medusajs/icons"
import { clx } from "@medusajs/ui"

type ThumbnailProps = {
  src?: string | null
  alt?: string
  size?: "small" | "base"
  showBorder?: boolean
}

export const Thumbnail = ({ src, alt, size = "base", showBorder = true }: ThumbnailProps) => {
  return (
    <div
      className={clx(
        "bg-ui-bg-component border-ui-border-base flex items-center justify-center overflow-hidden rounded",
        {
          "h-8 w-6": size === "base",
          "h-5 w-4": size === "small",
          "border": showBorder,
        }
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover object-center"
        />
      ) : (
        <Photo className="text-ui-fg-subtle" />
      )}
    </div>
  )
}
