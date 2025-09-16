import { useState } from "react";
import Layout from "@/Layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2 } from "lucide-react";
import Paginate from "@/components/Paginate";
import {
  useGetTimeQuery,
  useCreateTimeMutation,
  useDeleteTimeMutation,
  useUpdateTimeMutation,
} from "@/redux/queries/timeApi";
import { toast } from "react-toastify";
import Badge from "@/components/Badge";

const TimeManagement = () => {
  const { data: times } = useGetTimeQuery(undefined);
  const [createTime] = useCreateTimeMutation();
  const [deleteTime] = useDeleteTimeMutation();
  const [updateTime] = useUpdateTimeMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);

  const [date, setDate] = useState("");
  const [timeSlots, setTimeSlots] = useState<{ startTime: string; endTime: string }[]>([]);
  const [page, setPage] = useState(1);

  console.log(date);
  // Open modal for adding or editing
  const openModalForAdd = () => {
    setDate("");
    setTimeSlots([]);
    setEditingTimeId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (time: any) => {
    setEditingTimeId(time._id);
    setDate(time.date?.slice(0, 10));
    setTimeSlots(
      time.times?.map((t: any) => ({ startTime: t.startTime, endTime: t.endTime })) || []
    );
    setIsModalOpen(true);
  };

  const handleAddOrUpdateTime = async () => {
    if (!date || timeSlots.length === 0) {
      toast.error("Date and at least one time slot are required");
      return;
    }

    for (const slot of timeSlots) {
      if (!slot.startTime || !slot.endTime) {
        toast.error("All time slots must have Start and End time");
        return;
      }
    }

    try {
      if (editingTimeId) {
        await updateTime({ id: editingTimeId, date, times: timeSlots }).unwrap();
        toast.success("Time slots updated");
      } else {
        await createTime({ date, times: timeSlots }).unwrap();
        toast.success("Time slots added");
      }

      setDate("");
      setTimeSlots([]);
      setEditingTimeId(null);
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save time slots");
    }
  };

  const handleDeleteTime = async (id: string) => {
    try {
      await deleteTime(id).unwrap();
      toast.success("Time deleted");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete time");
    }
  };

  console.log(times);

  return (
    <Layout>
      <div className="px-4 flex flex-col w-4xl min-h-screen py-3 mt-[70px]">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-2xl font-bold">Time Periods ({times?.length || 0})</h1>
          <Button onClick={openModalForAdd}>
            <Plus /> Add Time
          </Button>
        </div>

        <div className="rounded-lg border mt-4 p-5 bg-white overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="">
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {times?.length ? (
                times.map((time: any) => {
                  const slotCount = time.times?.length || 1; // number of slots for this date
                  const d = new Date(time.date);
                  const dayNames = [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ];
                  const dayName = dayNames[d.getDay()];

                  return time.times?.map((slot: any, i: number) => (
                    <tr key={`${time._id}-${i}`} className="border-t">
                      {/* Show the day only for the first slot */}
                      {i === 0 && (
                        <td className="px-4 py-3 font-semibold" rowSpan={slotCount}>
                          {dayName} {/* Day name */}
                        </td>
                      )}

                      {/* Show the date only for the first slot */}
                      {i === 0 && (
                        <td className="px-4 py-3 font-semibold" rowSpan={slotCount}>
                          {time.date?.slice(0, 10)}
                        </td>
                      )}

                      <td className="px-4 py-3">
                        {slot.startTime} - {slot.endTime}
                      </td>

                      <td className="px-4 py-3 font-semibold rounded-md">
                        {slot.reserved ? (
                          <Badge icon={false}>Reserved</Badge>
                        ) : (
                          <Badge icon={false} variant="success">
                            Available
                          </Badge>
                        )}
                      </td>

                      <td className="px-4 py-3 flex gap-2">
                        {i === 0 && (
                          <Button variant="outline" size="sm" onClick={() => handleEdit(time)}>
                            <Edit2 size={16} />
                          </Button>
                        )}
                        {i === 0 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteTime(time._id)}>
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ));
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    No time periods found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Paginate page={page} pages={1} setPage={setPage} />
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-lg w-full overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingTimeId ? "Edit Time" : "Add Time"}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-6 mt-4">
              {/* Date Input */}
              <div className="flex flex-col">
                <label className="font-semibold mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="p-2 border rounded-md w-full"
                />
              </div>

              {/* Time Slots */}
              <div className="flex flex-col gap-4">
                {timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 gap-4 items-end bg-gray-50 p-3 rounded-md border">
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1">Start Time</label>
                      <input
                        type="text"
                        value={slot.startTime}
                        onChange={(e) => {
                          const newSlots = [...timeSlots];
                          newSlots[index].startTime = e.target.value;
                          setTimeSlots(newSlots);
                        }}
                        className="p-2 border rounded-md w-full"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1">End Time</label>
                      <input
                        type="text"
                        value={slot.endTime}
                        onChange={(e) => {
                          const newSlots = [...timeSlots];
                          newSlots[index].endTime = e.target.value;
                          setTimeSlots(newSlots);
                        }}
                        className="p-2 border rounded-md w-full"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const newSlots = [...timeSlots];
                          newSlots.splice(index, 1);
                          setTimeSlots(newSlots);
                        }}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Add Another Time */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTimeSlots([...timeSlots, { startTime: "", endTime: "" }])}>
                  Add Another Time
                </Button>
              </div>
            </div>

            <DialogFooter className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddOrUpdateTime}>{editingTimeId ? "Update" : "Add"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default TimeManagement;
