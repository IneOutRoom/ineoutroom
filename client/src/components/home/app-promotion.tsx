import { Button } from '@/components/ui/button';
import { AppleIcon } from 'lucide-react';
import { logoTransparentPath } from '@/assets';

export function AppPromotion() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary to-primary-dark text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h2 className="font-montserrat font-bold text-2xl md:text-3xl mb-4">Porta In&Out sempre con te</h2>
            <p className="mb-6 text-white text-opacity-90">Scarica la nostra app mobile per cercare e gestire i tuoi annunci ovunque tu sia. Disponibile per iOS e Android.</p>
            
            <div className="flex flex-wrap gap-5">
              <Button 
                variant="outline" 
                className="group flex items-center bg-black text-white rounded-lg hover:bg-black/90 border border-white/20 shadow-lg px-5 py-6 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="relative w-10 h-10 mr-3 flex items-center justify-center bg-white rounded-full">
                  <AppleIcon className="w-7 h-7 text-black group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <div className="text-xs text-white/80 group-hover:text-white/100 transition-colors">Scarica su</div>
                  <div className="font-semibold text-lg">App Store</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="group flex items-center bg-black text-white rounded-lg hover:bg-black/90 border border-white/20 shadow-lg px-5 py-6 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="relative w-10 h-10 mr-3 flex items-center justify-center bg-white rounded-full">
                  <svg className="w-6 h-6 text-black group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.609 22.186C3.192 21.768 3 21.232 3 20.483V3.517C3 2.768 3.192 2.232 3.609 1.814zM14.523 12.75L16.75 14.977L5.904 20.186C5.44 20.64 4.7 20.864 3.997 20.864L14.523 12.75zM16.75 9.023L14.523 11.25L3.997 3.137C4.675 3.113 5.42 3.342 5.904 3.814L16.75 9.023zM17.75 10.13L20.65 11.75C21.45 12.21 21.45 13.39 20.65 13.85L17.75 15.47L15.25 12.99L17.75 10.13z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-white/80 group-hover:text-white/100 transition-colors">Scarica su</div>
                  <div className="font-semibold text-lg">Google Play</div>
                </div>
              </Button>
            </div>
          </div>
          
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative">
              {/* Logo image */}
              <div className="w-80 h-auto relative z-10">
                <img 
                  src={logoTransparentPath} 
                  alt="Logo In&Out" 
                  className="w-full h-auto rounded-3xl shadow-2xl"
                />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-red-500 opacity-20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute top-20 -right-12 w-32 h-32 bg-primary-light opacity-30 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
