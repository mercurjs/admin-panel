import { useEffect, useState, type PropsWithChildren } from 'react';

import { useStateAwareTo } from '@components/modals/hooks/use-state-aware-to';
import { RouteModalForm } from '@components/modals/route-modal-form';
import { useRouteModal } from '@components/modals/route-modal-provider';
import { RouteModalProvider } from '@components/modals/route-modal-provider/route-provider';
import { StackedModalProvider } from '@components/modals/stacked-modal-provider';
import { clx, FocusModal } from '@medusajs/ui';
import { useNavigate, type Path } from 'react-router-dom';

type RouteFocusModalProps = PropsWithChildren<{
  prev?: string | Partial<Path>;
}>;

const Root = ({ prev = '..', children }: RouteFocusModalProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [stackedModalOpen, onStackedModalOpen] = useState(false);

  const to = useStateAwareTo(prev);

  /**
   * Open the modal when the component mounts. This
   * ensures that the entry animation is played.
   */
  useEffect(() => {
    setOpen(true);

    return () => {
      setOpen(false);
      onStackedModalOpen(false);
    };
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      document.body.style.pointerEvents = 'auto';
      navigate(to, { replace: true });

      return;
    }

    setOpen(open);
  };

  return (
    <FocusModal
      open={open}
      onOpenChange={handleOpenChange}
    >
      <RouteModalProvider prev={to}>
        <StackedModalProvider onOpenChange={onStackedModalOpen}>
          <Content stackedModalOpen={stackedModalOpen}>{children}</Content>
        </StackedModalProvider>
      </RouteModalProvider>
    </FocusModal>
  );
};

type ContentProps = PropsWithChildren<{
  stackedModalOpen: boolean;
}>;

const Content = ({ stackedModalOpen, children }: ContentProps) => {
  const { __internal } = useRouteModal();

  const shouldPreventClose = !__internal.closeOnEscape;

  return (
    <FocusModal.Content
      onEscapeKeyDown={
        shouldPreventClose
          ? e => {
              e.preventDefault();
            }
          : undefined
      }
      className={clx({
        '!inset-x-5 !inset-y-3 !bg-ui-bg-disabled': stackedModalOpen
      })}
    >
      {children}
    </FocusModal.Content>
  );
};

const Header = FocusModal.Header;
const Title = FocusModal.Title;
const Description = FocusModal.Description;
const Footer = FocusModal.Footer;
const Body = FocusModal.Body;
const Close = FocusModal.Close;
const Form = RouteModalForm;

/**
 * FocusModal that is used to render a form on a separate route.
 *
 * Typically used for forms creating a resource or forms that require
 * a lot of space.
 */
export const RouteFocusModal = Object.assign(Root, {
  Header,
  Title,
  Body,
  Description,
  Footer,
  Close,
  Form
});
