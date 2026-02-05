import type { ReactNode } from 'react';

export type TwoColumnLayoutProps = {
  firstCol: ReactNode;
  secondCol: ReactNode;
};

export const TwoColumnLayout = ({ firstCol, secondCol }: TwoColumnLayoutProps) => (
  <div className="flex flex-col gap-x-4 gap-y-3 xl:flex-row xl:items-start">
    <div className="flex w-full flex-col gap-y-3">{firstCol}</div>
    <div className="flex w-full max-w-[100%] flex-col gap-y-3 xl:mt-0 xl:max-w-[440px]">
      {secondCol}
    </div>
  </div>
);
