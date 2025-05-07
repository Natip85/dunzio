export const UserRoles = [
  "admin",
  "owner",
  "user",
  "investigator",
  "staff",
  "paid",
  "blocked",
] as const;
export type UserRole = (typeof UserRoles)[number];

export const TaskTypes = ["TODO", "IN_PROGRESS", "DONE"] as const;
export type TaskType = (typeof TaskTypes)[number];
