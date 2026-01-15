import { ActionMenu } from '@components/common/action-menu';
import { PencilSquare, Trash } from '@medusajs/icons';
import type { HttpTypes } from '@medusajs/types';
import { Container, Heading, StatusBadge, Text } from '@medusajs/ui';
import { useDeleteProductCategoryAction } from '@routes/categories/common/hooks/use-delete-product-category-action';
import { getIsActiveProps, getIsInternalProps } from '@routes/categories/common/utils';
import { useTranslation } from 'react-i18next';

type CategoryGeneralSectionProps = {
  category: HttpTypes.AdminProductCategory;
};

export const CategoryGeneralSection = ({ category }: CategoryGeneralSectionProps) => {
  const { t } = useTranslation();

  const activeProps = getIsActiveProps(category.is_active, t);
  const internalProps = getIsInternalProps(category.is_internal, t);

  const handleDelete = useDeleteProductCategoryAction(category);

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>{category.name}</Heading>
        <div className="flex items-center gap-x-4">
          <div className="flex items-center gap-x-2">
            <StatusBadge color={activeProps.color}>{activeProps.label}</StatusBadge>
            <StatusBadge color={internalProps.color}>{internalProps.label}</StatusBadge>
          </div>
          <ActionMenu
            groups={[
              {
                actions: [
                  {
                    label: t('actions.edit'),
                    icon: <PencilSquare />,
                    to: 'edit'
                  }
                ]
              },
              {
                actions: [
                  {
                    label: t('actions.delete'),
                    icon: <Trash />,
                    onClick: handleDelete
                  }
                ]
              }
            ]}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 px-6 py-4 text-ui-fg-subtle">
        <Text
          size="small"
          leading="compact"
          weight="plus"
        >
          {t('fields.description')}
        </Text>
        <Text
          size="small"
          leading="compact"
        >
          {category.description || '-'}
        </Text>
      </div>
      <div className="grid grid-cols-2 gap-3 px-6 py-4 text-ui-fg-subtle">
        <Text
          size="small"
          leading="compact"
          weight="plus"
        >
          {t('fields.handle')}
        </Text>
        <Text
          size="small"
          leading="compact"
        >
          /{category.handle}
        </Text>
      </div>
    </Container>
  );
};
