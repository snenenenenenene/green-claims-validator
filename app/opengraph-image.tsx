/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Green Claims Validator - Greenwashing Verification";
export const contentType = "image/png";

export default async function OG() {
  const robotoBold = await fetch(
    new URL("../public/fonts/Roboto-Bold.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          backgroundImage:
            "linear-gradient(to bottom right, #E0E7FF 25%, #ffffff 50%, #CFFAFE 75%)",
        }}
      >
        <img
          src={`https://${process.env.VERCEL_URL}`}
          alt="Green Claims Validator Logo"
          tw="w-20 h-20 mb-4 opacity-95"
        />
        <h1
          style={{
            fontSize: "100px",
            fontFamily: "Roboto Bold",
            background:
              "linear-gradient(to bottom right, #000000 21.66%, #78716c 86.47%)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: "5rem",
            letterSpacing: "-0.02em",
          }}
        >
          Lutris
        </h1>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Roboto Bold",
          data: robotoBold,
        },
      ],
    },
  );
}
