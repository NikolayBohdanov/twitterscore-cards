export interface CardTextOverrides {
  title: string;
  subtitle: string;
  headerSubtitle: string;
  counterLabel: string;
  footerLeft: string;
  footerCenter: string;
  footerRight: string;
}

export const DEFAULT_OVERRIDES: CardTextOverrides = {
  title: "Weekly Smart Drop",
  subtitle: "", // auto from weekNumber
  headerSubtitle: "", // e.g. "March 2026 · DeFi Protocols"
  counterLabel: "", // auto from newCount
  footerLeft: "twitterscore.io",
  footerCenter: "11M+ Accounts Tracked · Real-Time Scoring",
  footerRight: "@Twiter_score",
};

export function getTitle(o?: CardTextOverrides) {
  return o?.title || DEFAULT_OVERRIDES.title;
}

export function getSubtitle(o?: CardTextOverrides, weekNumber?: number) {
  if (o?.subtitle) return o.subtitle;
  return weekNumber !== undefined ? `Week #${weekNumber}` : DEFAULT_OVERRIDES.subtitle;
}

export function getCounterLabel(o?: CardTextOverrides, newCount?: number) {
  if (o?.counterLabel) return o.counterLabel;
  return newCount !== undefined ? `Smart Accounts · +${newCount} new` : DEFAULT_OVERRIDES.counterLabel;
}

export function getFooterLeft(o?: CardTextOverrides) {
  return o?.footerLeft || DEFAULT_OVERRIDES.footerLeft;
}

export function getFooterCenter(o?: CardTextOverrides) {
  return o?.footerCenter || DEFAULT_OVERRIDES.footerCenter;
}

export function getFooterRight(o?: CardTextOverrides) {
  return o?.footerRight || DEFAULT_OVERRIDES.footerRight;
}
