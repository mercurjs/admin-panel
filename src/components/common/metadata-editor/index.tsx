import { EllipsisHorizontal, Trash } from '@medusajs/icons';
import { Button, DropdownMenu, Heading, Input, Text } from '@medusajs/ui';
import {
  useFieldArray,
  type ArrayPath,
  type FieldArray,
  type FieldError,
  type FieldErrors,
  type FieldValues,
  type Path,
  type UseFormReturn
} from 'react-hook-form';

interface MetadataField {
  key: string;
  value: string;
}

interface MetadataEditorProps<T extends FieldValues & { metadata: MetadataField[] }> {
  form: UseFormReturn<T>;
  name?: ArrayPath<T>;
  title?: string;
}

export const MetadataEditor = <T extends FieldValues & { metadata: MetadataField[] }>({
  form,
  name = 'metadata' as ArrayPath<T>,
  title = 'Metadata'
}: MetadataEditorProps<T>) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name
  });

  const getErrorMessage = (error: FieldError | undefined) => {
    return error?.message ? String(error.message) : '';
  };

  const getFieldErrors = (index: number) => {
    const errors = form.formState.errors[name] as FieldErrors<MetadataField[]> | undefined;

    return {
      key: errors?.[index]?.key,
      value: errors?.[index]?.value
    };
  };

  return (
    <div className="col-span-2 mt-4">
      <Heading
        level="h3"
        className="inter-small-semibold mb-2"
      >
        {title}
      </Heading>
      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-[1fr_1fr_40px] border-b bg-ui-bg-subtle px-3 py-2 text-sm font-semibold text-ui-fg-subtle">
          <span className="border-r pr-2">Key</span>
          <span>Value</span>
          <span></span>
        </div>
        {fields.map((field, index) => {
          const fieldErrors = getFieldErrors(index);

          return (
            <div
              key={field.id}
              className="grid grid-cols-[1fr_1fr_40px] items-center border-b last:border-b-0"
            >
              <div className="border-r py-2 pl-3 pr-2">
                <Input
                  placeholder="Key"
                  className="!border-none bg-transparent !shadow-none focus-visible:!outline-none"
                  {...form.register(`${name}.${index}.key` as Path<T>)}
                />
                {fieldErrors.key && (
                  <Text className="mt-1 text-sm text-red-500">
                    {getErrorMessage(fieldErrors.key)}
                  </Text>
                )}
              </div>
              <div className="py-2 pl-3 pr-2">
                <Input
                  placeholder="Value"
                  className="!border-none bg-transparent !shadow-none focus-visible:!outline-none"
                  {...form.register(`${name}.${index}.value` as Path<T>)}
                />
                {fieldErrors.value && (
                  <Text className="mt-1 text-sm text-red-500">
                    {getErrorMessage(fieldErrors.value)}
                  </Text>
                )}
              </div>
              <div className="flex justify-end pr-3">
                <DropdownMenu>
                  <DropdownMenu.Trigger asChild>
                    <Button
                      variant="transparent"
                      size="small"
                    >
                      <EllipsisHorizontal />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end">
                    <DropdownMenu.Item
                      onClick={() => remove(index)}
                      className="gap-x-2"
                    >
                      <Trash className="text-ui-fg-subtle" />
                      Remove
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
        <div className="p-3">
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={() => append({ key: '', value: '' } as FieldArray<T, ArrayPath<T>>)}
            className="w-full"
          >
            + Add Row
          </Button>
        </div>
      </div>
    </div>
  );
};
