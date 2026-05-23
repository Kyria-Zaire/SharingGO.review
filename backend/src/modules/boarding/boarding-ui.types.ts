/** Driver scan screen UI descriptor (S2-T5). */
export const BOARDING_UI_STATUS = {
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
} as const;

export type BoardingUiStatus = (typeof BOARDING_UI_STATUS)[keyof typeof BOARDING_UI_STATUS];

export interface BoardingUiMessage {
  status: BoardingUiStatus;
  title: string;
  message: string;
}
