import { useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../Layout";
import {
  useGetProductsQuery,
  useUploadProductImageMutation,
  useCreateProductMutation,
  useGetCategoriesTreeQuery,
} from "../../redux/queries/productApi";
import Badge from "../../components/Badge";
import { Box, Plus } from "lucide-react";
import Loader from "../../components/Loader";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

import { useSelector } from "react-redux";
import { texts } from "./translation";
import Error from "@/components/Error";
import Paginate from "@/components/Paginate";

function ProductList() {
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  console.log("image file", imageFiles);

  const language = useSelector((state: any) => state.language.lang);
  const navigate = useNavigate();

  const {
    data: productsData,
    isLoading: loadingProducts,
    error: errorGettingProducts,
  } = useGetProductsQuery({
    pageNumber: page,
  });

  const products = productsData?.products || [];
  const pages = productsData?.pages || 1;

  const { data: tree } = useGetCategoriesTreeQuery(undefined);
  // const { data: categories } = useGetAllCategoriesQuery(undefined);

  /* Create product fields */
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [uploadProductImage, { isLoading: loadingUploadImage }] = useUploadProductImageMutation();
  const [createProduct, { isLoading: loadingCreateOrder }] = useCreateProductMutation();

  console.log(products);

  const handleCreateProduct = async () => {
    if (!name || imageFiles.length === 0 || !category || !description) {
      toast.error("All fields are required");
      return;
    }

    let uploadedImages: { url: string; publicId: string }[] = [];

    if (imageFiles.length > 0) {
      try {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append("images", file));

        // Send all images in a single request
        const res = await uploadProductImage(formData).unwrap();

        // res.images is now an array of uploaded images
        uploadedImages = res.images.map((img: any) => ({
          url: img.imageUrl,
          publicId: img.publicId,
        }));

        console.log(uploadedImages);
      } catch (error: any) {
        toast.error(error?.data?.message || error?.error);
        return;
      }
    }

    /* --- */
    const newProduct = {
      name,
      image: uploadedImages,
      category,
      description,
    };

    try {
      const result = await createProduct(newProduct);
      console.log("result creating product: ", result);

      if ("error" in result) {
        toast.error("Error creating product");
      } else {
        toast.success("Product created");
        setIsModalOpen(false);
        resetForm();
      }
    } catch (err) {
      toast.error("Failed to create product");
    }
  };

  const resetForm = () => {
    setName("");
    setImageFiles([]);
    setCategory("");
    setDescription("");
  };

  return (
    <Layout>
      {errorGettingProducts ? (
        <Error />
      ) : loadingProducts ? (
        <Loader />
      ) : (
        <div className="flex w-full mb-10 lg:w-4xl min-h-screen lg:min-h-auto justify-between py-3 mt-[70px] lg:mt-[50px] px-4 ">
          <div className="w-full">
            <div
              className={`flex justify-between items-center ${
                language === "ar" ? "flex-row-reverse" : ""
              }`}>
              <h1
                dir={language === "ar" ? "rtl" : "ltr"}
                className="text-lg lg:text-2xl  font-black flex gap-2 lg:gap-5 items-center">
                {texts[language].products}:
                <Badge icon={false}>
                  <Box />
                  <p className="text-lg lg:text-sm">
                    {productsData?.total ?? 0}{" "}
                    <span className="hidden lg:inline">{texts[language].products}</span>
                  </p>
                </Badge>
              </h1>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-black  drop-shadow-[0_0_10px_rgba(24,24,27,0.5)] cursor-pointer hover:bg-black/70 text-white font-bold flex items-center gap-1 text-sm lg:text-md shadow-md px-3 py-2 rounded-md">
                <Plus />
                {texts[language].addProduct}
              </button>
            </div>

            <Separator className="my-4 bg-black/20" />

            {/* Filters */}
            <div className="mt-5 mb-2">
              {/* Table */}
              <div className="rounded-lg mb-10 border lg:p-5 bg-white overflow-x-auto">
                <table className="w-full min-w-[700px] border-gray-200 text-sm text-left text-gray-700">
                  <thead className="bg-white text-gray-900/50 font-semibold">
                    <tr>
                      <th className="px-4 py-3 border-b">{texts[language].name}</th>

                      <th className="px-4 py-3 border-b">{texts[language].category}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {products?.length > 0 ? (
                      products?.map((product: any) => (
                        <tr
                          key={product?._id}
                          className="hover:bg-gray-100 cursor-pointer transition-all duration-300 font-bold"
                          onClick={() => navigate(`/admin/productlist/${product?._id}`)}>
                          <td className="px-4 py-3 flex items-center gap-2 max-w-64">
                            <img
                              className="w-16 h-16 object-cover "
                              src={product?.image[0].url}
                              alt="thumbnail"
                              loading="lazy"
                            />
                            <p className="truncate">{product?.name}</p>
                          </td>

                          <td className="px-4 py-3">{product?.category?.name}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                          {texts[language].noProductsFound}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                <Paginate page={page} pages={pages} setPage={setPage} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create product modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="lg:min-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{texts[language].addProduct}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto mt-4 gap-6">
            {/* Left Column: Product Form */}
            <div className="space-y-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                className="p-2 w-full border rounded-md"
              />
              <div className="flex gap-2 flex-wrap">
                {imageFiles.map((file, i) => (
                  <img
                    key={i}
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-20 h-20 object-cover rounded"
                  />
                ))}
              </div>

              <input
                type="text"
                placeholder={texts[language].productName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2 w-full border rounded-md"
              />
              <textarea
                placeholder={texts[language].productDescription}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button
              variant="default"
              disabled={loadingCreateOrder || loadingUploadImage}
              onClick={handleCreateProduct}>
              {loadingUploadImage
                ? texts[language].uploading
                : loadingCreateOrder
                ? texts[language].creating
                : texts[language].create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
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

export default ProductList;
