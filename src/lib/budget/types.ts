export type IncomeFrequency = "weekly" | "fortnightly" | "monthly";

export type SavingsFrequency =
  | "weekly"
  | "fortnightly"
  | "monthly"
  | "annually";

export type RecurringFrequency =
  | "weekly"
  | "fortnightly"
  | "monthly"
  | "quarterly"
  | "annually";

export type SpendTreatment =
  | "count_today_only"
  | "spread_as_recurring_bill"
  | "already_included";

export interface PayCycle {
  start: Date;
  end: Date;
  days: number;
}

export interface BudgetSettingsInput {
  incomeAmountCents: number;
  incomeFrequency: IncomeFrequency;
  nextPayday: Date;
}

export interface SavingsTargetInput {
  amountCents: number;
  frequency: SavingsFrequency;
}

export interface BillStreamInput {
  id: string;
  name: string;
  frequency: RecurringFrequency;
  estimatedAmountCents: number;
  isActive: boolean;
}

export interface BillPaymentInput {
  billStreamId: string;
  amountCents: number;
  paidOn: Date;
}

export interface ManualSpendInput {
  amountCents: number;
  spentOn: Date;
}

export interface BudgetCalculationInput {
  settings: BudgetSettingsInput;
  savings: SavingsTargetInput;
  billStreams: BillStreamInput[];
  manualSpends: ManualSpendInput[];
  /** First day the user began tracking spends (earliest spend or onboarding). */
  trackingStartDate: Date;
  referenceDate: Date;
  currency: string;
}

export interface CycleCompletionSnapshot {
  pending: boolean;
  title: string;
  headline: string;
  subline: string;
  isUnderLine: boolean;
  positionCents: number;
}

export interface BudgetSnapshot {
  payCycle: PayCycle;
  cycleIncomeCents: number;
  dailySavingsTargetCents: number;
  fixedDailyBurnCents: number;
  cycleSavingsTargetCents: number;
  cycleFixedBurnCents: number;
  manualDailyTargetCents: number;
  todayManualSpendCents: number;
  /** fixedDailyBurnCents + todayManualSpendCents — savings excluded */
  spentTodayCents: number;
  /** fixedDailyBurnCents + manualDailyTargetCents */
  maxTodayCents: number;
  /** maxTodayCents - spentTodayCents */
  remainingTodayCents: number;
  spentTodayDisplayCents: number;
  maxTodayDisplayCents: number;
  remainingTodayDisplayCents: number;
  isTodayOver: boolean;
  /** @deprecated Use remainingTodayCents — manual allowance left */
  todayRemainingCents: number;
  /** @deprecated Use remainingTodayDisplayCents */
  todayRemainingDisplayCents: number;
  /** @deprecated Use isTodayOver */
  isTodayRed: boolean;
  elapsedCycleDaysIncludingToday: number;
  remainingDaysAfterToday: number;
  trackingStartDate: Date;
  payCycleTrackedStart: Date;
  payCycleTrackedDays: number;
  /** Primary spend progress — manual allowance vs spend on tracked days in pay cycle */
  payCyclePositionCents: number;
  /** @deprecated Use payCyclePositionCents */
  cyclePositionCents: number;
  hasPayCyclePositionData: boolean;
  /** @deprecated Use hasPayCyclePositionData */
  hasManualSpendHistoryBeforeToday: boolean;
  manualAllowedToDateCents: number;
  manualSpendToDateCents: number;
  yearTrackedStart: Date;
  yearTrackedDays: number;
  /** Secondary scoreboard — tracked calendar year only */
  yearPositionCents: number;
  hasYearPositionData: boolean;
  dailyRecoveryRequiredCents: number | null;
  recoveryMessage: string;
  cycleCompletion: CycleCompletionSnapshot | null;
  currency: string;
}
