import { SingleColumnPage } from '@components/layout/pages';
import { useExtension } from '@providers/extension-provider';
import { WorkflowExecutionListTable } from '@routes/workflow-executions/workflow-execution-list/components/workflow-execution-list-table';

export const WorkflowExcecutionList = () => {
  const { getWidgets } = useExtension();

  return (
    <SingleColumnPage
      widgets={{
        after: getWidgets('workflow.list.after'),
        before: getWidgets('workflow.list.before')
      }}
      hasOutlet={false}
      data-testid="workflows-list-page"
    >
      <WorkflowExecutionListTable />
    </SingleColumnPage>
  );
};
