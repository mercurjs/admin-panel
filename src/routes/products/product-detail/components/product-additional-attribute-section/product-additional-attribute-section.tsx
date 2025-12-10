import { useEffect, useState } from 'react';

import { InformationCircleSolid, PencilSquare } from '@medusajs/icons';
import { Button, Container, Heading, Label, Table, Tooltip, toast } from '@medusajs/ui';

import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { ActionMenu } from '@components/common/action-menu';
import { RouteDrawer } from '@components/modals';
import { useProduct, useProductAttributes, useUpdateProduct } from '@hooks/api';
import { FormComponents } from '@routes/products/product-detail/components/product-additional-attribute-section/components/form-components';

export const ProductAdditionalAttributeSection = () => {
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const { product, isLoading: isProductLoading } = useProduct(id!, {
    fields: 'attribute_values.*,attribute_values.attribute.*'
  });

  const { data, isLoading } = useProductAttributes(id!);

  const attributes = data?.attributes || [];

  const { mutate: updateProduct } = useUpdateProduct(id!);

  const form = useForm<any>({
    defaultValues: {}
  });

  // Reset form when product data is loaded
  useEffect(() => {
    if (product?.attribute_values) {
      product.attribute_values
        .filter((curr: any) => curr && curr.attribute_id)
        .forEach((curr: any) => {
          form.setValue(curr.attribute_id, curr.value);
        });
    }
  }, [product?.attribute_values, form]);

  const onSubmit = (data: any) => {
    const formattedData = Object.keys(data).map(key => {
      const attribute = attributes.find((a: any) => a.id === key && a.ui_component === 'select');
      const value = attribute?.possible_values?.find((pv: any) => pv.id === data[key])?.value;

      return (
        value && {
          [key]: value
        }
      );
    });
    const payload = {
      ...data,
      ...Object.assign({}, ...formattedData.filter(Boolean))
    };

    const values = Object.keys(payload).reduce((acc: Array<Record<string, string>>, key) => {
      acc.push({ attribute_id: key, value: payload[key] });

      return acc;
    }, []);

    updateProduct(
      {
        additional_data: { values }
      },
      {
        onSuccess: () => {
          toast.success('Product updated successfully');
          setOpen(false);
        }
      }
    );
  };

  if (isLoading || isProductLoading) return <div>Loading...</div>;

  return (
    <>
      <div>
        <Container
          className="divide-y p-0 pb-2"
          data-testid="product-additional-attributes-section"
        >
          <div
            className="flex items-center justify-between px-6 py-4"
            data-testid="product-additional-attributes-header"
          >
            <Heading
              level="h2"
              data-testid="product-additional-attributes-title"
            >
              Additional Attributes
            </Heading>
            <ActionMenu
              groups={[
                {
                  actions: [
                    {
                      label: 'Edit',
                      onClick: () => setOpen(true),
                      icon: <PencilSquare />
                    }
                  ]
                }
              ]}
              data-testid="product-additional-attributes-action-menu"
            />
          </div>

          <div
            className="mb-6"
            data-testid="product-additional-attributes-table-container"
          >
            <Table data-testid="product-additional-attributes-table">
              <Table.Body data-testid="product-additional-attributes-table-body">
                {product?.attribute_values
                  ?.filter((attribute: any) => attribute && attribute.attribute_id)
                  .map((attribute: any) => (
                    <Table.Row
                      key={attribute?.id}
                      data-testid={`product-additional-attribute-row-${attribute?.id}`}
                    >
                      <Table.Cell
                        data-testid={`product-additional-attribute-name-cell-${attribute?.id}`}
                      >
                        {attribute?.attribute?.name}
                      </Table.Cell>
                      <Table.Cell
                        data-testid={`product-additional-attribute-value-cell-${attribute?.id}`}
                      >
                        {attribute?.value}
                      </Table.Cell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table>
          </div>
        </Container>
      </div>
      {open && (
        <RouteDrawer data-testid="product-additional-attributes-drawer">
          <RouteDrawer.Header data-testid="product-additional-attributes-drawer-header">
            <Heading
              level="h2"
              data-testid="product-additional-attributes-drawer-title"
            >
              Additional Attributes
            </Heading>
          </RouteDrawer.Header>
          <RouteDrawer.Body
            className="m-4 max-h-[calc(86vh)] overflow-y-auto py-2"
            data-testid="product-additional-attributes-drawer-body"
          >
            <FormProvider {...form}>
              <form
                id="product-additional-attributes-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="p-0"
                data-testid="product-additional-attributes-form"
              >
                {attributes.map((a: any) => (
                  <div
                    key={`form-field-${a.handle}-${a.id}`}
                    className="-mx-4 mb-4"
                    data-testid={`product-additional-attribute-field-${a.id}`}
                  >
                    <Label
                      className="mb-2 flex items-center gap-x-2"
                      data-testid={`product-additional-attribute-label-${a.id}`}
                    >
                      {a.name}
                      {a.description && (
                        <Tooltip
                          content={a.description}
                          data-testid={`product-additional-attribute-tooltip-${a.id}`}
                        >
                          <InformationCircleSolid />
                        </Tooltip>
                      )}
                    </Label>
                    <div data-testid={`product-additional-attribute-input-${a.id}`}>
                      <FormComponents
                        attribute={a}
                        field={{
                          name: a.id,
                          value: form.watch(a.id),
                          defaultValue: form.getValues(a.id),
                          onChange: (e: any) => {
                            form.setValue(a.id, e.target.value);
                          }
                        }}
                        data-testid={`product-additional-attribute-input-${a.id}-component`}
                      />
                    </div>
                  </div>
                ))}
              </form>
            </FormProvider>
          </RouteDrawer.Body>
          <RouteDrawer.Footer data-testid="product-additional-attributes-drawer-footer">
            <div
              className="flex items-center justify-end gap-x-2"
              data-testid="product-additional-attributes-form-actions"
            >
              <RouteDrawer.Close
                asChild
                data-testid="product-additional-attributes-cancel-button-wrapper"
              >
                <Button
                  variant="secondary"
                  size="small"
                  data-testid="product-additional-attributes-cancel-button"
                >
                  Cancel
                </Button>
              </RouteDrawer.Close>
              <Button
                size="small"
                type="submit"
                form="product-additional-attributes-form"
                data-testid="product-additional-attributes-save-button"
              >
                Save
              </Button>
            </div>
          </RouteDrawer.Footer>
        </RouteDrawer>
      )}
    </>
  );
};
