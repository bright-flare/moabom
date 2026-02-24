export type WatchlistId = "living-cost" | "fx" | "traffic";

export interface WatchlistCard {
  id: WatchlistId;
  title: string;
  subtitle: string;
  summary: string;
  updatedAt: string;
  trend: "up" | "down" | "flat";
  badge: string;
}
