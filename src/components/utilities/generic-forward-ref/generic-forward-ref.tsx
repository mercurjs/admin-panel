import { forwardRef, type ReactNode, type Ref, type RefAttributes } from 'react';

export function genericForwardRef<T, P = object>(
  render: (props: P, ref: Ref<T>) => ReactNode
): (props: P & RefAttributes<T>) => ReactNode {
  // @todo fix type error
  // @ts-expect-error Generic forwarding ref is not properly typed
  return forwardRef(render) as unknown;
}
