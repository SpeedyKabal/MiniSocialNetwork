import { CircleX } from 'lucide-react'; // Assuming you're using lucide-react icons
import React from 'react';
import { FilePreview } from '../types/types'

export const FilePreviews = ({
  file,
  onDelete
}: {
  file: FilePreview;
  onDelete: () => void
}) => {
  let content;
  let containerClass;

  switch (file.type) {
    case 'image':
      containerClass = "relative flex flex-col items-center w-32 h-32 min-w-32 min-h-32";
      content = (
        <img
          src={file.url}
          alt={`Preview ${file.name}`}
          className="w-full h-full object-cover rounded-md"
        />
      );
      break;
    case 'video':
      containerClass = "relative w-32 h-32 min-w-32 min-h-32 flex flex-col items-center";
      content = (
        <video
          src={file.url}
          controls
          className="w-full h-full object-cover rounded-md"
        />
      );
      break;
    case 'audio':
      containerClass = "relative flex items-center gap-2 w-60 flex-col";
      content = (
        <>
          <span className="text-sm">{file.name}</span>
          <audio controls className="w-full">
            <source src={file.url} />
            Your browser does not support the audio element.
          </audio>
        </>
      );
      break;
    default:
      containerClass = "relative flex flex-col items-center w-36 h-36 min-w-36 min-h-36";
      content = (
        <div className="flex flex-col items-center justify-center max-w-full h-full gap-2">
          <FileIcon className="w-12 h-12 text-gray-400" />
          <p className="text-sm text-center truncate w-30 text-wrap ">{file.name}</p>
        </div>
      );
  }

  return (
    <div className={containerClass}>
      {content}
      <div
        className="absolute bottom-[50%] left-0 h-5 bg-blue-500"
        style={{ width: `${file.progress}%` }}
      />
      <span className="text-lg text-red-700">{file.status}</span>
      <CircleX
        className="absolute top-0 right-0 cursor-pointer text-red-200 hover:text-red-500"
        onClick={onDelete}
      />
    </div>
  );
};

// Helper component for file icon
const FileIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);