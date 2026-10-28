import { Block } from '../../core/content/types';

export interface BlockViewProps<T extends Block> {
  moduleId: string;
  block: T;
  /** Moves on to the next block. */
  onDone: () => void;
}
