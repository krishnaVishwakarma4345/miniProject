/**
 * Firestore Query Helpers
 * ============================================================
 * Helper functions for common Firestore query patterns:
 * - Pagination (cursor-based)
 * - Filtering
 * - Sorting
 * - Aggregation
 */

import {
  DocumentData,
  DocumentSnapshot,
  QueryConstraint,
  orderBy as firestoreOrderBy,
  limit as firestoreLimit,
  startAfter,
  startAt,
  where,
  WhereFilterOp,
  Query,
  query,
  collection,
  Firestore,
  QueryFieldFilterConstraint,
  QueryOrderByConstraint,
  QueryLimitConstraint,
} from "firebase/firestore";

/**
 * Pagination result type
 */
export interface PaginationResult<T extends DocumentData> {
  items: T[];
  nextCursor: DocumentSnapshot<T> | null;
  hasMore: boolean;
  pageSize: number;
}

/**
 * Sort order type
 */
export type SortOrder = "asc" | "desc";

/**
 * Build where clause for Firestore query
 * @param field - Field name
 * @param operator - Comparison operator
 * @param value - Value to compare
 * @returns QueryConstraint
 */
export const buildWhereClause = (
  field: string,
  operator: WhereFilterOp,
  value: any
): QueryFieldFilterConstraint => {
  return where(field, operator, value);
};

/**
 * Build multiple where clauses
 * @param conditions - Array of [field, operator, value] tuples
 * @returns Array of QueryConstraints
 */
export const buildWhereMultiple = (
  conditions: Array<[string, WhereFilterOp, any]>
): QueryFieldFilterConstraint[] => {
  return conditions.map(([field, operator, value]) =>
    where(field, operator, value)
  );
};

/**
 * Build order by clause for Firestore query
 * @param field - Field name
 * @param direction - Sort direction (asc or desc)
 * @returns QueryOrderByConstraint
 */
export const buildOrderBy = (
  field: string,
  direction: SortOrder = "asc"
): QueryOrderByConstraint => {
  return firestoreOrderBy(field, direction);
};

/**
 * Build limit clause for Firestore query
 * @param pageSize - Number of documents to fetch
 * @returns QueryLimitConstraint
 */
export const buildLimit = (pageSize: number): QueryLimitConstraint => {
  return firestoreLimit(pageSize);
};

/**
 * Build cursor-based pagination query
 * @param constraints - Base query constraints (where, orderBy, etc.)
 * @param pageSize - Number of items per page
 * @param cursor - Previous last document (for pagination)
 * @returns Array of QueryConstraints with cursor offset
 */
export const buildPaginationConstraints = (
  constraints: QueryConstraint[],
  pageSize: number,
  cursor?: DocumentSnapshot<DocumentData>
): QueryConstraint[] => {
  const paginationConstraints = [...constraints];

  // Add cursor offset if provided
  if (cursor) {
    paginationConstraints.push(startAfter(cursor));
  }

  // Add limit (get one extra to determine if there are more)
  paginationConstraints.push(firestoreLimit(pageSize + 1));

  return paginationConstraints;
};

/**
 * Build exact match query
 * @param field - Field name
 * @param value - Exact value to match
 * @returns QueryConstraint
 */
export const buildExactMatch = (field: string, value: any): QueryFieldFilterConstraint => {
  return where(field, "==", value);
};

/**
 * Build array contains query
 * @param field - Array field name
 * @param value - Value to search for in array
 * @returns QueryConstraint
 */
export const buildArrayContains = (field: string, value: any): QueryFieldFilterConstraint => {
  return where(field, "array-contains", value);
};

/**
 * Build array contains any query
 * @param field - Array field name
 * @param values - Values to search for in array
 * @returns QueryConstraint
 */
export const buildArrayContainsAny = (field: string, values: any[]): QueryFieldFilterConstraint => {
  return where(field, "array-contains-any", values);
};

/**
 * Build in query
 * @param field - Field name
 * @param values - Array of values to match
 * @returns QueryConstraint
 */
export const buildIn = (field: string, values: any[]): QueryFieldFilterConstraint => {
  return where(field, "in", values);
};

/**
 * Build range queries
 */
export const buildGreaterThan = (field: string, value: any): QueryFieldFilterConstraint => {
  return where(field, ">", value);
};

export const buildGreaterThanOrEqual = (field: string, value: any): QueryFieldFilterConstraint => {
  return where(field, ">=", value);
};

export const buildLessThan = (field: string, value: any): QueryFieldFilterConstraint => {
  return where(field, "<", value);
};

export const buildLessThanOrEqual = (field: string, value: any): QueryFieldFilterConstraint => {
  return where(field, "<=", value);
};

export const buildNotEqual = (field: string, value: any): QueryFieldFilterConstraint => {
  return where(field, "!=", value);
};

/**
 * Build date range query
 * @param field - Field name
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Array of QueryConstraints
 */
export const buildDateRange = (
  field: string,
  startDate: Date,
  endDate: Date
): QueryFieldFilterConstraint[] => {
  return [
    where(field, ">=", startDate),
    where(field, "<=", endDate),
  ];
};

/**
 * Process pagination result from Firestore query
 * @param docs - Array of documents from query
 * @param pageSize - Original page size (without +1)
 * @returns PaginationResult with items, nextCursor, and hasMore flag
 */
export const processPaginationResult = <T extends DocumentData>(
  docs: DocumentSnapshot<T>[],
  pageSize: number
): PaginationResult<T> => {
  const hasMore = docs.length > pageSize;
  const items = docs.slice(0, pageSize).map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as T & { id: string }));

  const nextCursor = hasMore ? docs[pageSize] : null;

  return {
    items,
    nextCursor,
    hasMore,
    pageSize,
  };
};

/**
 * Create a composite query from multiple constraints
 * @param collectionRef - Collection reference or path
 * @param constraints - Array of QueryConstraints
 * @returns Query object
 */
export const buildCompositeQuery = (
  collectionRef: any,
  constraints: QueryConstraint[]
): Query => {
  return query(collectionRef, ...constraints);
};

/**
 * Helper to combine multiple where conditions with AND logic
 * @param conditions - Array of [field, operator, value] tuples
 * @returns Array of QueryConstraints
 */
export const buildAndConditions = (
  conditions: Array<[string, WhereFilterOp, any]>
): QueryConstraint[] => {
  return conditions.map(([field, operator, value]) =>
    where(field, operator, value)
  );
};

/**
 * Note: Firestore doesn't support OR directly at query level
 * For OR queries, you need to:
 * 1. Run multiple queries with different where clauses
 * 2. Combine results in client code
 * 3. Use a denormalized data structure
 * 4. Use Firebase's IN operator for limited OR scenarios
 */
export const buildOrConditions = (
  field: string,
  values: any[]
): QueryFieldFilterConstraint => {
  // Use IN operator for simple OR queries
  return where(field, "in", values);
};

/**
 * Helper to sort results by multiple fields
 * @param results - Array of results
 * @param sortBy - Array of [field, direction] tuples
 * @returns Sorted array
 */
export const sortResults = <T extends Record<string, any>>(
  results: T[],
  sortBy: Array<[string, SortOrder]>
): T[] => {
  return [...results].sort((a, b) => {
    for (const [field, direction] of sortBy) {
      if (a[field] < b[field]) return direction === "asc" ? -1 : 1;
      if (a[field] > b[field]) return direction === "asc" ? 1 : -1;
    }
    return 0;
  });
};

/**
 * Helper to filter results on client side
 * @param results - Array of results
 * @param predicate - Filter function
 * @returns Filtered array
 */
export const filterResults = <T extends DocumentData>(
  results: T[],
  predicate: (item: T) => boolean
): T[] => {
  return results.filter(predicate);
};
