import { useEffect, useState } from 'react';

import { useReviewRequest } from '@hooks/api/requests';
import { Button, Divider, Label, Prompt, Textarea, toast } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';

type Props = {
  close: () => void;
  onSuccess?: () => void;
  open: boolean;
  id: string;
  accept: boolean;
  description?: string;
  toastMessage?: string;
};

export function ResolveRequestPrompt({
  open,
  id,
  accept,
  close,
  onSuccess,
  toastMessage,
  description
}: Props) {
  const { t } = useTranslation();
  const [note, setNote] = useState('');
  const { mutateAsync: reviewRequest } = useReviewRequest({});

  useEffect(() => {
    setNote('');
  }, [open, id, accept]);

  const handleReview = async () => {
    try {
      const status = accept ? 'accepted' : 'rejected';
      await reviewRequest({
        id,
        payload: {
          reviewer_note: note,
          status
        }
      });
      toast.success(toastMessage || `Successfuly ${status}!`);
      onSuccess?.();
    } catch (e: unknown) {
      toast.error(`Error: ${(e as Error).message}`);
    } finally {
      close();
    }
  };

  return (
    <Prompt
      open={open}
      data-testid={`resolve-request-prompt-${id}`}
    >
      <Prompt.Content data-testid={`resolve-request-prompt-${id}-content`}>
        <Prompt.Header
          data-testid={`resolve-request-prompt-${id}-header`}
          className="py-4"
        >
          <Prompt.Title data-testid={`resolve-request-prompt-${id}-title`}>
            {accept ? t('requests.resolve.accept.title') : t('requests.resolve.reject.title')}
          </Prompt.Title>
          <Prompt.Description data-testid={`resolve-request-prompt-${id}-description`}>
            {description || 'You can provide short note on your decision'}
          </Prompt.Description>
        </Prompt.Header>
        <Divider />
        <div className="px-6 py-4">
          <Label
            htmlFor="note"
            size="small"
            data-testid={`resolve-request-prompt-${id}-note-label`}
            className="text-ui-fg-subtle"
          >
            {t('requests.resolve.notesLabel')}{' '}
            <span className="text-ui-fg-muted">({t('fields.optional')})</span>
          </Label>
          <Textarea
            name="note"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={
              accept
                ? t('requests.resolve.accept.placeholder')
                : t('requests.resolve.reject.placeholder')
            }
            className="mt-2"
            data-testid={`resolve-request-prompt-${id}-note-input`}
          />
        </div>
        <Divider />
        <Prompt.Footer
          data-testid={`resolve-request-prompt-${id}-footer`}
          className="py-4"
        >
          <Button
            variant="secondary"
            onClick={close}
            data-testid={`resolve-request-prompt-${id}-cancel-button`}
          >
            {t('actions.cancel')}
          </Button>
          <Button
            onClick={handleReview}
            data-testid={`resolve-request-prompt-${id}-submit-button`}
          >
            {accept ? t('actions.accept') : t('actions.reject')}
          </Button>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  );
}
