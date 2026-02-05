import { useDeletePriceList } from '@hooks/api';
import type { HttpTypes } from '@medusajs/types';
import { toast, usePrompt } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const useDeletePriceListAction = ({
  priceList,
  navigateOnSuccess = true
}: {
  priceList: HttpTypes.AdminPriceList;
  navigateOnSuccess?: boolean;
}) => {
  const { t } = useTranslation();
  const prompt = usePrompt();
  const navigate = useNavigate();

  const { mutateAsync } = useDeletePriceList(priceList.id);

  return async () => {
    const res = await prompt({
      title: t('general.areYouSure'),
      description: t('priceLists.delete.confirmation', {
        title: priceList.title
      }),
      confirmText: t('actions.delete'),
      cancelText: t('actions.cancel')
    });

    if (!res) {
      return;
    }

    await mutateAsync(undefined, {
      onSuccess: () => {
        toast.success(
          t('priceLists.delete.successToast', {
            title: priceList.title
          })
        );

        if (navigateOnSuccess) {
          navigate('/price-lists');
        }
      },
      onError: e => {
        toast.error(e.message);
      }
    });
  };
};
