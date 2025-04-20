import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { 
  FileText, 
  Upload, 
  Download, 
  Pencil, 
  Trash, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle
} from "lucide-react";

interface Document {
  id: number;
  propertyId: number;
  createdAt: string;
  uploaderId: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  category: string;
  description: string | null;
  isTemplate: boolean;
  updatedAt: string | null;
  expiresAt: string | null;
}

interface Signature {
  id: number;
  documentId: number;
  userId: number;
  signedAt: string;
  signatureImage: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function DocumentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("uploaded");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [signatureImage, setSignatureImage] = useState("");
  
  // Carica i documenti caricati dall'utente
  const {
    data: uploadedDocuments = [],
    isLoading: isLoadingUploaded,
    error: errorUploaded,
  } = useQuery<Document[]>({
    queryKey: ["/api/user/documents", { role: "uploader" }],
    queryFn: async () => {
      if (!user) return [];
      const response = await apiRequest("GET", "/api/user/documents?role=uploader");
      return response.json();
    },
    enabled: !!user
  });

  // Carica i documenti da firmare
  const {
    data: documentsToSign = [],
    isLoading: isLoadingToSign,
    error: errorToSign,
  } = useQuery<Document[]>({
    queryKey: ["/api/user/documents", { role: "signer" }],
    queryFn: async () => {
      if (!user) return [];
      const response = await apiRequest("GET", "/api/user/documents?role=signer");
      return response.json();
    },
    enabled: !!user
  });

  // Mutazione per caricare un nuovo documento
  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/documents", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Documento caricato",
        description: "Il documento è stato caricato con successo",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
      setShowUploadDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: "Errore durante il caricamento del documento: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Mutazione per eliminare un documento
  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      await apiRequest("DELETE", `/api/documents/${documentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Documento eliminato",
        description: "Il documento è stato eliminato con successo",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: "Errore durante l'eliminazione del documento: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Mutazione per firmare un documento
  const signMutation = useMutation({
    mutationFn: async ({ documentId, signatureData }: { documentId: number, signatureData: { signatureImage: string } }) => {
      const response = await apiRequest("POST", `/api/documents/${documentId}/sign`, signatureData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Documento firmato",
        description: "Il documento è stato firmato con successo",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
      setShowSignDialog(false);
      setSignatureImage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: "Errore durante la firma del documento: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Form per caricare un nuovo documento
  const UploadForm = () => {
    const [formData, setFormData] = useState({
      propertyId: "",
      fileName: "",
      fileSize: 0,
      fileType: "",
      fileUrl: "",
      category: "contratto",
      description: "",
      isTemplate: false,
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target as HTMLInputElement;
      if (type === 'checkbox') {
        const checkbox = e.target as HTMLInputElement;
        setFormData({
          ...formData,
          [name]: checkbox.checked,
        });
      } else {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setSelectedFile(file);
        setFormData({
          ...formData,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedFile) {
        toast({
          title: "Errore",
          description: "Seleziona un file da caricare",
          variant: "destructive",
        });
        return;
      }

      if (!formData.propertyId) {
        toast({
          title: "Errore",
          description: "Seleziona una proprietà",
          variant: "destructive",
        });
        return;
      }

      // In una implementazione reale, questa parte dovrebbe caricare il file su un server
      // e poi ottenere un URL per il file caricato
      // Qui simuliamo semplicemente generando un URL fittizio
      const fileUrl = `https://example.com/documents/${Date.now()}_${selectedFile.name}`;

      const data = new FormData();
      data.append("propertyId", formData.propertyId);
      data.append("fileName", formData.fileName);
      data.append("fileSize", formData.fileSize.toString());
      data.append("fileType", formData.fileType);
      data.append("fileUrl", fileUrl);
      data.append("category", formData.category);
      data.append("description", formData.description);
      data.append("isTemplate", formData.isTemplate.toString());
      data.append("file", selectedFile);

      uploadMutation.mutate(data);
    };

    return (
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="propertyId" className="text-right">
              Proprietà
            </Label>
            <select
              id="propertyId"
              name="propertyId"
              value={formData.propertyId}
              onChange={handleInputChange}
              className="col-span-3 px-3 py-2 border rounded"
              required
            >
              <option value="">Seleziona una proprietà</option>
              <option value="1">Appartamento in Via Roma</option>
              <option value="2">Monolocale in Via Milano</option>
              <option value="3">Stanza in Via Napoli</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right">
              File
            </Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Categoria
            </Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="col-span-3 px-3 py-2 border rounded"
            >
              <option value="contratto">Contratto</option>
              <option value="ricevuta">Ricevuta</option>
              <option value="documento_identita">Documento d'identità</option>
              <option value="altro">Altro</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descrizione
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="Inserisci una descrizione per il documento"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isTemplate" className="text-right">
              È un modello?
            </Label>
            <div className="col-span-3 flex items-center">
              <input
                id="isTemplate"
                name="isTemplate"
                type="checkbox"
                checked={formData.isTemplate}
                onChange={handleInputChange}
                className="mr-2"
              />
              <Label htmlFor="isTemplate">
                Salva come modello per futuri documenti
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowUploadDialog(false)}
          >
            Annulla
          </Button>
          <Button type="submit" disabled={uploadMutation.isPending}>
            {uploadMutation.isPending ? "Caricamento..." : "Carica"}
          </Button>
        </DialogFooter>
      </form>
    );
  };

  // Form per firmare un documento
  const SignForm = () => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [signatureCanvas, setSignatureCanvas] = useState<HTMLCanvasElement | null>(null);

    useEffect(() => {
      const canvas = document.getElementById('signature-canvas') as HTMLCanvasElement;
      if (canvas) {
        setSignatureCanvas(canvas);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.strokeStyle = '#000';
        }
      }
    }, []);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!signatureCanvas) return;
      const ctx = signatureCanvas.getContext('2d');
      if (!ctx) return;

      setIsDrawing(true);
      const rect = signatureCanvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !signatureCanvas) return;
      const ctx = signatureCanvas.getContext('2d');
      if (!ctx) return;

      const rect = signatureCanvas.getBoundingClientRect();
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    };

    const endDrawing = () => {
      if (!isDrawing || !signatureCanvas) return;
      setIsDrawing(false);
      const signatureImage = signatureCanvas.toDataURL('image/png');
      setSignatureImage(signatureImage);
    };

    const clearSignature = () => {
      if (!signatureCanvas) return;
      const ctx = signatureCanvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
      setSignatureImage('');
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!signatureImage || !selectedDocument) {
        toast({
          title: "Errore",
          description: "Per favore, traccia la tua firma prima di procedere",
          variant: "destructive",
        });
        return;
      }

      signMutation.mutate({
        documentId: selectedDocument.id,
        signatureData: { signatureImage }
      });
    };

    return (
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="text-center mb-4">
            <p>Traccia la tua firma nel riquadro sottostante:</p>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-md p-2 mx-auto">
            <canvas
              id="signature-canvas"
              width="400"
              height="200"
              className="bg-white cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
            ></canvas>
          </div>
          <div className="flex justify-center gap-2 mt-2">
            <Button type="button" variant="outline" onClick={clearSignature}>
              Cancella
            </Button>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              Firmando questo documento, confermi di averlo letto e compreso il contenuto.
              La tua firma è giuridicamente vincolante.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowSignDialog(false);
              setSignatureImage('');
            }}
          >
            Annulla
          </Button>
          <Button type="submit" disabled={signMutation.isPending || !signatureImage}>
            {signMutation.isPending ? "Elaborazione..." : "Firma documento"}
          </Button>
        </DialogFooter>
      </form>
    );
  };

  // Se l'utente non è autenticato, reindirizza alla pagina di autenticazione
  useEffect(() => {
    if (!user) {
      setLocation("/auth");
    }
  }, [user, setLocation]);

  if (!user) {
    return null;
  }

  const handleDeleteDocument = (document: Document) => {
    if (window.confirm(`Sei sicuro di voler eliminare il documento "${document.fileName}"?`)) {
      deleteMutation.mutate(document.id);
    }
  };

  const handleSignDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowSignDialog(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestione Documenti</h1>
        <Button onClick={() => setShowUploadDialog(true)} className="flex items-center gap-2">
          <Upload size={16} />
          Carica nuovo documento
        </Button>
      </div>

      <Tabs defaultValue="uploaded" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="uploaded">Documenti caricati</TabsTrigger>
          <TabsTrigger value="toSign">Documenti da firmare</TabsTrigger>
        </TabsList>
        
        <TabsContent value="uploaded">
          <Card>
            <CardHeader>
              <CardTitle>Documenti caricati da te</CardTitle>
              <CardDescription>
                Qui puoi visualizzare e gestire tutti i documenti che hai caricato nella piattaforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUploaded ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : errorUploaded ? (
                <div className="text-center py-8 text-red-500">
                  <AlertCircle className="mx-auto mb-2" />
                  Si è verificato un errore durante il caricamento dei documenti.
                </div>
              ) : uploadedDocuments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto mb-2" />
                  Non hai ancora caricato nessun documento.
                </div>
              ) : (
                <Table>
                  <TableCaption>Lista dei documenti caricati</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome File</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Dimensione</TableHead>
                      <TableHead>Data di caricamento</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadedDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.fileName}</TableCell>
                        <TableCell>{doc.category}</TableCell>
                        <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                        <TableCell>{formatDate(doc.createdAt)}</TableCell>
                        <TableCell>
                          {doc.isTemplate ? (
                            <Badge variant="outline">Modello</Badge>
                          ) : (
                            <Badge>Documento</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="icon" variant="ghost">
                                    <Download size={16} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Scarica</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="icon" variant="ghost">
                                    <Pencil size={16} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Modifica</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    onClick={() => handleDeleteDocument(doc)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash size={16} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Elimina</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="toSign">
          <Card>
            <CardHeader>
              <CardTitle>Documenti da firmare</CardTitle>
              <CardDescription>
                Qui puoi visualizzare e firmare i documenti che richiedono la tua firma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingToSign ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : errorToSign ? (
                <div className="text-center py-8 text-red-500">
                  <AlertCircle className="mx-auto mb-2" />
                  Si è verificato un errore durante il caricamento dei documenti.
                </div>
              ) : documentsToSign.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="mx-auto mb-2" />
                  Non hai documenti da firmare al momento.
                </div>
              ) : (
                <Table>
                  <TableCaption>Lista dei documenti da firmare</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome File</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Creato da</TableHead>
                      <TableHead>Data creazione</TableHead>
                      <TableHead>Scadenza</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentsToSign.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.fileName}</TableCell>
                        <TableCell>{doc.category}</TableCell>
                        <TableCell>Proprietario</TableCell>
                        <TableCell>{formatDate(doc.createdAt)}</TableCell>
                        <TableCell>
                          {doc.expiresAt ? (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatDate(doc.expiresAt)}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Nessuna scadenza</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="icon" variant="ghost">
                                    <Download size={16} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Scarica</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <Button 
                              variant="outline" 
                              className="flex items-center gap-1"
                              onClick={() => handleSignDocument(doc)}
                            >
                              <CheckCircle2 size={16} />
                              Firma
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog per il caricamento di un nuovo documento */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Carica un nuovo documento</DialogTitle>
            <DialogDescription>
              Compila il modulo per caricare un nuovo documento nella piattaforma.
            </DialogDescription>
          </DialogHeader>
          <UploadForm />
        </DialogContent>
      </Dialog>

      {/* Dialog per la firma di un documento */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Firma documento</DialogTitle>
            <DialogDescription>
              {selectedDocument && (
                <span>Stai per firmare il documento: <strong>{selectedDocument.fileName}</strong></span>
              )}
            </DialogDescription>
          </DialogHeader>
          <SignForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}