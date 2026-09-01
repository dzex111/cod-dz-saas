import { createYalidineShipment } from "./yalidine";
import { createZRExpressShipment } from "./zr_express";

// خدمة شحن موحدة — تختار المزود تلقائياً حسب إعدادات التاجر
export async function createShipment(orderId: string, provider?: string) {
  if (provider === "yalidine") return createYalidineShipment(orderId);
  if (provider === "zr_express") return createZRExpressShipment(orderId);

  // تلقائي: جرّب Yalidine أولاً ثم ZR
  try {
    return await createYalidineShipment(orderId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Yalidine")) {
      return await createZRExpressShipment(orderId);
    }
    throw e;
  }
}
