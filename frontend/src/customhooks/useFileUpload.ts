import { useState } from 'react';
import {FilePreview} from '../types/types'


export const useFileUpload = () => {
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);

  const generateFileId = () => `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleUpload = (options: { accept?: string; multiple?: boolean }) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = options.multiple ?? true;
    input.accept = options.accept ?? '*/*';
    
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      const newFiles = files.map(file => ({
        id:generateFileId(),
        type: file.type.split('/')[0],
        url: URL.createObjectURL(file),
        name: file.name,
        file: file,
        progress: 0,
        status: 'Idle',
      }));
      setFilePreviews(prev => [...prev, ...newFiles]);
    };
    
    input.click();
  };

  const updateFile = (id: string, updates: Partial<FilePreview>) => {
    setFilePreviews(prev =>
      prev.map(file => 
        file.id === id ? { ...file, ...updates } : file
      )
    );
  };

  const deleteFile = (index: number) => {
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const resetFiles = () => setFilePreviews([]);


  return { filePreviews, handleUpload, deleteFile, updateFile, resetFiles  };
};