import { exploreBaseApi as api } from "shared/api/explore-api/explore-base-api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    duplicateExistingCase: build.mutation<
      DuplicateExistingCaseApiResponse,
      DuplicateExistingCaseApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/explore/cases/${queryArg.caseName}/duplicate-existing`,
        method: "POST",
        params: {
          sourceCaseUuid: queryArg.sourceCaseUuid,
          description: queryArg.description,
          parentDirectoryUuid: queryArg.parentDirectoryUuid,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as exploreGeneratedApi };
export type DuplicateExistingCaseApiResponse = unknown;
export type DuplicateExistingCaseApiArg = {
  caseName: string;
  sourceCaseUuid: string;
  description: string;
  parentDirectoryUuid: string;
};
export const { useDuplicateExistingCaseMutation } = injectedRtkApi;
