import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, X, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (!acceptedFiles || acceptedFiles.length === 0) {
      setError('No file selected. Please try again.');
      return;
    }

    const selectedFile = acceptedFiles[0];
    
    // Check file type - now including more image files and text files
    const validTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'text/plain'
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      setError(`Unsupported file type: ${selectedFile.type}. Please upload a PDF, Word document, JPG/JPEG/PNG image, or text file.`);
      return;
    }
    
    // Check file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError(`File size (${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB) exceeds the 5MB limit. Please upload a smaller file.`);
      return;
    }
    
    // Check if file is empty
    if (selectedFile.size === 0) {
      setError('The file appears to be empty. Please upload a valid resume file.');
      return;
    }
    
    setFile(selectedFile);
    onFileUpload(selectedFile);
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    noClick: false,
    noKeyboard: false,
  });

  const removeFile = () => {
    setFile(null);
    setError(null);
    onFileUpload(null as any);
  };

  return (
    <div className="w-full">
      {!file ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500 hover:shadow-md'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input {...getInputProps()} ref={fileInputRef} />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`p-4 rounded-full ${isDragActive ? 'bg-indigo-100' : 'bg-gray-100'}`}>
              <Upload className={`h-10 w-10 ${isDragActive ? 'text-indigo-600' : 'text-indigo-500'}`} />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">Drag and drop your resume here</p>
              <p className="text-sm text-gray-500 mt-1">or click anywhere to browse files</p>
            </div>
            <p className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Supports PDF, DOC, DOCX, JPG, JPEG, PNG, TXT (Max 5MB)</p>
            <p className="text-xs text-indigo-600 font-medium">✨ NEW: Upload resume images for AI analysis!</p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-6 border-green-200 bg-green-50 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center">
                  <p className="font-medium truncate text-gray-900 mr-2">{file.name}</p>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-sm text-gray-600 mt-1">{(file.size / 1024).toFixed(1)} KB • Ready to analyze</p>
              </div>
            </div>
            <button 
              onClick={removeFile} 
              className="bg-white p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
              aria-label="Remove file"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-3 flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
          <X className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500">
          Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG, TXT (Max 5MB)
        </p>
        <p className="text-xs text-indigo-500 mt-1">
          We can analyze resume images and extract text automatically!
        </p>
      </div>
    </div>
  );
};

export default FileUpload; 