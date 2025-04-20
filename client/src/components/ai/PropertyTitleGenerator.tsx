import React, { useState } from "react";
import { useAITitleGeneration, PropertyAttributes } from "@/hooks/use-ai-generation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";

interface PropertyTitleGeneratorProps {
  property: PropertyAttributes;
  onTitleSelected?: (title: string) => void;
  className?: string;
}

const PropertyTitleGenerator: React.FC<PropertyTitleGeneratorProps> = ({
  property,
  onTitleSelected,
  className,
}) => {
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const titleMutation = useAITitleGeneration();

  const handleGenerateTitles = async () => {
    try {
      const suggestions = await titleMutation.mutateAsync(property);
      setTitleSuggestions(suggestions);
      // Reset selection when generating new titles
      setSelectedTitle("");
    } catch (error) {
      console.error("Errore nella generazione dei titoli:", error);
    }
  };

  const handleTitleSelection = (value: string) => {
    setSelectedTitle(value);
  };

  const handleUseTitle = () => {
    if (onTitleSelected && selectedTitle) {
      onTitleSelected(selectedTitle);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Suggerimenti Titolo AI</CardTitle>
        <CardDescription>
          Genera automaticamente titoli accattivanti per il tuo annuncio
        </CardDescription>
      </CardHeader>
      <CardContent>
        {titleSuggestions.length > 0 ? (
          <div className="space-y-4">
            <Label>Seleziona un titolo</Label>
            <RadioGroup
              value={selectedTitle}
              onValueChange={handleTitleSelection}
              className="space-y-2"
            >
              {titleSuggestions.map((title, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 border rounded-md">
                  <RadioGroupItem value={title} id={`title-${index}`} />
                  <Label htmlFor={`title-${index}`} className="flex-1 cursor-pointer font-medium">
                    {title}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ) : (
          <div className="text-center p-6 bg-muted/50 rounded-md">
            <p className="text-muted-foreground mb-2">
              Clicca il pulsante qui sotto per generare automaticamente suggerimenti di titoli per il tuo annuncio.
            </p>
            <p className="text-xs text-muted-foreground">
              I titoli saranno basati sulle informazioni fornite sull'immobile.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleGenerateTitles}
          disabled={titleMutation.isPending}
        >
          {titleMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generazione...
            </>
          ) : (
            titleSuggestions.length > 0 ? "Rigenera" : "Genera Titoli"
          )}
        </Button>
        {titleSuggestions.length > 0 && onTitleSelected && (
          <Button 
            onClick={handleUseTitle}
            disabled={!selectedTitle}
          >
            Usa Questo Titolo
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PropertyTitleGenerator;