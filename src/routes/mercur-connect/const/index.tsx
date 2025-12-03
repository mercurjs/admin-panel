import { ArrowUpTray } from "@medusajs/icons";

export const mercurConnectItems = [
  {
    name: "Product Importer",
    description:
      "Allow your vendors to quickly add products to your marketplace by uploading CSV files, making catalog management fast and efficient.",
    enabled: false,
    icon: <ArrowUpTray />,
    provider: "csv",
  },
  {
    name: "Shopify Connector",
    description:
      "Allow your vendors to connect their Shopify stores and seamlessly sync products, stock levels, prices, and orders in real time.",
    enabled: false,
    icon: "https://www.citypng.com/public/uploads/preview/shopify-bag-icon-symbol-logo-701751695132537nenecmhs0u.png",
    provider: "shopify",
  },
];
