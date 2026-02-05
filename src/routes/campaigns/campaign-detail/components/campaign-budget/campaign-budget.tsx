import { ActionMenu } from '@components/common/action-menu';
import { ChartPie, PencilSquare } from '@medusajs/icons';
import type { AdminCampaign } from '@medusajs/types';
import { Container, Heading, Text } from '@medusajs/ui';
import { Trans, useTranslation } from 'react-i18next';

type CampaignBudgetProps = {
  campaign: AdminCampaign;
};

export const CampaignBudget = ({ campaign }: CampaignBudgetProps) => {
  const { t } = useTranslation();

  return (
    <Container
      className="flex flex-col gap-y-4 px-6 py-4"
      data-testid="campaign-budget-container"
    >
      <div
        className="flex justify-between"
        data-testid="campaign-budget-header"
      >
        <div className="flex-grow">
          <div
            className="float-start flex size-7 items-center justify-center rounded-md bg-ui-bg-base shadow-borders-base"
            data-testid="campaign-budget-icon-container"
          >
            <div className="flex size-6 items-center justify-center rounded-[4px] bg-ui-bg-component">
              <ChartPie className="text-ui-fg-subtle" />
            </div>
          </div>

          <Heading
            className="ms-10 mt-[1.5px] font-normal text-ui-fg-subtle"
            level="h3"
            data-testid="campaign-budget-heading"
          >
            {campaign.budget?.type === 'use_by_attribute'
              ? t('campaigns.budget.fields.totalUsedByAttribute', {
                  attribute: campaign.budget?.attribute
                })
              : t('campaigns.fields.budget_limit')}
          </Heading>
        </div>

        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <PencilSquare />,
                  label: t('actions.edit'),
                  to: `edit-budget`
                }
              ]
            }
          ]}
          data-testid="campaign-budget-action-menu"
        />
      </div>

      <div data-testid="campaign-budget-limit">
        <Text
          className="border-l-4 border-ui-border-strong ps-3 text-ui-fg-subtle"
          size="small"
          leading="compact"
          data-testid="campaign-budget-limit-text"
        >
          <Trans
            i18nKey="campaigns.totalSpend"
            values={{
              amount: campaign?.budget?.limit || 'no limit',
              currency:
                campaign?.budget?.type === 'spend' && campaign?.budget.limit
                  ? campaign.budget?.currency_code
                  : ''
            }}
            components={[
              <span
                key="amount"
                className="txt-compact-medium-plus text-lg text-ui-fg-base"
                data-testid="campaign-budget-limit-amount"
              />,
              <span
                key="currency"
                className="txt-compact-medium-plus text-lg text-ui-fg-base"
                data-testid="campaign-budget-limit-currency"
              />
            ]}
          />
        </Text>
      </div>
    </Container>
  );
};
