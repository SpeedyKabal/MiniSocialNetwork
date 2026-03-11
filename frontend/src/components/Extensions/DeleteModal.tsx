import React from "react";

interface DeleteModalProps {
    title: React.ReactNode;
    body: React.ReactNode;
    cancelText: string;
    confirmText: string;
    onCancel: () => void;
    onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
    title,
    body,
    cancelText,
    confirmText,
    onCancel,
    onConfirm,
}) => {
    return (
        <li className="absolute inset-0 bg-black/75 bg-opacity-50 flex justify-center items-center z-20 rounded-lg">
            <div className="bg-white">
                {/* <!-- Modal Header --> */}
                <div className="bg-indigo-500 text-white px-4 py-2 flex justify-between">
                    <h2 className="text-md lg:text-lg font-semibold">{title}</h2>
                </div>
                {/* <!-- Modal Body --> */}
                <div className="p-6 text-md lg:text-lg">
                    <p>{body}</p>
                </div>
                {/* <!-- Modal Footer --> */}
                <div className="border-t px-4 py-2 flex justify-end space-x-4">
                    <button
                        onClick={onCancel}
                        className="px-3 py-2 bg-slate-500 hover:bg-slate-400 text-white text-md lg:text-lg rounded-md w-full sm:w-auto"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-3 py-2 bg-indigo-500 hover:bg-indigo-300 text-white text-md lg:text-lg rounded-md w-full sm:w-auto"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </li>
    );
};
export default DeleteModal;
