import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Arghya Das - Portfolio";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Move font loading outside component for caching
const getFontData = async () => {
  try {
    const [clashDisplay, cabinetGrotesk] = await Promise.all([
      fetch(
        new URL("../public/fonts/ClashDisplay-Semibold.ttf", import.meta.url)
      ).then((res) => res.arrayBuffer()),
      fetch(
        new URL("../public/fonts/CabinetGrotesk-Medium.ttf", import.meta.url)
      ).then((res) => res.arrayBuffer()),
    ]);
    return { clashDisplay, cabinetGrotesk };
  } catch (error) {
    console.error("Failed to load fonts:", error);
    return null;
  }
};

// Common styles
const styles = {
  wrapper: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
    padding: "40px",
  },
  container: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "4px solid #fbbf24",
    padding: "60px",
  },
  title: {
    fontSize: "64px",
    color: "#fbbf24",
    marginBottom: "10px",
    textAlign: "center",
    fontFamily: "Clash Display",
    letterSpacing: "0.5px",
  },
  description: {
    fontSize: "28px",
    color: "white",
    textAlign: "center",
    maxWidth: "800px",
    fontFamily: "Clash Display",
    letterSpacing: "0.5px",
  },
} as const;

export default async function Image() {
  try {
    const fontData = await getFontData();

    return new ImageResponse(
      (
        <div
          style={{
            ...styles.wrapper,
            fontFamily: fontData ? "Clash Display" : "system-ui",
          }}
        >
          <div style={styles.container}>
            <h1 style={styles.title}>LeetCode Stats</h1>
            <p style={styles.description}>
              A slick tool to flex your LeetCode stats.
            </p>
          </div>
        </div>
      ),
      {
        ...size,
        fonts: fontData
          ? [
              {
                name: "Clash Display",
                data: fontData.clashDisplay,
                weight: 500,
                style: "normal",
              },
              {
                name: "Cabinet Grotesk",
                data: fontData.cabinetGrotesk,
                weight: 500,
                style: "normal",
              },
            ]
          : undefined,
      }
    );
  } catch (error) {
    console.error("Error generating OpenGraph image:", error);
    return new Response(
      `Failed to generate image: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      {
        status: 500,
      }
    );
  }
}
