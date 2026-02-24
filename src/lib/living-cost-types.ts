export interface PriceMoveItem {
  name: string;
  unit: string;
  price: number;
  changePct: number;
  changeKrw: number;
}

export interface LivingCostSnapshot {
  updatedAt: string;
  risingTop10: PriceMoveItem[];
  fallingTop10: PriceMoveItem[];
}
