import { useParams, useNavigate } from "react-router-dom";
import {
  useDeletePlanMutation,
  useGetPlanByIdQuery,
  useUpdatePlanMutation,
  useUploadPlanImageMutation,
} from "@/redux/queries/planApi";
import { useState, useEffect } from "react";
import Layout from "@/Layout";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Badge from "@/components/Badge";
import { PERCENTAGE } from "./constants";

const PlanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const language = useSelector((state: any) => state.language.lang); // 'ar' or 'en'
  const { data: plan, isLoading, isError } = useGetPlanByIdQuery(id);
  const [deletePlan, { isLoading: loadingDeletePlan }] = useDeletePlanMutation();
  const [updatePlan, { isLoading: loadingUpdatePlan }] = useUpdatePlanMutation();
  const [uploadPlanImage] = useUploadPlanImageMutation();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Editable states
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newPrice, setNewPrice] = useState<number>(0);
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);

  // --- Discount modal state ---
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountBy, setDiscountBy] = useState<number>(0);
  const [discountedPrice, setDiscountedPrice] = useState<number>(0);
  // Editable states
  const [newFeatures, setNewFeatures] = useState<string[]>([]);
  const [newAddOns, setNewAddOns] = useState<{ name: string; price: number }[]>([]);

  // auto calculate discounted price
  useEffect(() => {
    if (!newPrice) return;
    if (hasDiscount && discountBy > 0) {
      const final = newPrice - newPrice * discountBy;
      setDiscountedPrice(final > 0 ? final : 0);
    } else {
      setDiscountedPrice(newPrice);
    }
  }, [discountBy, hasDiscount, newPrice]);
  // Populate editable states when plan is loaded
  useEffect(() => {
    if (plan) {
      setNewName(plan.name);
      setNewDescription(plan.description);
      setNewDuration(plan.duration);
      setNewPrice(plan.price);
      setFeatured(plan.isFeatured);
      setPublished(plan.published);
      setNewFeatures(plan.features || []);
      setNewAddOns(plan.addOns || []);
    }
  }, [plan]);

  const handleDeletePlan = async () => {
    try {
      await deletePlan(plan._id).unwrap();
      navigate("/admin/plans");
    } catch (err) {
      console.error("Failed to delete plan:", err);
    }
  };

  const handleUpdatePlan = async () => {
    try {
      // Handle image upload if there are new files
      let uploadedImages = plan.images || [];

      if (newImages.length > 0) {
        uploadedImages = [];
        for (const file of newImages) {
          const formData = new FormData();
          formData.append("images", file);
          try {
            const res = await uploadPlanImage(formData).unwrap();
            if (Array.isArray(res.images)) {
              res.images.forEach((img: any) =>
                uploadedImages.push({ url: img.imageUrl, publicId: img.publicId })
              );
            } else {
              uploadedImages.push({ url: res.imageUrl, publicId: res.publicId });
            }
          } catch (error: any) {
            toast.error(error?.data?.message || "Image upload failed");
            return;
          }
        }
      }

      // Update plan with arrays directly
      await updatePlan({
        id: plan._id,
        name: newName,
        description: newDescription,
        duration: newDuration,
        price: newPrice,
        isFeatured: featured,
        published: published,
        features: newFeatures, // array of strings
        addOns: newAddOns, // array of { name, price }
        images: uploadedImages, // array of { url, publicId }
        // discount fields
        hasDiscount,
        discountBy,
      }).unwrap();

      toast.success(language === "ar" ? "تم تحديث الباقة" : "Plan updated successfully");
      setIsUpdateModalOpen(false);
      setIsDiscountModalOpen(false);
    } catch (err) {
      console.error("Failed to update plan:", err);
      toast.error(language === "ar" ? "فشل تحديث الباقة" : "Failed to update plan");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
      </div>
    );
  }

  if (isError || !plan) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <p className="text-red-500 font-semibold">Failed to load plan.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  console.log(plan);

  return (
    <Layout>
      <div className="px-4 w-full lg:w-4xl py-6 mb-10 mt-10 min-h-screen font-custom">
        {/* Header */}
        <div
          className={`flex justify-between items-center ${
            language === "ar" ? "flex-row-reverse" : ""
          } mb-6`}>
          <h1 className="text-2xl font-bold">
            {language === "ar" ? "تفاصيل الباقة" : "Plan Details"}
          </h1>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-gradient-to-t from-rose-500 hover:opacity-90 to-rose-400 text-white">
              {language === "ar" ? "حذف الباقة" : "Delete Plan"}
            </Button>
            <Button onClick={() => setIsUpdateModalOpen(true)} variant="default">
              {language === "ar" ? "تحديث الباقة" : "Update Plan"}
            </Button>
            <Button
              onClick={() => setIsDiscountModalOpen(true)}
              className="select-none bg-black  text-white px-3 py-2 rounded-lg font-bold shadow-md">
              {language === "ar" ? "انشاء خصم" : "Create Discount"}
            </Button>
          </div>
        </div>

        <Separator className="my-4 bg-black/20" />

        {/* Main Content */}
        <div className="bg-white border rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row lg:flex-row gap-5">
            <div className="flex-shrink-0 w-full sm:w-80 lg:w-96 h-96 lg:h-96">
              {plan?.images?.length > 0 ? (
                <img
                  src={plan.images[0].url}
                  alt={plan.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 border rounded-lg">
                  {language === "ar" ? "لا توجد صور" : "No Images"}
                </div>
              )}
            </div>

            <div className="flex-1 grid grid-cols-3 gap-6">
              <div>
                <label className="text-gray-600">{language === "ar" ? ":الاسم" : "Name:"}</label>
                <p className="font-bold">{plan.name}</p>
              </div>
              <div>
                <label className="text-gray-600">
                  {language === "ar" ? ":الفئه" : "Category:"}
                </label>
                <p className="font-bold">{plan.category.name}</p>
              </div>
              <div>
                <label className="text-gray-600">{language === "ar" ? ":السعر" : "Price:"}</label>
                <p className="font-bold">
                  {plan.hasDiscount ? (
                    <>
                      <div className="flex flex-col">
                        <span className="line-through text-gray-400 mr-2">
                          {plan.price.toFixed(3)} {language === "ar" ? "د.ك" : "KD"}
                        </span>
                        <span className="text-teal-500">
                          {plan.discountedPrice.toFixed(3)} {language === "ar" ? "د.ك" : "KD"}
                        </span>
                      </div>
                    </>
                  ) : (
                    `${plan.price.toFixed(3)} ${language === "ar" ? "د.ك" : "KD"}`
                  )}
                </p>
              </div>

              {/* Featured */}
              <div>
                {plan.isFeatured ? (
                  <Badge icon={false} variant="success" className="rounded-full">
                    {language === "ar" ? "باقه مميزه" : "Featured plan"}
                  </Badge>
                ) : (
                  <Badge icon={false} className="rounded-full">
                    {language === "ar" ? "غير مميزه" : "Not Featured"}
                  </Badge>
                )}
              </div>
              {/* Published */}
              <div>
                {plan.published ? (
                  <Badge icon={false} variant="success" className="rounded-full">
                    {language === "ar" ? "منشور" : "Published"}
                  </Badge>
                ) : (
                  <Badge icon={false} variant="danger" className="rounded-full">
                    {language === "ar" ? "غير منشور" : "Not published"}
                  </Badge>
                )}
              </div>

              <div className="col-span-3">
                <label className="text-gray-600">
                  {language === "ar" ? ":الوصف" : "Description:"}
                </label>
                <p className="font-bold break-words whitespace-pre-line">{plan.description}</p>
              </div>
              <div className="col-span-3">
                <label className="text-gray-600">
                  {language === "ar" ? ":المدة" : "Duration:"}
                </label>
                <p className="font-bold">{plan.duration}</p>
              </div>
              {/* AddOns */}
              {plan?.addOns?.length > 0 && (
                <div className="col-span-3">
                  <label className="text-gray-600">
                    {language === "ar" ? ":الإضافات" : "Add-Ons:"}
                  </label>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700 font-bold">
                    {plan.addOns.map((addOn: any, index: number) => (
                      <li key={index}>
                        {addOn.name} - {addOn.price.toFixed(3)} {language === "ar" ? "د.ك" : "KD"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {plan?.features?.length > 0 && (
                <div className="col-span-3">
                  <label className="text-gray-600">
                    {language === "ar" ? ":المميزات" : "Features:"}
                  </label>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700 font-bold">
                    {plan.features.map((feature: string, index: number) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Update Modal */}
        <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
          <DialogContent className="flex flex-col space-y-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{language === "ar" ? "تحديث الباقة" : "Update Plan"}</DialogTitle>
            </DialogHeader>

            {/* Name */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">{language === "ar" ? "الاسم" : "Name"}</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="p-2 w-full border rounded-md"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">
                {language === "ar" ? "الوصف" : "Description"}
              </label>
              <textarea
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="p-2 w-full border rounded-md"
              />
            </div>

            {/* Duration */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">
                {language === "ar" ? "المدة" : "Duration"}
              </label>
              <input
                type="text"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                className="p-2 w-full border rounded-md"
              />
            </div>

            {/* Price */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">{language === "ar" ? "السعر" : "Price"}</label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="p-2 w-full border rounded-md"
              />
            </div>

            {/* Images */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">{language === "ar" ? "الصور" : "Images"}</label>
              <input
                type="file"
                multiple
                onChange={(e) => setNewImages(Array.from(e.target.files || []))}
                className="p-2 w-full border rounded-md"
              />
              {newImages.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {newImages.map((file, idx) => (
                    <span key={idx} className="text-sm bg-gray-100 p-1 rounded">
                      {file.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Features */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">
                {language === "ar" ? "المميزات" : "Features"}
              </label>
              {newFeatures?.map((feature, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => {
                      const updated = [...newFeatures];
                      updated[idx] = e.target.value;
                      setNewFeatures(updated);
                    }}
                    className="p-2 w-full border rounded-md"
                  />
                  <Button
                    variant="destructive"
                    onClick={() => setNewFeatures(newFeatures.filter((_, i) => i !== idx))}>
                    {language === "ar" ? "حذف" : "Remove"}
                  </Button>
                </div>
              ))}
              <Button onClick={() => setNewFeatures([...newFeatures, ""])} className="mt-2">
                {language === "ar" ? "إضافة ميزة" : "Add Feature"}
              </Button>
            </div>

            {/* Add-Ons */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">
                {language === "ar" ? "الإضافات" : "Add-Ons"}
              </label>
              {newAddOns.map((addOn, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder={language === "ar" ? "اسم الإضافة" : "Name"}
                    value={addOn.name}
                    onChange={(e) => {
                      const updated = [...newAddOns];
                      updated[idx].name = e.target.value;
                      setNewAddOns(updated);
                    }}
                    className="p-2 w-1/2 border rounded-md"
                  />
                  <input
                    type="number"
                    placeholder={language === "ar" ? "السعر" : "Price"}
                    value={addOn.price}
                    onChange={(e) => {
                      const updated = [...newAddOns];
                      updated[idx].price = Number(e.target.value);
                      setNewAddOns(updated);
                    }}
                    className="p-2 w-1/2 border rounded-md"
                  />
                  <Button
                    variant="destructive"
                    onClick={() => setNewAddOns(newAddOns.filter((_, i) => i !== idx))}>
                    {language === "ar" ? "حذف" : "Remove"}
                  </Button>
                </div>
              ))}
              <Button
                onClick={() => setNewAddOns([...newAddOns, { name: "", price: 0 }])}
                className="mt-2">
                {language === "ar" ? "إضافة إضافة" : "Add Add-On"}
              </Button>
            </div>

            {/* Switches */}
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={featured} onCheckedChange={setFeatured} />
                <span>{language === "ar" ? "باقة مميزة" : "Featured Plan"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={published} onCheckedChange={setPublished} />
                <span>{language === "ar" ? "منشور" : "Published"}</span>
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
                {language === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button onClick={handleUpdatePlan} disabled={loadingUpdatePlan}>
                {language === "ar" ? "تحديث" : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{language === "ar" ? "حذف الباقة" : "Delete Plan"}</DialogTitle>
            </DialogHeader>
            <p className="my-2">
              {language === "ar"
                ? "هل أنت متأكد أنك تريد حذف هذه الباقة؟"
                : "Are you sure you want to delete this plan?"}
            </p>
            <DialogFooter className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                {language === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                variant="destructive"
                className="bg-gradient-to-t from-rose-500 hover:opacity-90 to-rose-400"
                onClick={handleDeletePlan}
                disabled={loadingDeletePlan}>
                {language === "ar" ? "حذف" : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {/* Discount Modal */}
      <div>
        <Dialog open={isDiscountModalOpen} onOpenChange={setIsDiscountModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{language === "ar" ? "خصم المنتج" : "Product Discount"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Enable discount */}
              <div className="flex items-center gap-3">
                <Switch
                  checked={hasDiscount}
                  onCheckedChange={setHasDiscount}
                  className="scale-125"
                />
                <span>{language === "ar" ? "تفعيل الخصم" : "Enable Discount"}</span>
              </div>

              {hasDiscount && (
                <>
                  {/* Discount percentage */}
                  <div>
                    <label className="text-gray-600">
                      {language === "ar" ? "نسبة الخصم" : "Discount Percentage"}
                    </label>
                    <select
                      value={discountBy}
                      onChange={(e) => setDiscountBy(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm mt-1">
                      <option value={0} disabled>
                        -- {language === "ar" ? "اختر نسبة" : "Choose percentage"} --
                      </option>
                      {PERCENTAGE.map((p) => (
                        <option key={p} value={p}>
                          {p * 100}%
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Final price */}
                  <div>
                    <p className="font-semibold" dir="rtl">
                      {language === "ar" ? "السعر بعد الخصم:" : "Discounted Price:"}{" "}
                      <span className="text-green-600">{discountedPrice.toFixed(3)} KD</span>
                    </p>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDiscountModalOpen(false)}>
                {language === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                disabled={loadingUpdatePlan}
                onClick={handleUpdatePlan}
                className="bg-black text-white">
                {loadingUpdatePlan
                  ? language === "ar"
                    ? "جاري الحفظ..."
                    : "Saving..."
                  : language === "ar"
                  ? "حفظ"
                  : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default PlanDetails;
