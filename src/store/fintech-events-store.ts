import { create } from "zustand";

const MAX_EVENTS = 200;

export type FintechEventKind =
  | "internal_transfer_ok"
  | "internal_transfer_fail"
  | "cefts_ok"
  | "cefts_fail"
  | "justpay_ok"
  | "justpay_fail"
  | "balance_poll";

export type FintechEvent = {
  id: string;
  kind: FintechEventKind;
  campaignId?: string;
  detail?: string;
  at: string;
};

function newId() {
  return `fe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useFintechEventsStore = create<{
  events: FintechEvent[];
  push: (
    e: Omit<FintechEvent, "id" | "at"> & { id?: string; at?: string },
  ) => void;
  signalsForCampaign: (campaignId: string) => {
    fraudDelta: number;
    alerts: string[];
  };
}>((set, get) => ({
  events: [],
  push: (e) =>
    set((s) => ({
      events: [
        {
          id: e.id ?? newId(),
          kind: e.kind,
          campaignId: e.campaignId,
          detail: e.detail,
          at: e.at ?? new Date().toISOString(),
        },
        ...s.events,
      ].slice(0, MAX_EVENTS),
    })),
  signalsForCampaign: (campaignId) => {
    const hourAgo = Date.now() - 60 * 60 * 1000;
    const relevant = get().events.filter(
      (ev) =>
        ev.campaignId === campaignId && new Date(ev.at).getTime() > hourAgo,
    );
    let fraudDelta = 0;
    const alerts: string[] = [];
    const fails = relevant.filter((e) => e.kind.endsWith("_fail")).length;
    const ok = relevant.filter((e) => e.kind.endsWith("_ok")).length;
    fraudDelta += fails * 6;
    if (fails >= 2) alerts.push("Repeated transfer failures — velocity review");
    if (fails && ok && fails / (fails + ok) > 0.35) {
      alerts.push("High failure ratio on banking rail for this case");
    }
    return { fraudDelta, alerts };
  },
}));
