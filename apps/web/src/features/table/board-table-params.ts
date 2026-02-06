import { parseAsJson } from "nuqs";
import { createLoader } from "nuqs/server";
import { z } from "zod/v4";

import { columns as columnDefs } from "./board-columns";
import { useGenericTableParams } from "./use-table-params";

const availableColumns = ["id", "title", "key", "priority", "assignee", "type"] as const;
type ColumnName = (typeof availableColumns)[number];

const columnLabelsMap: Record<ColumnName, string> = {
  id: "ID",
  title: "Title",
  key: "Key",
  priority: "Priority",
  assignee: "Assignee",
  type: "Type",
};

const availableColumnsEnum = z.enum(availableColumns);

const columnSchema = z.partialRecord(availableColumnsEnum, z.boolean());

const columnsListSchema = z.array(columnSchema);

type ColumnsList = z.infer<typeof columnsListSchema>;

const defaultColumns: ColumnsList = [
  { id: false },
  { title: true },
  { key: true },
  { priority: true },
  { assignee: true },
  { type: true },
];

export const tableParamsParser = {
  columns: parseAsJson((value) => columnsListSchema.parse(value)).withDefault(defaultColumns),
};

export const loadTableParams = createLoader(tableParamsParser);

export const useBoardTableParams = () => {
  return useGenericTableParams({
    columnLabelsMap,
    columnDefs,
    availableColumns,
    tableParamsParser,
  });
};
