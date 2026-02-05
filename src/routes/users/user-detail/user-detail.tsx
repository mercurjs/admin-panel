import { SingleColumnPageSkeleton } from '@components/common/skeleton';
import { SingleColumnPage } from '@components/layout/pages';
import { useUser } from '@hooks/api';
import { useExtension } from '@providers/extension-provider';
import { UserGeneralSection } from '@routes/users/user-detail/components/user-general-section';
import type { userLoader } from '@routes/users/user-detail/loader';
import { useLoaderData, useParams } from 'react-router-dom';

export const UserDetail = () => {
  const initialData = useLoaderData() as Awaited<ReturnType<typeof userLoader>>;

  const { id } = useParams();
  const {
    user,
    isPending: isLoading,
    isError,
    error
  } = useUser(id!, undefined, {
    initialData
  });

  const { getWidgets } = useExtension();

  if (isLoading || !user) {
    return (
      <SingleColumnPageSkeleton
        sections={1}
        showJSON
        showMetadata
      />
    );
  }

  if (isError) {
    throw error;
  }

  return (
    <SingleColumnPage
      data={user}
      showJSON
      showMetadata
      widgets={{
        after: getWidgets('user.details.after'),
        before: getWidgets('user.details.before')
      }}
    >
      <UserGeneralSection user={user} />
    </SingleColumnPage>
  );
};
