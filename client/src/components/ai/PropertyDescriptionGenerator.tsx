import React, { useState } from "react";
import { useAIDescriptionGeneration, PropertyAttributes } from "@/hooks/use-ai-generation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface PropertyDescriptionGeneratorProps {
  property: PropertyAttributes;
  onDescriptionGenerated?: (description: string) => void;
  className?: string;
}

const PropertyDescriptionGenerator: React.FC<PropertyDescriptionGeneratorProps> = ({
  property,
  onDescriptionGenerated,
  className,
}) => {
  const [generatedDescription, setGeneratedDescription] = useState<string>("");
  const descriptionMutation = useAIDescriptionGeneration();

  const handleGenerateDescription = async () => {
    try {
      const description = await descriptionMutation.mutateAsync(property);
      setGeneratedDescription(description);
      if (onDescriptionGenerated) {
        onDescriptionGenerated(description);
      }
    } catch (error) {
      console.error("Errore nella generazione della descrizione:", error);
    }
  };

  const handleUseDescription = () => {
    if (onDescriptionGenerated && generatedDescription) {
      onDescriptionGenerated(generatedDescription);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Generazione Descrizione AI</CardTitle>
        <CardDescription>
          Genera automaticamente una descrizione professionale e accattivante per il tuo annuncio
        </CardDescription>
      </CardHeader>
      <CardContent>
        {generatedDescription ? (
          <div className="space-y-4">
            <Label htmlFor="generated-description">Descrizione Generata</Label>
            <Textarea
              id="generated-description"
              value={generatedDescription}
              onChange={(e) => setGeneratedDescription(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
        ) : (
          <div className="text-center p-6 bg-muted/50 rounded-md">
            <p className="text-muted-foreground mb-2">
              Clicca il pulsante qui sotto per generare automaticamente una descrizione professionale per il tuo annuncio.
            </p>
            <p className="text-xs text-muted-foreground">
              La descrizione sarà basata sulle informazioni fornite sull'immobile.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleGenerateDescription}
          disabled={descriptionMutation.isPending}
        >
          {descriptionMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generazione...
            </>
          ) : (
            generatedDescription ? "Rigenera" : "Genera Descrizione"
          )}
        </Button>
        {generatedDescription && onDescriptionGenerated && (
          <Button onClick={handleUseDescription}>Usa Questa Descrizione</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PropertyDescriptionGenerator;