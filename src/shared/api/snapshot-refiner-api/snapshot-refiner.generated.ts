import { snapshotRefinerBaseApi as api } from "shared/api/snapshot-refiner-api/snapshot-refiner-base-api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProcessExecution: build.query<
      GetProcessExecutionApiResponse,
      GetProcessExecutionApiArg
    >({
      query: (queryArg) => ({ url: `/v1/process/${queryArg.processUuid}` }),
    }),
    getAllProcessExecutions: build.query<
      GetAllProcessExecutionsApiResponse,
      GetAllProcessExecutionsApiArg
    >({
      query: () => ({ url: `/v1/process/` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as snapshotRefinerGeneratedApi };
export type GetProcessExecutionApiResponse =
  /** status 200 Process execution for given UUID */ ProcessExecution;
export type GetProcessExecutionApiArg = {
  /** Process execution UUID */
  processUuid: string;
};
export type GetAllProcessExecutionsApiResponse =
  /** status 200 All process executions */ ProcessExecution[];
export type GetAllProcessExecutionsApiArg = void;
export type ProcessStepExecution = {
  /** Process step execution id */
  stepUuid?: string;
  /** Process step name */
  name?: string;
  /** Process step type */
  processStepType?: ProcessStepType;
  /** Process step status */
  status?: Status;
  /** Process step started at */
  startedAt?: string;
  /** Process step completed at */
  completedAt?: string;
  /** Process step result uuid */
  resultUuid?: string;
  /** Result deletion status */
  resultDeletionStatus?: ResultDeletionStatus;
  /** Process step report uuid */
  reportUuid?: string;
};
export type ProcessExecution = {
  /** Process id */
  processUuid?: string;
  /** Case id */
  caseUuid?: string;
  /** Case name */
  caseName?: string;
  /** Case deletion status */
  caseDeletionStatus?: CaseDeletionStatus;
  /** Report id */
  reportUuid?: string;
  /** Report deletion status */
  reportDeletionStatus?: ReportDeletionStatus;
  /** Process execution status */
  status?: Status;
  /** Process execution started at */
  startedAt?: string;
  /** Process execution completed at */
  completedAt?: string;
  /** User id */
  userId?: string;
  /** List of process execution steps */
  executionSteps?: ProcessStepExecution[];
};
export enum CaseDeletionStatus {
  None = "NONE",
  Failed = "FAILED",
  Successful = "SUCCESSFUL",
  NothingToDelete = "NOTHING_TO_DELETE",
}
export enum ReportDeletionStatus {
  None = "NONE",
  Failed = "FAILED",
  Successful = "SUCCESSFUL",
  NothingToDelete = "NOTHING_TO_DELETE",
}
export enum Status {
  Running = "RUNNING",
  Completed = "COMPLETED",
  Failed = "FAILED",
}
export enum ProcessStepType {
  LoadFlow = "LOAD_FLOW",
  StateEstimation = "STATE_ESTIMATION",
  CaseSaving = "CASE_SAVING",
  NetworkModification = "NETWORK_MODIFICATION",
}
export enum ResultDeletionStatus {
  None = "NONE",
  Failed = "FAILED",
  Successful = "SUCCESSFUL",
  NothingToDelete = "NOTHING_TO_DELETE",
}
export const { useGetProcessExecutionQuery, useGetAllProcessExecutionsQuery } =
  injectedRtkApi;
