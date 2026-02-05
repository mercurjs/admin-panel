import { SingleColumnPageSkeleton } from '@components/common/skeleton';
import { SingleColumnPage } from '@components/layout/pages';
import { useMe } from '@hooks/api';
import { useExtension } from '@providers/extension-provider';
import { ProfileGeneralSection } from '@routes/profile/profile-detail/components/profile-general-section';

export const ProfileDetail = () => {
  const { user, isPending: isLoading, isError, error } = useMe();
  const { getWidgets } = useExtension();

  if (isLoading || !user) {
    return <SingleColumnPageSkeleton sections={1} />;
  }

  if (isError) {
    throw error;
  }

  return (
    <SingleColumnPage
      widgets={{
        after: getWidgets('profile.details.after'),
        before: getWidgets('profile.details.before')
      }}
      data-testid="profile-detail-page"
    >
      <ProfileGeneralSection user={user} />
    </SingleColumnPage>
  );
};
