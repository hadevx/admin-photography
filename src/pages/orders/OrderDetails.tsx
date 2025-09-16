import Layout from "../../Layout";
import {
  useGetOrderQuery,
  useUpdateOrderToDeliverdMutation,
  useUpdateOrderToCanceledMutation,
} from "../../redux/queries/orderApi";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Badge from "../../components/Badge";
import clsx from "clsx";
import { Separator } from "../../components/ui/separator";
import Loader from "../../components/Loader";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Invoise from "../../components/Invoise";
import { Loader2Icon } from "lucide-react";
import { useSelector } from "react-redux";

function OrderDetails() {
  const { orderId } = useParams();
  const { data: order, isLoading, refetch } = useGetOrderQuery(orderId);
  console.log(order);
  const [updateOrderToDeliverd, { isLoading: loadingDelivered }] =
    useUpdateOrderToDeliverdMutation();
  const [updateOrderToCanceled, { isLoading: isCanceled }] = useUpdateOrderToCanceledMutation();

  const language = useSelector((state: any) => state.language.lang); // 'ar' or 'en'
  const dir = language === "ar" ? "rtl" : "ltr";

  const handleUpdateOrderToDelivered = async () => {
    try {
      await updateOrderToDeliverd(orderId).unwrap();
      toast.success(language === "ar" ? "تم التحديث إلى مكتمل" : "Order marked as completed");
      refetch();
    } catch (error) {
      toast.error(language === "ar" ? "فشل التحديث" : "Failed to update order");
    }
  };

  const handleUpdateOrderToCanceled = async () => {
    try {
      await updateOrderToCanceled(orderId).unwrap();
      toast.success(language === "ar" ? "تم إلغاء الطلب" : "Order canceled");
      refetch();
    } catch (error) {
      toast.error(language === "ar" ? "فشل الإلغاء" : "Failed to cancel order");
    }
  };

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <div
          dir={language === "ar" ? "rtl" : "ltr"}
          className={`mb-10 mt-[50px] min-h-screen w-full lg:w-4xl ${dir} font-custom`}>
          <div className="px-4 py-6">
            {/* Header */}
            <div className="flex gap-2 flex-col lg:flex-row justify-between lg:items-center">
              <h1 className="text-lg lg:text-2xl font-bold">
                {language === "ar" ? "تفاصيل الحجز:" : "Booking details:"}
              </h1>

              <div className="flex text-xs items-center gap-3 lg:gap-2">
                <button
                  disabled={order?.isCompleted || order?.isCanceled || loadingDelivered}
                  onClick={handleUpdateOrderToDelivered}
                  className={clsx(
                    "px-3 py-2 rounded-lg font-bold transition-all",
                    order?.isCompleted || order?.isCanceled
                      ? "bg-gray-200 text-gray-600 pointer-events-none"
                      : "bg-teal-500 text-white hover:bg-teal-600"
                  )}>
                  {loadingDelivered
                    ? language === "ar"
                      ? "جارٍ التحديث..."
                      : "Updating..."
                    : language === "ar"
                    ? "تعيين كمكتمل"
                    : "Mark as completed"}
                </button>

                {isCanceled ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <button
                    disabled={order?.isCompleted || order?.isCanceled}
                    onClick={handleUpdateOrderToCanceled}
                    className={clsx(
                      "px-3 py-2 rounded-lg font-bold transition-all",
                      order?.isCanceled || order?.isCompleted
                        ? "bg-gray-200 text-gray-600 pointer-events-none"
                        : "bg-rose-500 text-white hover:bg-rose-600"
                    )}>
                    {language === "ar" ? "إلغاء الطلب" : "Cancel Order"}
                  </button>
                )}

                {/* Invoice */}
                <PDFDownloadLink
                  document={<Invoise order={order} />}
                  fileName={`invoice-${order?._id}.pdf`}>
                  <button className="px-3 py-2 rounded-lg font-bold bg-rose-500 text-white hover:bg-rose-600">
                    {language === "ar" ? "تحميل الفاتورة" : "Download Invoice"}
                  </button>
                </PDFDownloadLink>
              </div>
            </div>

            <Separator className="my-4 bg-black/20" />

            {order && (
              <div className="text-sm bg-white border rounded-lg p-6">
                <h2>{order?._id}</h2>
                {/* User Info */}
                <h2 className="text-lg font-semibold mb-4">
                  {language === "ar" ? "معلومات العميل" : "Customer Info"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7 text-gray-700">
                  <div>
                    <span className="font-semibold">{language === "ar" ? "الاسم:" : "Name:"}</span>{" "}
                    {order.user?.name}
                  </div>
                  <div>
                    <span className="font-semibold">
                      {language === "ar" ? "البريد:" : "Email:"}
                    </span>{" "}
                    {order.user?.email}
                  </div>
                  <div>
                    <span className="font-semibold">
                      {language === "ar" ? "الهاتف:" : "Phone:"}
                    </span>{" "}
                    {order.user?.phone}
                  </div>
                  <div>
                    <span className="font-semibold">
                      {language === "ar" ? "التاريخ:" : "Created:"}
                    </span>{" "}
                    {order.createdAt?.substring(0, 10)}
                  </div>
                  <div>
                    <span className="font-semibold">{language === "ar" ? "العمر:" : "Age:"}</span>{" "}
                    {order.user.age}
                  </div>
                </div>

                {/* Booking Info */}
                <h2 className="text-lg font-semibold mb-4">
                  {language === "ar" ? "معلومات الحجز" : "Booking Info"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                  <div>
                    <span className="font-semibold">{language === "ar" ? "الباقه:" : "Plan:"}</span>{" "}
                    {order.plan?.name}
                  </div>
                  <div>
                    <span className="font-semibold">
                      {language === "ar" ? "الموقع:" : "Location:"}
                    </span>{" "}
                    {order.location}
                  </div>
                  <div>
                    <span className="font-semibold">
                      {language === "ar" ? "التاريخ:" : "Date:"}
                    </span>{" "}
                    {new Date(order.bookingDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-semibold">{language === "ar" ? "الوقت:" : "Time:"}</span>{" "}
                    {order.slot?.startTime} - {order.slot?.endTime}
                  </div>
                  <div>
                    <span className="font-semibold">
                      {language === "ar" ? "عدد الأشخاص:" : "People:"}
                    </span>{" "}
                    {order.numberOfPeople}
                  </div>
                  <div>
                    <span className="font-semibold">
                      {language === "ar" ? "الملاحظات:" : "Notes:"}
                    </span>{" "}
                    {order.notes || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">
                      {language === "ar" ? "المقدم:" : "Down Payment:"}
                    </span>{" "}
                    {order.downPayment?.toFixed(3)} KD
                  </div>
                  <div>
                    <span className="font-semibold">
                      {language === "ar" ? "السعر الكلي:" : "Total Price:"}
                    </span>{" "}
                    {order.price?.toFixed(3)} KD
                  </div>
                </div>

                {/* Status */}
                <div className="mt-6 flex items-center gap-2">
                  <span className="font-semibold">{language === "ar" ? "الحالة:" : "Status:"}</span>{" "}
                  {order.isCanceled ? (
                    <Badge variant="danger">{language === "ar" ? "ملغي" : "Canceled"}</Badge>
                  ) : order.isCompleted ? (
                    <Badge variant="success">{language === "ar" ? "مكتمل" : "Completed"}</Badge>
                  ) : order.isPaid ? (
                    <Badge variant="success">{language === "ar" ? "مدفوع" : "Paid"}</Badge>
                  ) : (
                    <Badge variant="pending">
                      {language === "ar" ? "قيد المعالجة" : "Processing"}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

export default OrderDetails;
