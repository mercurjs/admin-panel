// @todo fix types
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Command } from '@hooks/use-command-history.tsx';

export type DataGridBulkUpdateCommandArgs = {
  fields: string[];
  next: any[];
  prev: any[];
  setter: (fields: string[], values: any[], isHistory?: boolean) => void;
};

export class DataGridBulkUpdateCommand implements Command {
  private readonly _fields: string[];

  private readonly _prev: any[];
  private readonly _next: any[];

  private readonly _setter: (fields: string[], values: any[], isHistory?: boolean) => void;

  constructor({ fields, prev, next, setter }: DataGridBulkUpdateCommandArgs) {
    this._fields = fields;
    this._prev = prev;
    this._next = next;
    this._setter = setter;
  }

  execute(redo = false): void {
    this._setter(this._fields, this._next, redo);
  }
  undo(): void {
    this._setter(this._fields, this._prev, true);
  }
  redo(): void {
    this.execute(true);
  }
}
