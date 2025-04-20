import { useState } from "react";
import { 
  FaFacebookF, 
  FaTwitter, 
  FaWhatsapp, 
  FaLinkedinIn 
} from "react-icons/fa";
import { FiShare2, FiCheck } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

interface SocialShareProps {
  url?: string;
  title?: string;
  className?: string;
  compact?: boolean;
}

export function SocialShare({ 
  url = window.location.href, 
  title = "Condividi questo annuncio su In&Out!", 
  className = "", 
  compact = false 
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast({
        title: "Link copiato!",
        description: "Il link è stato copiato negli appunti.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "width=600,height=400");
  };
  
  if (compact) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-primary hover:bg-primary/10 rounded-full p-2"
          onClick={() => openShareWindow(shareLinks.facebook)}
        >
          <FaFacebookF className="h-4 w-4" />
          <span className="sr-only">Condividi su Facebook</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-primary hover:bg-primary/10 rounded-full p-2"
          onClick={() => openShareWindow(shareLinks.twitter)}
        >
          <FaTwitter className="h-4 w-4" />
          <span className="sr-only">Condividi su Twitter</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-primary hover:bg-primary/10 rounded-full p-2"
          onClick={copyToClipboard}
        >
          {copied ? <FiCheck className="h-4 w-4" /> : <FiShare2 className="h-4 w-4" />}
          <span className="sr-only">Copia link</span>
        </Button>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="bg-[#1877f2] hover:bg-[#1877f2]/90 text-white rounded-md"
              onClick={() => openShareWindow(shareLinks.facebook)}
            >
              <FaFacebookF className="h-4 w-4" />
              <span className="sr-only">Condividi su Facebook</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Condividi su Facebook</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="bg-[#1da1f2] hover:bg-[#1da1f2]/90 text-white rounded-md"
              onClick={() => openShareWindow(shareLinks.twitter)}
            >
              <FaTwitter className="h-4 w-4" />
              <span className="sr-only">Condividi su Twitter</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Condividi su Twitter</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="bg-[#25d366] hover:bg-[#25d366]/90 text-white rounded-md"
              onClick={() => openShareWindow(shareLinks.whatsapp)}
            >
              <FaWhatsapp className="h-4 w-4" />
              <span className="sr-only">Condividi su WhatsApp</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Condividi su WhatsApp</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="bg-[#0077b5] hover:bg-[#0077b5]/90 text-white rounded-md"
              onClick={() => openShareWindow(shareLinks.linkedin)}
            >
              <FaLinkedinIn className="h-4 w-4" />
              <span className="sr-only">Condividi su LinkedIn</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Condividi su LinkedIn</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className={`${copied ? 'bg-green-600' : 'bg-gray-600'} hover:bg-gray-700 text-white rounded-md`}
              onClick={copyToClipboard}
            >
              {copied ? <FiCheck className="h-4 w-4" /> : <FiShare2 className="h-4 w-4" />}
              <span className="sr-only">Copia link</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copia link</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}