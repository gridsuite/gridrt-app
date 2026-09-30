import { exploreBaseApi as api } from "shared/api/explore-api/explore-base-api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    downloadCase: build.query<DownloadCaseApiResponse, DownloadCaseApiArg>({
      query: (queryArg) => ({ url: `/v1/explore/cases/${queryArg.caseUuid}` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as exploreGeneratedApi };
export type DownloadCaseApiResponse = /** status 200 OK */ Blob;
export type DownloadCaseApiArg = {
  caseUuid: string;
};
export const { useDownloadCaseQuery } = injectedRtkApi;
