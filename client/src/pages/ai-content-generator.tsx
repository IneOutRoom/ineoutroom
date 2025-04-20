import React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form, FormControl, FormDescription, FormField, FormItem, 
  FormLabel, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { propertyTypeEnum } from "@shared/schema";
import { useAIGeneration } from "@/hooks/use-ai-generation";
import { useToast } from "@/hooks/use-toast";
import { Clipboard, Loader2, RefreshCw, Wand2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { PropertyAttributes } from "server/services/descriptionGenerator";

// Schema per il form di generazione AI
const aiGenerationSchema = z.object({
  propertyType: z.enum([
    "stanza_singola", 
    "stanza_doppia", 
    "monolocale", 
    "bilocale", 
    "altro"
  ]),
  city: z.string().min(2, "Inserisci una città valida"),
  zone: z.string().optional(),
  squareMeters: z.coerce.number().min(1).optional(),
  rooms: z.coerce.number().min(1).optional(),
  bathrooms: z.coerce.number().min(1).optional(),
  features: z.string().optional(),
  language: z.string().optional()
});

// Tipo derivato dallo schema
type AIGenerationFormValues = z.infer<typeof aiGenerationSchema>;

const AIContentGeneratorPage: React.FC = () => {
  const { toast } = useToast();
  const [generatedTitle, setGeneratedTitle] = useState<string>("");
  const [generatedDescription, setGeneratedDescription] = useState<string>("");
  
  // Hook per la generazione AI
  const {
    generateTitle,
    generateDescription,
    isGeneratingTitle,
    isGeneratingDescription
  } = useAIGeneration();

  // Inizializza il form
  const form = useForm<AIGenerationFormValues>({
    resolver: zodResolver(aiGenerationSchema),
    defaultValues: {
      propertyType: "stanza_singola",
      city: "",
      zone: "",
      squareMeters: undefined,
      rooms: undefined,
      bathrooms: undefined,
      features: "[]",
      language: "italiano"
    }
  });

  // Handler per generare titolo
  const handleGenerateTitle = async (data: AIGenerationFormValues) => {
    try {
      let features: string[] = [];
      try {
        features = data.features ? JSON.parse(data.features) : [];
      } catch (error) {
        toast({
          title: "Errore formato caratteristiche",
          description: "Assicurati che il formato JSON sia corretto: [\"feature1\", \"feature2\"]",
          variant: "destructive"
        });
        return;
      }
      
      const propertyData: PropertyAttributes = {
        propertyType: data.propertyType,
        city: data.city,
        zone: data.zone,
        squareMeters: data.squareMeters,
        rooms: data.rooms,
        bathrooms: data.bathrooms,
        features,
        language: data.language
      };
      
      const title = await generateTitle.mutateAsync(propertyData);
      setGeneratedTitle(title);
      
      toast({
        title: "Titolo generato",
        description: "Titolo creato con successo"
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile generare il titolo",
        variant: "destructive"
      });
    }
  };

  // Handler per generare descrizione
  const handleGenerateDescription = async (data: AIGenerationFormValues) => {
    try {
      let features: string[] = [];
      try {
        features = data.features ? JSON.parse(data.features) : [];
      } catch (error) {
        toast({
          title: "Errore formato caratteristiche",
          description: "Assicurati che il formato JSON sia corretto: [\"feature1\", \"feature2\"]",
          variant: "destructive"
        });
        return;
      }
      
      const propertyData: PropertyAttributes = {
        propertyType: data.propertyType,
        city: data.city,
        zone: data.zone,
        squareMeters: data.squareMeters,
        rooms: data.rooms,
        bathrooms: data.bathrooms,
        features,
        language: data.language
      };
      
      const description = await generateDescription.mutateAsync(propertyData);
      setGeneratedDescription(description);
      
      toast({
        title: "Descrizione generata",
        description: "Descrizione creata con successo"
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile generare la descrizione",
        variant: "destructive"
      });
    }
  };

  // Handler per il form
  const onSubmit = (data: AIGenerationFormValues) => {
    // Non usato direttamente
  };

  // Funzione per copiare il testo negli appunti
  const copyToClipboard = (text: string, type: 'titolo' | 'descrizione') => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${type === "titolo" ? "Titolo" : "Descrizione"} copiato`,
      description: "Contenuto copiato negli appunti"
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Header Banner con gradiente */}
      <div className="bg-gradient-to-r from-[#6a0dad]/90 to-[#6a0dad]/70 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
                Generatore di contenuti AI
              </h1>
              <p className="text-white/80 text-lg max-w-2xl">
                Crea titoli e descrizioni professionali per i tuoi annunci con l'intelligenza artificiale
              </p>
            </div>
            <div className="mt-6 md:mt-0">
              <Button 
                className="bg-white text-[#6a0dad] hover:bg-[#ffcb05] hover:text-[#333] shadow-lg transition-all transform hover:scale-105"
                size="lg"
                onClick={() => window.scrollTo({top: document.getElementById('aiForm')?.offsetTop - 100, behavior: 'smooth'})}
              >
                <Wand2 className="mr-2 h-5 w-5" />
                Inizia a generare
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 flex-1" id="aiForm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonna del form */}
          <div className="col-span-1">
            <Card className="border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-[#6a0dad]/10 to-transparent border-b pb-4">
                <CardTitle className="flex items-center">
                  <Wand2 className="h-5 w-5 mr-2 text-[#6a0dad]" />
                  Informazioni proprietà
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form className="space-y-4">
                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo proprietà</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona un tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {propertyTypeEnum.enumValues.map(type => (
                                <SelectItem key={type} value={type}>
                                  {type === 'stanza_singola' ? 'Stanza Singola'
                                    : type === 'stanza_doppia' ? 'Stanza Doppia'
                                    : type === 'monolocale' ? 'Monolocale'
                                    : type === 'bilocale' ? 'Bilocale'
                                    : 'Altro'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Città</FormLabel>
                            <FormControl>
                              <Input placeholder="Milano" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="zone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zona/Quartiere</FormLabel>
                            <FormControl>
                              <Input placeholder="Navigli" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="squareMeters"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Metri quadri</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="rooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stanze</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="bathrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bagni</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="features"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Caratteristiche</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="balcone, aria condizionata, arredato"
                              {...field}
                              className="h-24"
                            />
                          </FormControl>
                          <FormDescription>
                            Inserisci le caratteristiche separate da virgole
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lingua</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona una lingua" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="italiano">Italiano</SelectItem>
                              <SelectItem value="english">Inglese</SelectItem>
                              <SelectItem value="español">Spagnolo</SelectItem>
                              <SelectItem value="français">Francese</SelectItem>
                              <SelectItem value="deutsch">Tedesco</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Lingua in cui generare il contenuto
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex flex-col space-y-2 pt-4">
                      <Button
                        type="button"
                        onClick={() => handleGenerateTitle(form.getValues())}
                        disabled={isGeneratingTitle || !form.formState.isValid}
                        className="bg-[#6a0dad] hover:bg-[#6a0dad]/90 text-white"
                      >
                        {isGeneratingTitle ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generazione titolo...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4 mr-2" />
                            Genera titolo
                          </>
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        onClick={() => handleGenerateDescription(form.getValues())}
                        disabled={isGeneratingDescription || !form.formState.isValid}
                        className="bg-[#6a0dad] hover:bg-[#6a0dad]/90 text-white"
                      >
                        {isGeneratingDescription ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generazione descrizione...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4 mr-2" />
                            Genera descrizione
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          {/* Colonna dei risultati */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#6a0dad]/10 to-transparent border-b pb-4">
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Wand2 className="h-5 w-5 mr-2 text-[#6a0dad]" />
                    <span>Titolo generato</span>
                  </div>
                  <div className="flex space-x-2">
                    {generatedTitle && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="hover:bg-[#ffcb05]/20 hover:border-[#ffcb05] transition-colors"
                        onClick={() => copyToClipboard(generatedTitle, "titolo")}
                      >
                        <Clipboard className="h-4 w-4 mr-2" />
                        Copia
                      </Button>
                    )}
                    {generatedTitle && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="hover:bg-[#6a0dad]/10 hover:border-[#6a0dad] transition-colors"
                        onClick={() => handleGenerateTitle(form.getValues())}
                        disabled={isGeneratingTitle}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isGeneratingTitle ? 'animate-spin' : ''}`} />
                        Rigenera
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {isGeneratingTitle ? (
                  <div className="flex flex-col items-center justify-center p-8">
                    <div className="bg-[#6a0dad]/10 p-4 rounded-full mb-4">
                      <Loader2 className="h-8 w-8 animate-spin text-[#6a0dad]" />
                    </div>
                    <p className="text-lg text-gray-600">Generazione titolo in corso...</p>
                    <p className="text-sm text-gray-500 mt-2">Questo potrebbe richiedere alcuni secondi</p>
                  </div>
                ) : generatedTitle ? (
                  <div className="p-6 bg-gradient-to-r from-[#6a0dad]/5 to-transparent rounded-lg border border-[#6a0dad]/10">
                    <p className="text-xl font-semibold text-gray-800" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
                      {generatedTitle}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 rounded-lg border border-dashed border-gray-200">
                    <Wand2 className="h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Nessun titolo generato</h3>
                    <p className="max-w-md">
                      Compila il form con i dettagli della proprietà e premi "Genera titolo" per creare un titolo accattivante per il tuo annuncio.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#6a0dad]/10 to-transparent border-b pb-4">
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Wand2 className="h-5 w-5 mr-2 text-[#6a0dad]" />
                    <span>Descrizione generata</span>
                  </div>
                  <div className="flex space-x-2">
                    {generatedDescription && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="hover:bg-[#ffcb05]/20 hover:border-[#ffcb05] transition-colors"
                        onClick={() => copyToClipboard(generatedDescription, "descrizione")}
                      >
                        <Clipboard className="h-4 w-4 mr-2" />
                        Copia
                      </Button>
                    )}
                    {generatedDescription && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="hover:bg-[#6a0dad]/10 hover:border-[#6a0dad] transition-colors"
                        onClick={() => handleGenerateDescription(form.getValues())}
                        disabled={isGeneratingDescription}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isGeneratingDescription ? 'animate-spin' : ''}`} />
                        Rigenera
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {isGeneratingDescription ? (
                  <div className="flex flex-col items-center justify-center p-8">
                    <div className="bg-[#6a0dad]/10 p-4 rounded-full mb-4">
                      <Loader2 className="h-8 w-8 animate-spin text-[#6a0dad]" />
                    </div>
                    <p className="text-lg text-gray-600">Generazione descrizione in corso...</p>
                    <p className="text-sm text-gray-500 mt-2">Stiamo creando una descrizione dettagliata e professionale</p>
                  </div>
                ) : generatedDescription ? (
                  <div className="p-6 bg-gradient-to-r from-[#6a0dad]/5 to-transparent rounded-lg border border-[#6a0dad]/10">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {generatedDescription}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 rounded-lg border border-dashed border-gray-200">
                    <Wand2 className="h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Nessuna descrizione generata</h3>
                    <p className="max-w-md">
                      Compila il form con i dettagli della proprietà e premi "Genera descrizione" per creare una descrizione dettagliata e professionale per il tuo annuncio.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIContentGeneratorPage;