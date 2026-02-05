import { useCallback } from 'react';

import { useTalkJS } from '@hooks/api/messages';
import { Spinner } from '@medusajs/icons';
import { Container, Heading, Text } from '@medusajs/ui';
import { Inbox, Session } from '@talkjs/react';
import Talk from 'talkjs';

export const Messages = () => {
  const { isLoading } = useTalkJS();

  const syncUser = useCallback(
    () =>
      new Talk.User({
        id: 'admin',
        name: 'Admin'
      }),
    []
  );

  const talkJsAppId = __TALK_JS_APP_ID__;

  return (
    <Container
      className="min-h-[700px] divide-y p-0"
      data-testid="messages-container"
    >
      <div
        className="flex items-center justify-between px-6 py-4"
        data-testid="messages-header"
      >
        <div>
          <Heading data-testid="messages-heading">Messages</Heading>
        </div>
      </div>
      <div
        className="h-[655px] px-6 py-4"
        data-testid="messages-content"
      >
        {isLoading ? (
          <div
            className="flex items-center justify-center"
            data-testid="messages-loading"
          >
            <Spinner
              className="animate-spin text-ui-fg-interactive"
              data-testid="messages-loading-spinner"
            />
          </div>
        ) : talkJsAppId ? (
          <div
            className="h-full"
            data-testid="messages-inbox"
          >
            <Session
              appId={talkJsAppId}
              syncUser={syncUser}
            >
              <Inbox className="h-full" />
            </Session>
          </div>
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center"
            data-testid="messages-no-app-id"
          >
            <Heading data-testid="messages-no-app-id-heading">No TalkJS App ID</Heading>
            <Text
              className="mt-4 text-ui-fg-subtle"
              size="small"
              data-testid="messages-no-app-id-description"
            >
              Connect TalkJS to manage your messages
            </Text>
          </div>
        )}
      </div>
    </Container>
  );
};
