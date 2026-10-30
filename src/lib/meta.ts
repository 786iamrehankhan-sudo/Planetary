export const meta = (title: string, description: string) => ({
  meta: [
    { title: `${title} · Planetary Analogue Explorer` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · Planetary Analogue Explorer` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
