export interface HistoryPeriod {
  year: number;
  description: string;
}

export interface TimePeriod {
  id: number;
  label: string;
  startYear: number;
  endYear: number;
  events: HistoryPeriod[];
}

export interface HistoryPeriodProps {
  periods: TimePeriod[];
  title?: string;
}
