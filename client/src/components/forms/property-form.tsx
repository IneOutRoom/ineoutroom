import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form, FormControl, FormDescription, FormField, FormItem, 
  FormLabel, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, X, PencilLine, Building } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { propertyTypeEnum } from "@shared/schema";
import PropertyFormPriceSuggestion from "../pricing/PropertyFormPriceSuggestion";
import { useAI } from "@/hooks/use-ai";
import { useAIComplete } from "@/hooks/use-ai-complete";
import { Wand2, Sparkles } from "lucide-react";

// Schema di form di edizione proprietà
const propertyFormSchema = z.object({
  title: z.string().min(5, { message: "Il titolo deve contenere almeno 5 caratteri" }),
  description: z.string().min(20, { message: "La descrizione deve contenere almeno 20 caratteri" }),
  price: z.string()
    .refine(val => val === "" || (Number(val) > 0 && !isNaN(Number(val))), {
      message: "Il prezzo deve essere un valore numerico maggiore di zero"
    }),
  propertyType: z.enum(propertyTypeEnum.enumValues, {
    errorMap: () => ({ message: "Seleziona un tipo di proprietà" })
  }),
  city: z.string().min(2, { message: "Inserisci una città valida" }),
  zone: z.string().optional(),
  address: z.string().min(5, { message: "Inserisci un indirizzo valido completo di via e numero civico" }),
  features: z.string().default("[]"), // JSON stringificato per le features
  expireMonths: z.coerce.number().min(1, { message: "L'annuncio deve durare almeno 1 mese" }).max(12, { message: "La durata massima è di 12 mesi" }).default(3),
  photos: z.any().optional().refine(val => !val || val instanceof FileList && val.length > 0, {
    message: "Carica almeno una foto della proprietà per aumentare le possibilità di contatto"
  }),
  squareMeters: z.string()
    .refine(val => val === "" || (Number(val) > 0 && !isNaN(Number(val))), {
      message: "I metri quadri devono essere un valore numerico positivo"
    })
    .optional(),
  rooms: z.string()
    .refine(val => val === "" || (Number(val) > 0 && !isNaN(Number(val))), {
      message: "Il numero di stanze deve essere un valore numerico positivo"
    })
    .optional(),
  bathrooms: z.string()
    .refine(val => val === "" || (Number(val) > 0 && !isNaN(Number(val))), {
      message: "Il numero di bagni deve essere un valore numerico positivo"
    })
    .optional(),
  isFurnished: z.boolean().default(false),
  allowsPets: z.boolean().default(false),
  internetIncluded: z.boolean().default(false),
});

// Tipo derivato dallo schema
type PropertyFormValues = z.infer<typeof propertyFormSchema>;

interface PropertyFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting
}) => {
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  
  // Inizializza il form
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      propertyType: initialData?.propertyType || "stanza_singola",
      description: initialData?.description || "",
      price: initialData?.price ? String(initialData.price) : "",
      city: initialData?.city || "",
      zone: initialData?.zone || "",
      address: initialData?.address || "",
      squareMeters: initialData?.squareMeters ? String(initialData.squareMeters) : "",
      rooms: initialData?.rooms ? String(initialData.rooms) : "",
      bathrooms: initialData?.bathrooms ? String(initialData.bathrooms) : "",
      features: initialData?.features || "[]",
      expireMonths: initialData?.expireMonths || 3,
      photos: undefined,
      isFurnished: initialData?.isFurnished || false,
      allowsPets: initialData?.allowsPets || false,
      internetIncluded: initialData?.internetIncluded || false,
    }
  });

  // Handler per suggerimenti prezzi
  const handlePriceSuggestionApply = (price: number) => {
    form.setValue("price", price > 0 ? String(price) : "");
  };

  // Handler per la generazione del titolo
  const handleTitleGenerated = (title: string) => {
    form.setValue("title", title);
  };

  // Handler per la generazione della descrizione
  const handleDescriptionGenerated = (description: string) => {
    form.setValue("description", description);
  };

  // Funzione per formattare i numeri con separatore delle migliaia
  const formatNumber = (value: string | number): string => {
    if (value === "" || value === undefined || value === null) return "";
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return "";
    
    return num.toLocaleString('it-IT');
  };

  // Funzione per deformattare i numeri (rimuovere separatori)
  const deformatNumber = (formattedValue: string): string => {
    if (!formattedValue) return "";
    return formattedValue.replace(/\./g, '').replace(',', '.');
  };

  // Handler per il submit del form
  const handleSubmit = (values: PropertyFormValues) => {
    // Formatta la data di scadenza
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + values.expireMonths);
    
    // Controllo esplicito dei campi obbligatori
    const requiredFields = [
      { name: 'title', label: 'Titolo' },
      { name: 'description', label: 'Descrizione' },
      { name: 'propertyType', label: 'Tipo proprietà' },
      { name: 'price', label: 'Prezzo' },
      { name: 'city', label: 'Città' },
      { name: 'address', label: 'Indirizzo' }
    ];
    
    let hasAllRequiredFields = true;
    
    for (const field of requiredFields) {
      if (!values[field.name as keyof PropertyFormValues]) {
        form.setError(field.name as any, {
          type: 'manual',
          message: `Il campo ${field.label} è obbligatorio. Completa questo dato per procedere.`
        });
        hasAllRequiredFields = false;
      }
    }
    
    // Se mancano campi obbligatori, non procediamo con l'invio
    if (!hasAllRequiredFields) {
      return;
    }
    
    // Prepara i dati per il submit, convertendo i valori stringa in numeri
    const formData = {
      ...values,
      price: values.price ? Number(deformatNumber(values.price)) : 0,
      squareMeters: values.squareMeters && values.squareMeters !== "" ? Number(deformatNumber(values.squareMeters)) : null,
      rooms: values.rooms && values.rooms !== "" ? Number(deformatNumber(values.rooms)) : null,
      bathrooms: values.bathrooms && values.bathrooms !== "" ? Number(deformatNumber(values.bathrooms)) : null,
      expiresAt
    };
    
    onSubmit(formData);
  };

  // Gestione caricamento immagini
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    form.setValue("photos", files);
    
    if (files && files.length > 0) {
      const newPreviews: string[] = [];
      
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newPreviews.push(e.target.result as string);
            if (newPreviews.length === files.length) {
              setPhotoPreviews(newPreviews);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const clearPhotos = () => {
    form.setValue("photos", undefined);
    setPhotoPreviews([]);
    const input = document.getElementById("photo-upload") as HTMLInputElement;
    if (input) input.value = "";
  };

  // Calcolo della dimensione per il generatore AI
  const squareMetersValue = form.watch("squareMeters");
  const size = typeof squareMetersValue === 'string' && squareMetersValue !== ""
    ? parseInt(squareMetersValue) 
    : 0;

  // Utilizziamo il nostro hook personalizzato per la generazione AI
  const { generateTitle, generateDescription } = useAI({
    propertyType: form.watch("propertyType") || "",
    city: form.watch("city") || "",
    zone: form.watch("zone") || "",
    size
  });
  
  // Utilizziamo il nuovo hook ottimizzato per la generazione AI completa
  const { openGeneratorModal } = useAIComplete({
    initialTitle: form.watch("title") || "",
    initialDescription: form.watch("description") || "",
    propertyType: form.watch("propertyType") || "",
    city: form.watch("city") || "",
    zone: form.watch("zone") || "",
    size
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonna principale */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titolo annuncio</FormLabel>
                    <FormControl>
                      <Input placeholder="Inserisci un titolo" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Pulsante generazione completa */}
              <div className="flex items-end pb-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full flex gap-2 border-dashed"
                  onClick={() => openGeneratorModal(handleTitleGenerated, handleDescriptionGenerated)}
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Genera tutto con AI</span>
                </Button>
              </div>
              
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo proprietà</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ""}
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
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrivi la proprietà in dettaglio" 
                      className="min-h-[150px]"
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Città</FormLabel>
                    <FormControl>
                      <Input placeholder="Milano" {...field} value={field.value || ""} />
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
                      <Input placeholder="Navigli" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Indirizzo</FormLabel>
                  <FormControl>
                    <Input placeholder="Via Roma, 123" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    L'indirizzo preciso sarà visibile solo dopo il contatto iniziale
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prezzo (€)</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type="text"
                          inputMode="numeric"
                          placeholder="Es: 450"
                          className="pl-7"
                          {...field} 
                          value={field.value || ""} 
                          onChange={(e) => {
                            // Accetta solo numeri e separatori
                            const value = e.target.value.replace(/[^\d.,]/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                    </div>
                    <FormDescription>
                      Prezzo mensile
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="squareMeters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metri quadri</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type="text"
                          inputMode="numeric"
                          placeholder="Es: 25" 
                          className="pr-8"
                          {...field} 
                          value={field.value || ""} 
                          onChange={(e) => {
                            // Accetta solo numeri
                            const value = e.target.value.replace(/[^\d]/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">m²</span>
                    </div>
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
                      <Input 
                        type="text" 
                        inputMode="numeric"
                        placeholder="Numero stanze" 
                        {...field} 
                        value={field.value || ""} 
                        onChange={(e) => {
                          // Accetta solo numeri
                          const value = e.target.value.replace(/[^\d]/g, '');
                          field.onChange(value);
                        }}
                      />
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
                      <Input 
                        type="text" 
                        inputMode="numeric"
                        placeholder="Numero bagni" 
                        {...field} 
                        value={field.value || ""} 
                        onChange={(e) => {
                          // Accetta solo numeri
                          const value = e.target.value.replace(/[^\d]/g, '');
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 mb-6">
              <h3 className="text-lg font-medium text-primary mb-3">Caratteristiche dell'immobile</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 border-b border-primary/10 pb-4">
                <FormField
                  control={form.control}
                  name="isFurnished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-medium cursor-pointer">
                        Arredato
                      </FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="allowsPets"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-medium cursor-pointer">
                        Animali ammessi
                      </FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="internetIncluded"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-medium cursor-pointer">
                        Internet incluso
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Checkbox id="wifi" 
                  checked={(JSON.parse(form.watch("features") || '[]') as string[]).includes('wifi')}
                  onCheckedChange={(checked) => {
                    const features = JSON.parse(form.watch("features") || '[]') as string[];
                    if (checked) {
                      features.push('wifi');
                    } else {
                      const index = features.indexOf('wifi');
                      if (index > -1) features.splice(index, 1);
                    }
                    form.setValue("features", JSON.stringify(features));
                  }}
                  className="data-[state=checked]:bg-primary"
                />
                <label htmlFor="wifi" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Wi-Fi
                </label>

                <Checkbox id="balcone" 
                  checked={(JSON.parse(form.watch("features") || '[]') as string[]).includes('balcone')}
                  onCheckedChange={(checked) => {
                    const features = JSON.parse(form.watch("features") || '[]') as string[];
                    if (checked) {
                      features.push('balcone');
                    } else {
                      const index = features.indexOf('balcone');
                      if (index > -1) features.splice(index, 1);
                    }
                    form.setValue("features", JSON.stringify(features));
                  }}
                  className="data-[state=checked]:bg-primary"
                />
                <label htmlFor="balcone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Balcone
                </label>

                <Checkbox id="arredato" 
                  checked={(JSON.parse(form.watch("features") || '[]') as string[]).includes('arredato')}
                  onCheckedChange={(checked) => {
                    const features = JSON.parse(form.watch("features") || '[]') as string[];
                    if (checked) {
                      features.push('arredato');
                    } else {
                      const index = features.indexOf('arredato');
                      if (index > -1) features.splice(index, 1);
                    }
                    form.setValue("features", JSON.stringify(features));
                  }}
                  className="data-[state=checked]:bg-primary"
                />
                <label htmlFor="arredato" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Arredato
                </label>

                <Checkbox id="lavatrice" 
                  checked={(JSON.parse(form.watch("features") || '[]') as string[]).includes('lavatrice')}
                  onCheckedChange={(checked) => {
                    const features = JSON.parse(form.watch("features") || '[]') as string[];
                    if (checked) {
                      features.push('lavatrice');
                    } else {
                      const index = features.indexOf('lavatrice');
                      if (index > -1) features.splice(index, 1);
                    }
                    form.setValue("features", JSON.stringify(features));
                  }}
                  className="data-[state=checked]:bg-primary"
                />
                <label htmlFor="lavatrice" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Lavatrice
                </label>

                <Checkbox id="lavastoviglie" 
                  checked={(JSON.parse(form.watch("features") || '[]') as string[]).includes('lavastoviglie')}
                  onCheckedChange={(checked) => {
                    const features = JSON.parse(form.watch("features") || '[]') as string[];
                    if (checked) {
                      features.push('lavastoviglie');
                    } else {
                      const index = features.indexOf('lavastoviglie');
                      if (index > -1) features.splice(index, 1);
                    }
                    form.setValue("features", JSON.stringify(features));
                  }}
                  className="data-[state=checked]:bg-primary"
                />
                <label htmlFor="lavastoviglie" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Lavastoviglie
                </label>

                <Checkbox id="riscaldamento" 
                  checked={(JSON.parse(form.watch("features") || '[]') as string[]).includes('riscaldamento')}
                  onCheckedChange={(checked) => {
                    const features = JSON.parse(form.watch("features") || '[]') as string[];
                    if (checked) {
                      features.push('riscaldamento');
                    } else {
                      const index = features.indexOf('riscaldamento');
                      if (index > -1) features.splice(index, 1);
                    }
                    form.setValue("features", JSON.stringify(features));
                  }}
                  className="data-[state=checked]:bg-primary"
                />
                <label htmlFor="riscaldamento" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Riscaldamento
                </label>

                <Checkbox id="aria_condizionata" 
                  checked={(JSON.parse(form.watch("features") || '[]') as string[]).includes('aria_condizionata')}
                  onCheckedChange={(checked) => {
                    const features = JSON.parse(form.watch("features") || '[]') as string[];
                    if (checked) {
                      features.push('aria_condizionata');
                    } else {
                      const index = features.indexOf('aria_condizionata');
                      if (index > -1) features.splice(index, 1);
                    }
                    form.setValue("features", JSON.stringify(features));
                  }}
                  className="data-[state=checked]:bg-primary"
                />
                <label htmlFor="aria_condizionata" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Aria condizionata
                </label>

                <Checkbox id="ascensore" 
                  checked={(JSON.parse(form.watch("features") || '[]') as string[]).includes('ascensore')}
                  onCheckedChange={(checked) => {
                    const features = JSON.parse(form.watch("features") || '[]') as string[];
                    if (checked) {
                      features.push('ascensore');
                    } else {
                      const index = features.indexOf('ascensore');
                      if (index > -1) features.splice(index, 1);
                    }
                    form.setValue("features", JSON.stringify(features));
                  }}
                  className="data-[state=checked]:bg-primary"
                />
                <label htmlFor="ascensore" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Ascensore
                </label>
              </div>
              
              <FormField
                control={form.control}
                name="features"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="expireMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durata annuncio</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona durata" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 mese</SelectItem>
                      <SelectItem value="2">2 mesi</SelectItem>
                      <SelectItem value="3">3 mesi</SelectItem>
                      <SelectItem value="6">6 mesi</SelectItem>
                      <SelectItem value="12">12 mesi</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Il tuo annuncio sarà visibile per questo periodo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel>Foto</FormLabel>
              <div className="flex flex-col space-y-2">
                <Input
                  id="photo-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                
                {photoPreviews.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2 mt-2">
                      {photoPreviews.map((preview, index) => (
                        <div key={index} className="relative w-24 h-24">
                          <img 
                            src={preview} 
                            alt={`Preview ${index}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={clearPhotos}
                      className="mt-2"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Rimuovi foto
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Colonna suggerimenti */}
          <div className="lg:col-span-1 space-y-6">
            <PropertyFormPriceSuggestion
              city={form.watch("city") || ""}
              zone={form.watch("zone") || ""}
              propertyType={form.watch("propertyType") || ""}
              onSuggestionApply={handlePriceSuggestionApply}
            />
            
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Assistente AI per la creazione dell'annuncio
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 px-4 py-2"
                  onClick={() => {
                    const currentTitle = form.getValues("title") || "";
                    generateTitle(currentTitle, handleTitleGenerated);
                  }}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Genera titolo
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 px-4 py-2"
                  onClick={() => {
                    const currentDescription = form.getValues("description") || "";
                    generateDescription(currentDescription, handleDescriptionGenerated);
                  }}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Genera descrizione
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                L'assistente AI ti aiuterà a creare un titolo accattivante e una descrizione dettagliata per il tuo annuncio.
                Inserisci prima i dettagli come tipo di proprietà, città e caratteristiche per risultati migliori.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4 mt-8">
          {/* Mostra avviso se ci sono errori nel form */}
          {Object.keys(form.formState.errors).length > 0 && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Ci sono campi mancanti o non validi</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Assicurati di completare tutti i campi obbligatori e caricare almeno una foto prima di pubblicare l'annuncio.</p>
                    <ul className="list-disc pl-5 mt-2">
                      {Object.entries(form.formState.errors).map(([field, error]) => (
                        <li key={field}>{error?.message?.toString() || `Completa il campo ${field}`}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#6a0dad] hover:bg-[#6a0dad]/80 text-white text-lg px-8 py-6 shadow-lg transition-all transform hover:scale-105"
              onClick={() => {
                // Trigger la validazione manualmente per mostrare tutti gli errori
                form.trigger();
              }}
            >
              {initialData ? (
                <>
                  <PencilLine className="mr-2 h-5 w-5" />
                  Aggiorna proprietà
                </>
              ) : (
                <>
                  <Building className="mr-2 h-5 w-5" />
                  Pubblica annuncio
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default PropertyForm;