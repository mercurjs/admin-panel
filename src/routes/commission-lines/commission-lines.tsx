import { useState } from "react";

import { History } from "@medusajs/icons";
import { Container, Heading, Table, Text } from "@medusajs/ui";

import type { CommissionLine } from "@custom-types/commission";

import { useListCommissionLines } from "@hooks/api";

import { ActionMenu } from "@routes/commission-lines/components/action-menu";
import { CommissionLineDetail } from "@routes/commission-lines/components/commission-detail";

import { formatDate } from "@/lib/date";

const PAGE_SIZE = 20;

export const CommissionLines = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCommission, setDetailCommission] = useState<
    CommissionLine | undefined
  >(undefined);

  const handleDetail = (commission: CommissionLine) => {
    setDetailCommission(commission);
    setDetailOpen(true);
  };

  const { data, isLoading } = useListCommissionLines({
    offset: currentPage * PAGE_SIZE,
    limit: PAGE_SIZE,
  });

  return (
    <Container>
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Commission Lines</Heading>

          <CommissionLineDetail
            line={detailCommission}
            open={detailOpen}
            close={() => {
              setDetailOpen(false);
            }}
          />
        </div>
      </div>
      <div className="flex size-full flex-col overflow-hidden">
        {isLoading && <Text>Loading...</Text>}
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Seller</Table.HeaderCell>
              <Table.HeaderCell>Order</Table.HeaderCell>
              <Table.HeaderCell>Value</Table.HeaderCell>
              <Table.HeaderCell>Date</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data?.commission_lines?.map((line: CommissionLine) => {
              return (
                <Table.Row key={line.id}>
                  <Table.Cell>{line.order?.seller?.name || "-"}</Table.Cell>
                  <Table.Cell>{line.order?.display_id ? `#${line.order?.display_id}` : "-"}</Table.Cell>
                  <Table.Cell>{`${line.value.toFixed(2)} ${line.currency_code.toUpperCase()}`}</Table.Cell>

                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <History />
                      {formatDate(line.created_at!)}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <ActionMenu handleDetail={handleDetail} line={line} />
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
        <Table.Pagination
          className="w-full"
          canNextPage={PAGE_SIZE * (currentPage + 1) < (data?.count || 0)}
          canPreviousPage={currentPage > 0}
          previousPage={() => {
            setCurrentPage(currentPage - 1);
          }}
          nextPage={() => {
            setCurrentPage(currentPage + 1);
          }}
          count={data?.count || 0}
          pageCount={Math.ceil((data?.count || 0) / PAGE_SIZE)}
          pageIndex={currentPage}
          pageSize={PAGE_SIZE}
        />
      </div>
    </Container>
  );
};
