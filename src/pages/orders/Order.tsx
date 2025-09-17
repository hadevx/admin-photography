import Layout from "../../Layout";
import { useNavigate } from "react-router-dom";
import { useState, type ChangeEvent } from "react";
import Badge from "../../components/Badge";
import { useGetOrdersQuery } from "../../redux/queries/orderApi";
import { Layers, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Loader from "../../components/Loader";
import { useSelector } from "react-redux";
import { texts } from "./translations";
import MobiusBand from "./../../components/MobiusBand";
import Paginate from "@/components/Paginate";

function Order() {
  const navigate = useNavigate();
  const language = useSelector((state: any) => state.language.lang);

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data, isLoading } = useGetOrdersQuery({
    pageNumber: page,
    keyword: searchQuery,
  });

  const orders = data?.orders || [];
  const pages = data?.pages || 1;

  console.log("orders: ", data);

  const filteredOrders = orders
    ? orders.filter((order: any) => {
        const query = searchQuery.toLowerCase();
        return (
          order._id.toLowerCase().includes(query) ||
          order.user?.name?.toLowerCase().includes(query) ||
          order.paymentMethod?.toLowerCase().includes(query)
        );
      })
    : [];

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Layout>
      <MobiusBand />
      {isLoading ? (
        <Loader />
      ) : (
        <div className="px-4 flex flex-col w-full min-h-screen py-3 mt-[70px] lg:w-5xl">
          {/* Header */}
          <div className="w-full">
            <div
              className={`flex justify-between items-center flex-wrap gap-3 ${
                language === "ar" ? "justify-end" : ""
              }`}>
              <h1
                dir={language === "ar" ? "rtl" : "ltr"}
                className="text-lg  lg:text-2xl font-black flex gap-2 lg:gap-5 items-center flex-wrap">
                {texts[language].orders}:
                <Badge icon={false}>
                  <Layers />
                  <p className="text-lg lg:text-sm">
                    {data?.total > 0 ? data?.total : "0"}{" "}
                    <span className="hidden lg:inline">{texts[language].orders}</span>
                  </p>
                </Badge>
              </h1>
            </div>
            <Separator className="my-4 bg-black/20" />

            {/* Container */}
            <div className="mt-5 mb-2 w-full max-w-full ">
              {/* Search + Revenue */}
              <div className="flex flex-col lg:flex-row items-center gap-2 mb-5">
                <div className="relative  w-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                    <Search className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    placeholder={texts[language].searchPlaceholder}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full border bg-white border-gray-300 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:border-2"
                  />
                </div>

                <div className="flex gap-2 items-center w-[200px]">
                  <div className="bg-blue-50 border flex-1 border-blue-700 text-blue-700 text-sm font-semibold rounded-lg p-3 lg:px-4 lg:py-3 text-center">
                    {texts[language].revenue}: {data?.totalRevenue.toFixed(3)}{" "}
                    {language === "ar" ? "د.ك" : "KD"}
                  </div>
                </div>
              </div>

              {/* Table (Desktop) */}
              <div className="hidden lg:block rounded-lg border lg:p-5 bg-white overflow-x-auto">
                <table className="w-full min-w-[700px] rounded-lg border-gray-200 text-sm text-left text-gray-700">
                  <thead className="bg-white text-gray-900/50 font-semibold">
                    <tr>
                      <th className="px-4 py-3 border-b">{texts[language].orderId}</th>
                      <th className="px-4 py-3 border-b">{texts[language].customer}</th>
                      <th className="px-4 py-3 border-b">{texts[language].plan}</th>
                      <th className="px-4 py-3 border-b">{texts[language].time}</th>
                      <th className="px-4 py-3 border-b">{texts[language].location}</th>
                      <th className="px-4 py-3 border-b">{texts[language].people}</th>
                      <th className="px-4 py-3 border-b">{texts[language].status}</th>
                      <th className="px-4 py-3 border-b">{texts[language].total}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredOrders?.length ? (
                      filteredOrders.map((order: any) => (
                        <tr
                          key={order._id}
                          className="cursor-pointer hover:bg-gray-100 transition-all duration-300 font-bold"
                          onClick={() => navigate(`/admin/orders/${order._id}`)}>
                          <td className="px-4 py-5 truncate max-w-20 whitespace-nowrap">
                            #{order._id}
                          </td>
                          <td className="px-4 py-5 whitespace-nowrap">{order?.user?.name}</td>
                          <td className="px-4 py-5 whitespace-nowrap">{order?.plan?.name}</td>
                          <td className="px-4 py-5 whitespace-nowrap">
                            {new Date(order?.bookingDate).toLocaleDateString()} <br />
                            <span className="text-xs text-gray-500">
                              {order?.slot?.startTime} - {order?.slot?.endTime}
                            </span>
                          </td>
                          <td className="px-4 py-5 whitespace-nowrap">{order?.location}</td>
                          <td className="px-4 py-5 whitespace-nowrap">{order?.numberOfPeople}</td>
                          <td className="px-4 py-5 whitespace-nowrap">
                            {order?.isCanceled ? (
                              <Badge variant="danger" icon={false} className="rounded-full">
                                {texts[language].canceled}
                              </Badge>
                            ) : order?.isCompleted ? (
                              <Badge variant="success" icon={false} className="rounded-full">
                                {texts[language].delivered}
                              </Badge>
                            ) : order?.isConfirmed ? (
                              <Badge icon={false} className="rounded-full">
                                {texts[language].confirmed}
                              </Badge>
                            ) : (
                              <Badge variant="pending" icon={false} className="rounded-full">
                                {texts[language].processing}
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-5 whitespace-nowrap">
                            {order?.price.toFixed(3)} KD
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                          {texts[language].noOrders}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <Paginate page={page} pages={pages} setPage={setPage} />
              </div>

              {/* Cards (Mobile) */}
              <div className="lg:hidden space-y-4" dir={language === "ar" ? "rtl" : "ltr"}>
                {filteredOrders?.length ? (
                  filteredOrders.map((order: any) => (
                    <div
                      key={order._id}
                      className="bg-white border rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition"
                      onClick={() => navigate(`/admin/orders/${order._id}`)}>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-gray-800">#{order._id}</h3>
                        {order?.isCanceled ? (
                          <Badge variant="danger" icon={false}>
                            {texts[language].canceled}
                          </Badge>
                        ) : order?.isCompleted ? (
                          <Badge variant="success" icon={false}>
                            {texts[language].delivered}
                          </Badge>
                        ) : order?.isConfirmed ? (
                          <Badge icon={false}>{texts[language].confirmed}</Badge>
                        ) : (
                          <Badge variant="pending" icon={false}>
                            {texts[language].processing}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">
                        <span className="font-semibold">{texts[language].customer}:</span>{" "}
                        {order?.user?.name}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">{texts[language].plan}:</span>{" "}
                        {order?.plan?.name}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">{texts[language].time}:</span>{" "}
                        {new Date(order?.bookingDate).toLocaleDateString()} (
                        {order?.slot?.startTime} - {order?.slot?.endTime})
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">{texts[language].location}:</span>{" "}
                        {order?.location}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">{texts[language].people}:</span>{" "}
                        {order?.numberOfPeople}
                      </p>
                      <p className="text-sm font-bold mt-2">
                        {texts[language].total}: {order?.price.toFixed(3)} KD
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-6">{texts[language].noOrders}</div>
                )}
                <Paginate page={page} pages={pages} setPage={setPage} />
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Order;
