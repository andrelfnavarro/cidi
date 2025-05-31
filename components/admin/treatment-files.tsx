'use client';

import { useState, useEffect, useRef } from 'react';
import {
  FileIcon,
  FileText,
  ImageIcon,
  FileSpreadsheet,
  Loader2,
  Upload,
  Trash2,
  Download,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  uploadTreatmentFile,
  getTreatmentFiles,
  getFilePresignedUrl,
  deleteTreatmentFile,
} from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

// Helper function to get appropriate icon by file type
function getFileIcon(fileType: string) {
  if (fileType.includes('image')) {
    return <ImageIcon className="h-5 w-5 text-blue-600" />;
  } else if (fileType.includes('pdf')) {
    return <ImageIcon className="h-5 w-5 text-red-600" />;
  } else if (
    fileType.includes('spreadsheet') ||
    fileType.includes('excel') ||
    fileType.includes('csv')
  ) {
    return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
  } else if (fileType.includes('text')) {
    return <FileText className="h-5 w-5 text-yellow-600" />;
  } else {
    return <FileIcon className="h-5 w-5 text-gray-600" />;
  }
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function TreatmentFiles({
  treatmentId,
  isReadOnly = false,
}: {
  treatmentId: string;
  isReadOnly?: boolean;
}) {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [customFileName, setCustomFileName] = useState('');
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Store the selected file here
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load files
  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const result = await getTreatmentFiles(treatmentId);
      setFiles(result.files || []);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os arquivos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [treatmentId]);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file); // Store the selected file
      setCustomFileName(file.name);
      setIsAddingFile(true);
      console.log("File selected:", file.name, "Size:", file.size, "Type:", file.type);
    }
  };

  // Handle file upload
  const handleUploadFile = async () => {
    // Use the stored selectedFile instead of checking fileInputRef
    if (!selectedFile) {
      console.log('Nenhum arquivo selecionado');
      return;
    }

    const file = selectedFile;
    const fileName = customFileName || file.name;
    
    try {
      setIsUploading(true);
      
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);
      
      console.log("Uploading file:", file.name, "Size:", file.size, "Type:", file.type);
      await uploadTreatmentFile(treatmentId, file, fileName);
      
      clearInterval(interval);
      setUploadProgress(100);
      
      toast({
        title: 'Arquivo enviado',
        description: 'O arquivo foi enviado com sucesso.',
      });
      
      // Reset form
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setCustomFileName('');
      setIsAddingFile(false);
      setSelectedFile(null); // Clear the selected file
      
      // Reload files list
      loadFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o arquivo.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle file deletion
  const handleDeleteFile = async () => {
    if (!selectedFileId) return;

    try {
      await deleteTreatmentFile(selectedFileId);

      toast({
        title: 'Arquivo excluído',
        description: 'O arquivo foi excluído com sucesso.',
      });

      // Reload files list
      loadFiles();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o arquivo.',
        variant: 'destructive',
      });
    } finally {
      setIsConfirmDeleteOpen(false);
      setSelectedFileId(null);
    }
  };

  // Handle file download/view
  const handleViewFile = async (filePath: string) => {
    try {
      const url = await getFilePresignedUrl(filePath);
      window.open(url, '_blank');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível acessar o arquivo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      {!isReadOnly && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Arquivos</h3>
          
          {isAddingFile ? (
            <div className="flex items-center gap-2 w-full max-w-md">
              <Input 
                type="text"
                placeholder="Nome do arquivo"
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
              />
              <Button
                size="sm"
                onClick={handleUploadFile}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploadProgress}%
                  </>
                ) : (
                  <>Enviar</>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAddingFile(false);
                  setCustomFileName('');
                  setSelectedFile(null); // Clear the selected file
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Adicionar arquivo
              </Button>
            </>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : files.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-600">
              Nenhum arquivo encontrado para este tratamento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {files.map(file => {
            const createdAt = new Date(file.created_at);
            const formattedDate = format(createdAt, 'dd/MM/yyyy HH:mm', {
              locale: ptBR,
            });

            return (
              <Card key={file.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getFileIcon(file.file_type)}
                      <div>
                        <h4 className="font-medium line-clamp-1">
                          {file.file_name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {formatBytes(file.file_size)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Adicionado em {formattedDate}
                        </p>
                        {file.uploaded_by_dentist && (
                          <p className="text-xs text-gray-500">
                            Por: {file.uploaded_by_dentist.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewFile(file.file_path)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      {!isReadOnly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedFileId(file.id);
                            setIsConfirmDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog for Delete */}
      <AlertDialog
        open={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir arquivo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este arquivo? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFile}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
