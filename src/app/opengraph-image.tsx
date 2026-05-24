import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AgileToolHub — Free Agile, Scrum & Software Delivery Templates";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#F8FAFC",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "#2563EB",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: "72px",
              fontWeight: "700",
              color: "#111827",
              lineHeight: 1.1,
            }}
          >
            AgileToolHub
          </div>
          <div
            style={{
              fontSize: "34px",
              color: "#4B5563",
              lineHeight: 1.3,
              maxWidth: "900px",
            }}
          >
            Free Agile, Scrum & Software Delivery Templates
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "#6B7280",
              marginTop: "8px",
            }}
          >
            Templates · Tools · Guides · Docs · Examples
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "80px",
            fontSize: "24px",
            color: "#2563EB",
            fontWeight: "600",
          }}
        >
          agiletoolhub.com
        </div>
      </div>
    ),
    { ...size }
  );
}
