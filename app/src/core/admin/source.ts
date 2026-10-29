import { AdminData } from './stats';

/** Reads everything the evaluation view needs; only available to people allowed to see all entries. */
export interface AdminSource {
  load(): Promise<AdminData>;
  /** Shown above the figures, e.g. that the demo uses sample data. */
  sample?: boolean;
}
