import { ImageResponse } from "next/og";

/**
 * Link preview for WhatsApp, Telegram, Facebook and X.
 * Latin-only text on purpose: the image is generated without shipping a custom
 * font file, and the default font has no Cyrillic or Armenian glyphs.
 *
 * Note for Satori (the renderer): every element with more than one child needs
 * an explicit display value, so all wrappers below are flex containers.
 */
export const alt = "Aurora Dental — modern dentistry in Yerevan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const chips = ["Implants", "Aligners", "Veneers", "Hygiene"];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0e5e5a 0%, #0a3f3d 55%, #123c3a 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: -180,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: 520,
            background: "rgba(255,255,255,0.07)",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: -220,
            left: -140,
            width: 480,
            height: 480,
            borderRadius: 480,
            background: "rgba(201,165,92,0.16)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              width: 72,
              height: 72,
              borderRadius: 22,
              background: "#ffffff",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
            }}
          >
            🦷
          </div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>Aurora Dental</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 700, letterSpacing: -2 }}>
            Modern dentistry
          </div>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 700, letterSpacing: -2 }}>
            in Yerevan
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "rgba(255,255,255,0.75)" }}>
            Online booking in 1 minute · 3D diagnostics · 10-year warranty
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 28 }}>
          {chips.map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                padding: "12px 26px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.22)",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
