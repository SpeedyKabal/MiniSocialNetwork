import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import DeleteModal from "../Extensions/DeleteModal";

function PostDropdown({ onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteModel, setDeleteModel] = useState(false);
  const { t, i18n } = useTranslation();

  const openCloseDeleteModel = () => {
    setDeleteModel(!deleteModel);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <MoreVertical className="size-4 lg:size-6 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-52 lg:w-56 bg-white rounded-lg shadow-lg py-1 z-10">
          <button
            onClick={() => {
              onEdit();
              setIsOpen(false);
            }}
            className="w-full px-2 py-2 text-left text-md text-gray-700 hover:bg-gray-100 flex items-center lg:text-lg"
          >
            <Pencil className="size-2 lg:size-4 mr-2" />
            {t("post.update")}
          </button>
          <button
            onClick={() => {
              setDeleteModel(true);
              setIsOpen(false);
            }}
            className="w-full px-2 py-2 text-left text-md text-red-600 hover:bg-gray-100 flex items-center lg:text-lg"
          >
            <Trash2 className="size-2 lg:size-4 mr-2" />
            {t("post.deletepost")}
          </button>
        </div>
      )}
      {deleteModel && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-20">
          <DeleteModal
            title={t("post.deletepost")}
            body={t("post.deleteconfpost")}
            cancelText={t("post.cancel")}
            confirmText={t("post.delete")}
            onCancel={openCloseDeleteModel}
            onConfirm={() => {
              onDelete();
              openCloseDeleteModel();
            }}
          />
        </div>
      )}
    </div>
  );
}

export default PostDropdown;
