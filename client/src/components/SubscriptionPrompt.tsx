import React from "react";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface SubscriptionPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscriptionPrompt({ isOpen, onClose }: SubscriptionPromptProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-[#6a0dad]">
            Prima inserzione gratuita già utilizzata
          </DialogTitle>
          <DialogDescription className="text-center">
            Hai già pubblicato la tua inserzione gratuita. Per continuare a pubblicare, è necessario acquistare un piano.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 my-4">
          <h3 className="font-bold text-lg flex items-center">
            <div className="bg-[#6a0dad] text-white p-1 rounded-full mr-2">
              <Check className="h-4 w-4" />
            </div>
            5 Inserzioni - Solo €0,99
          </h3>
          <p className="text-sm text-neutral-600 mt-2">
            Pubblica fino a 5 inserzioni con un pagamento una tantum di soli €0,99. Perfetto per chi ha poche proprietà da gestire.
          </p>
          <ul className="mt-4 space-y-2">
            <li className="text-sm flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              5 annunci pubblicabili
            </li>
            <li className="text-sm flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              Visibili per 30 giorni
            </li>
            <li className="text-sm flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              Nessun rinnovo automatico
            </li>
          </ul>
        </div>
        
        <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Non ora
          </Button>
          <div className="flex gap-2">
            <Link href="/checkout?plan=5listings">
              <Button 
                className="bg-[#6a0dad] hover:bg-[#6a0dad]/90 shadow-md transition-all transform hover:scale-105"
              >
                Acquista 5 inserzioni
              </Button>
            </Link>
            <Link href="/subscription-plans">
              <Button 
                variant="outline"
                className="border-[#6a0dad] text-[#6a0dad] hover:bg-[#ffcb05]/10"
              >
                Vedi tutti i piani
              </Button>
            </Link>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}