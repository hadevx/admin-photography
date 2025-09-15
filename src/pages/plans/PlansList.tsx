import { useState, type ChangeEvent, type JSX } from "react";
import { useSelector } from "react-redux";
import Layout from "../../Layout";
import Badge from "../../components/Badge";
import { Search } from "lucide-react";
import { texts } from "./translations.ts";
import Paginate from "@/components/Paginate.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useCreatePlanMutation,
  useUploadPlanImageMutation,
  useGetPlansQuery,
} from "@/redux/queries/planApi.ts";
import { toast } from "react-toastify";
import { useGetCategoriesTreeQuery } from "../../redux/queries/productApi";
import { useNavigate } from "react-router-dom";

const PlansList = () => {
  const language = useSelector((state: any) => state.language.lang);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [duration, setDuration] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // addOns state
  const [addOns, setAddOns] = useState<{ name: string; price: number }[]>([]);
  const [addOnName, setAddOnName] = useState("");
  const [addOnPrice, setAddOnPrice] = useState<number | "">("");

  const navigate = useNavigate();

  const [createPlan] = useCreatePlanMutation();
  const [uploadPlanImage] = useUploadPlanImageMutation();
  const { data } = useGetPlansQuery({ pageNumber: page, keyword: searchQuery });
  const { data: tree } = useGetCategoriesTreeQuery(undefined);
  const plans = data?.plans || [];
  const pages = data?.pages || 1;

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const addAddOn = () => {
    if (addOnName.trim() && addOnPrice !== "") {
      setAddOns([...addOns, { name: addOnName.trim(), price: Number(addOnPrice) }]);
      setAddOnName("");
      setAddOnPrice("");
    }
  };

  const removeAddOn = (index: number) => {
    setAddOns(addOns.filter((_, i) => i !== index));
  };

  const handleCreatePlan = async () => {
    let uploadedImages: { url: string; publicId: string }[] = [];

    if (imageFiles.length > 0) {
      try {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append("images", file));

        // Send all images in a single request
        const res = await uploadPlanImage(formData).unwrap();

        uploadedImages = res.images.map((img: any) => ({
          url: img.imageUrl,
          publicId: img.publicId,
        }));
      } catch (error: any) {
        toast.error(error?.data?.message || error?.error);
        return;
      }
    }

    const newPlan = {
      name,
      description,
      duration,
      price,
      category,
      features,
      addOns,
      images: uploadedImages,
    };

    try {
      const result = await createPlan(newPlan);
      console.log("result creating plan: ", result);

      // Reset modal
      setName("");
      setDescription("");
      setDuration("");
      setPrice("");
      setCategory("");
      setFeatures([]);
      setAddOns([]);
      setImageFiles([]);
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Failed to create plan");
    }
  };

  return (
    <Layout>
      <div className="px-4 flex lg:w-4xl flex-col w-full min-h-screen lg:min-h-auto py-3 mt-[70px]">
        {/* Header */}
        <div
          className="w-full flex justify-between items-center flex-wrap gap-3"
          dir={language === "ar" ? "rtl" : ""}>
          <h1 className="text-lg lg:text-2xl font-black flex gap-2 lg:gap-5 items-center flex-wrap">
            {texts[language].plans}:
            <Badge icon={false}>
              <p className="text-lg lg:text-sm">{plans?.length}</p>
            </Badge>
          </h1>
          <Button onClick={() => setIsModalOpen(true)}>{texts[language].addPlan}</Button>
        </div>

        {/* Search bar */}
        <div className="mt-5 mb-2 flex flex-col lg:flex-row items-center gap-2">
          <div className="relative w-full">
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
        </div>

        {/* Table */}
        <div className="rounded-lg border lg:p-5 bg-white overflow-x-auto">
          <table className="w-full min-w-[700px] rounded-lg border-gray-200 text-sm text-left text-gray-700">
            <thead className="bg-white text-gray-900/50 font-semibold">
              <tr>
                <th className="px-4 py-3 border-b">{texts[language].planName}</th>
                <th className="px-4 py-3 border-b">{texts[language].category}</th>
                <th className="px-4 py-3 border-b">{texts[language].description}</th>
                <th className="px-4 py-3 border-b">{texts[language].status}</th>
                <th className="px-4 py-3 border-b">{texts[language].price}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {plans.length ? (
                plans.map((plan: any) => (
                  <tr
                    key={plan._id}
                    onClick={() => navigate(`/admin/plans/${plan?._id}`)}
                    className="cursor-pointer hover:bg-gray-100 transition-all duration-300 font-bold">
                    <td className="px-4 py-5 flex items-center gap-2">
                      <img
                        src={plan?.images[0]?.url}
                        alt={plan.name}
                        className="inline-block w-16 h-16 object-cover rounded ml-2"
                      />
                      {plan.name}
                    </td>
                    <td className="px-4 py-5">{plan.category.name}</td>
                    <td className="px-4 py-5">{plan.description}</td>
                    {plan.published ? (
                      <td className="px-4 py-5">
                        <Badge
                          className=" w-[100px] p-1 rounded-full"
                          icon={false}
                          variant="success">
                          {language === "ar" ? " منشور" : " Published"}
                        </Badge>
                      </td>
                    ) : (
                      <td className="px-4 py-5">
                        <Badge className="p-1 rounded-full w-[100px]" icon={false} variant="danger">
                          {language === "ar" ? "غير منشور" : "Not published"}
                        </Badge>
                      </td>
                    )}
                    <td className="px-4 py-5">
                      {plan.hasDiscount ? (
                        <>
                          <span className="line-through text-gray-400 mr-2">
                            {plan.price.toFixed(3)} KD
                          </span>
                          <span className="text-teal-500">
                            {plan.discountedPrice.toFixed(3)} KD
                          </span>
                        </>
                      ) : (
                        `${plan.price.toFixed(3)} KD`
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    {texts[language].noPlans}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <Paginate page={page} pages={pages} setPage={setPage} />
        </div>

        {/* Create Plan Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="flex overflow-y-auto flex-col max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{texts[language].addPlan}</DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto mt-4 space-y-4">
              {/* Image upload */}
              <div className="space-y-2">
                <label className="block font-medium">{texts[language].images}</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      setImageFiles(Array.from(e.target.files));
                    }
                  }}
                  className="w-full border rounded-md p-2"
                />

                {/* Preview selected images */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {imageFiles.map((file, idx) => (
                    <div key={idx} className="w-20 h-20 relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder={texts[language].planName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2 w-full border rounded-md"
              />
              <textarea
                placeholder={texts[language].description}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="p-2 w-full border rounded-md"
              />
              <input
                type="text"
                placeholder={texts[language].duration}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="p-2 w-full border rounded-md"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="p-2 w-full border rounded-md">
                <option value="" disabled>
                  {texts[language].selectCategory}
                </option>
                {tree?.length > 0 && renderCategoryOptions(tree)}
              </select>

              <input
                type="number"
                placeholder={texts[language].price}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="p-2 w-full border rounded-md"
              />

              {/* Features input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={texts[language].addFeature}
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  className="p-2 w-full border rounded-md"
                />
                <Button onClick={addFeature}>{texts[language].add}</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 px-2 py-1 rounded flex items-center gap-2">
                    {feature}
                    <button onClick={() => removeFeature(index)}>x</button>
                  </span>
                ))}
              </div>

              {/* AddOns input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={texts[language].addOnName || "Add-on name"}
                  value={addOnName}
                  onChange={(e) => setAddOnName(e.target.value)}
                  className="p-2 w-full border rounded-md"
                />
                <input
                  type="number"
                  placeholder={texts[language].addOnPrice || "Price"}
                  value={addOnPrice}
                  onChange={(e) => setAddOnPrice(Number(e.target.value))}
                  className="p-2 w-32 border rounded-md"
                />
                <Button onClick={addAddOn}>{texts[language].add}</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {addOns.map((addOn, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 px-2 py-1 rounded flex items-center gap-2">
                    {addOn.name} - {addOn.price.toFixed(3)} KD
                    <button onClick={() => removeAddOn(index)}>x</button>
                  </span>
                ))}
              </div>
            </div>

            <DialogFooter className="mt-6 flex justify-end gap-2">
              <Button variant="default" onClick={handleCreatePlan}>
                {texts[language].create}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

// Recursively render category options for dropdown
const renderCategoryOptions = (nodes: any, level = 0): JSX.Element[] => {
  return nodes.flatMap((node: any) => [
    <option key={node._id} value={node._id}>
      {"‣ ".repeat(level)}
      {node.name}
    </option>,
    ...(node.children ? renderCategoryOptions(node.children, level + 1) : []),
  ]);
};

export default PlansList;
