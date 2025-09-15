import { api } from "./api";

export const planApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createPlan: builder.mutation({
      query: (data) => ({
        url: "/api/plans",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Plan"],
    }),
    uploadPlanImage: builder.mutation({
      query: (data) => ({
        url: "/api/upload/plans",
        method: "POST",
        body: data,
      }),
    }),
    getPlans: builder.query({
      query: () => ({
        url: "/api/plans",
      }),
      providesTags: ["Plan"],
    }),
    getPlanById: builder.query({
      query: (id) => ({
        url: `/api/plans/${id}`,
      }),
      providesTags: ["Plan"],
    }),
    deletePlan: builder.mutation({
      query: (id) => ({
        url: `/api/plans/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Plan"],
    }),
    updatePlan: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/plans/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Plan"],
    }),
  }),
});

export const {
  useCreatePlanMutation,
  useUploadPlanImageMutation,
  useGetPlansQuery,
  useGetPlanByIdQuery,
  useDeletePlanMutation,
  useUpdatePlanMutation,
} = planApi;
