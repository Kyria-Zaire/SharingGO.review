export const incidentInclude = {
  creator: {
    select: { id: true, email: true, firstName: true, lastName: true },
  },
  resolver: {
    select: { id: true, email: true, firstName: true, lastName: true },
  },
  assignee: {
    select: { id: true, email: true, firstName: true, lastName: true },
  },
} as const;
