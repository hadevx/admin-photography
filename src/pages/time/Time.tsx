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

// ✅ Multi-date picker
import DatePicker from "react-multi-date-picker";

const TimeManagement = () => {
  const { data: times } = useGetTimeQuery(undefined);
  const [createTime] = useCreateTimeMutation();
  const [deleteTime] = useDeleteTimeMutation();
  const [updateTime] = useUpdateTimeMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);

  const [selectedDates, setSelectedDates] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<{ startTime: string; endTime: string }[]>([]);
  const [page, setPage] = useState(1);

  // Open modal for adding or editing
  const openModalForAdd = () => {
    setSelectedDates([]);
    setTimeSlots([]);
    setEditingTimeId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (time: any) => {
    setEditingTimeId(time._id);
    setSelectedDates([time.date?.slice(0, 10)]); // keep it single on edit
    setTimeSlots(
      time.times?.map((t: any) => ({ startTime: t.startTime, endTime: t.endTime })) || []
    );
    setIsModalOpen(true);
  };

  const handleAddOrUpdateTime = async () => {
    if (!selectedDates.length || timeSlots.length === 0) {
      toast.error("At least one date and one time slot are required");
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
        await updateTime({
          id: editingTimeId,
          date: selectedDates[0], // editing one date at a time
          times: timeSlots,
        }).unwrap();
        toast.success("Time slots updated");
      } else {
        // loop over all selected dates and create them
        for (const d of selectedDates) {
          await createTime({
            date: typeof d === "string" ? d : d.format("YYYY-MM-DD"),
            times: timeSlots,
          }).unwrap();
        }
        toast.success("Time slots added");
      }

      setSelectedDates([]);
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

  return (
    <Layout>
      <div className="px-4 flex flex-col w-4xl min-h-screen py-3 mt-[70px]">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-2xl font-bold">Time Periods ({times?.length || 0})</h1>
          <Button onClick={openModalForAdd}>
            <Plus /> Add Time
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mt-4">
          {times?.length ? (
            times.map((time: any) => {
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

              return (
                <div key={time._id} className="bg-white rounded-lg  p-4 flex flex-col gap-3 border">
                  {/* Day & Date */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-700">{dayName}</p>
                      <p className="text-gray-500">{time.date?.slice(0, 10)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(time)}>
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTime(time._id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="flex flex-col gap-2">
                    {time.times?.map((slot: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-gray-50 p-2 rounded-md border">
                        <span className="text-gray-700 font-medium">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <Badge
                          icon={false}
                          variant={slot.reserved ? "danger" : "success"}
                          className="p-1 rounded-full text-sm">
                          {slot.reserved ? "Reserved" : "Available"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 py-6">No time periods found</p>
          )}

          {/* Pagination */}
          <Paginate page={page} pages={1} setPage={setPage} />
        </div>
      </div>
      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg w-full overflow-y-auto min-h-[50vh] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingTimeId ? "Edit Time" : "Add Time"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6 mt-4">
            {/* Multi-Date Picker */}
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Select Dates</label>
              <DatePicker
                multiple
                value={selectedDates}
                onChange={setSelectedDates}
                format="YYYY-MM-DD"
                minDate={new Date()}
                inputClass="hidden" // hides default input
                render={(value, openCalendar) => (
                  <button
                    type="button"
                    onClick={openCalendar}
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition">
                    {selectedDates.length > 0
                      ? `Select Dates (${selectedDates.length})`
                      : "Select Dates"}
                  </button>
                )}
              />

              {/* Selected dates as chips */}
              {selectedDates.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedDates.map((date, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-teal-50 border border-teal-500 text-teal-500 rounded-full text-sm font-medium">
                      {date.format("YYYY-MM-DD")}
                    </span>
                  ))}
                </div>
              )}
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
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}

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
            <Button onClick={handleAddOrUpdateTime}>{editingTimeId ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default TimeManagement;
