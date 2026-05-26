'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const PixModal = dynamic(() => import('./PixModal'), { ssr: false });

interface Props {
  user: { id: string } | null;
  }
  
  export default function PremiumButtons({ user }: Props) {
    const [showPix, setShowPix] = useState(false);
      const router = useRouter();
      
        if (!user) {
            return (
                  <a
                          href="/login"
                                  className="block w-full text-center bg-brand-green text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors"
                                        >
                                                Criar conta e assinar
                                                      </a>
                                                          );
                                                            }
                                                            
                                                              return (
                                                                  <div className="flex flex-col gap-3">
                                                                        <button
                                                                                onClick={() => setShowPix(true)}
                                                                                        className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors"
                                                                                              >
                                                                                                      Pagar com Pix — R$29,90
                                                                                                            </button>
                                                                                                            
                                                                                                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                                                                                                          <div className="flex-1 h-px bg-gray-200" />
                                                                                                                                  <span>ou</span>
                                                                                                                                          <div className="flex-1 h-px bg-gray-200" />
                                                                                                                                                </div>
                                                                                                                                                
                                                                                                                                                      <form action="/api/pagamentos/checkout" method="POST">
                                                                                                                                                              <input type="hidden" name="plano" value="premium" />
                                                                                                                                                                      <button
                                                                                                                                                                                type="submit"
                                                                                                                                                                                          className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-900 transition-colors text-sm"
                                                                                                                                                                                                  >
                                                                                                                                                                                                            Assinar com Cartao — R$29,90/mes
                                                                                                                                                                                                                    </button>
                                                                                                                                                                                                                          </form>
                                                                                                                                                                                                                          
                                                                                                                                                                                                                                <p className="text-xs text-center text-gray-400">
                                                                                                                                                                                                                                        Pix: 30 dias de acesso. Cartao: renovacao automatica mensal.
                                                                                                                                                                                                                                              </p>
                                                                                                                                                                                                                                              
                                                                                                                                                                                                                                                    {showPix && (
                                                                                                                                                                                                                                                            <PixModal
                                                                                                                                                                                                                                                                      onClose={() => setShowPix(false)}
                                                                                                                                                                                                                                                                                onPaid={() => {
                                                                                                                                                                                                                                                                                            setShowPix(false);
                                                                                                                                                                                                                                                                                                        router.refresh();
                                                                                                                                                                                                                                                                                                                  }}
                                                                                                                                                                                                                                                                                                                          />
                                                                                                                                                                                                                                                                                                                                )}
                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                      );
                                                                                                                                                                                                                                                                                                                                }