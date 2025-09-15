import { api } from "./api";

export const timeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createTime: builder.mutation({
      query: (time) => ({
        url: `/api/time`,
        method: "POST",
        body: time, // { date, startTime, endTime }
      }),
      invalidatesTags: ["Time"],
    }),
    getTime: builder.query({
      query: () => ({
        url: `/api/time`,
      }),
      providesTags: ["Time"],
    }),
    deleteTime: builder.mutation({
      query: (id) => ({
        url: `/api/time/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Time"],
    }),
    updateTime: builder.mutation({
      query: ({ id, ...rest }) => ({
        url: `/api/time/${id}`,
        method: "PUT",
        body: rest, // { date, startTime, endTime }
      }),
      invalidatesTags: ["Time"],
    }),
  }),
});

export const {
  useCreateTimeMutation,
  useGetTimeQuery,
  useDeleteTimeMutation,
  useUpdateTimeMutation,
} = timeApi;
