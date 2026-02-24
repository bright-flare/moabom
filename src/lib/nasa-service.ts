export interface NasaApod {
  date: string;
  title: string;
  url: string;
  hdurl?: string;
  explanation?: string;
  media_type: "image" | "video";
  thumbnail_url?: string;
}

export async function getNasaApod() {
  const key = process.env.NASA_API_KEY || "DEMO_KEY";
  const endpoint = `https://api.nasa.gov/planetary/apod?api_key=${key}&thumbs=true`;
  const res = await fetch(endpoint, { cache: "no-store" });
  if (!res.ok) throw new Error(`NASA APOD HTTP ${res.status}`);
  const data = (await res.json()) as NasaApod;
  return data;
}
