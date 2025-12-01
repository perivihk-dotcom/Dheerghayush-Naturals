import React, { useEffect, useState } from 'react';
import { Check, Package, Truck, CreditCard } from 'lucide-react';

const OrderSuccessAnimation = ({ onComplete, paymentMethod = 'COD' }) => {
  const [stage, setStage] = useState(0);
  const isPaid = paymentMethod === 'RAZORPAY';

  useEffect(() => {
    // Stage 0: Initial (checkmark appears)
    // Stage 1: Package icon (after 1s)
    // Stage 2: Truck icon (after 2s)
    // Complete after 3s
    const timer1 = setTimeout(() => setStage(1), 1000);
    const timer2 = setTimeout(() => setStage(2), 2000);
    const timer3 = setTimeout(() => onComplete(), 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center">
        {/* Animated Circle with Checkmark */}
        <div className="relative mx-auto mb-8">
          {/* Outer pulse ring */}
          <div className={`absolute inset-0 w-32 h-32 mx-auto rounded-full ${isPaid ? 'bg-blue-500/20' : 'bg-[#2d6d4c]/20'} animate-ping`} />
          
          {/* Main circle */}
          <div className={`relative w-32 h-32 mx-auto rounded-full ${isPaid ? 'bg-blue-600' : 'bg-[#2d6d4c]'} flex items-center justify-center animate-scale-in`}>
            {stage === 0 && (
              isPaid ? <CreditCard className="w-16 h-16 text-white animate-bounce-in" /> : <Check className="w-16 h-16 text-white animate-draw-check" strokeWidth={3} />
            )}
            {stage === 1 && (
              <Package className="w-16 h-16 text-white animate-bounce-in" />
            )}
            {stage === 2 && (
              <Truck className="w-16 h-16 text-white animate-slide-right" />
            )}
          </div>
        </div>

        {/* Text */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2 animate-fade-in">
          {stage === 0 && (isPaid ? "Payment Successful!" : "Order Placed!")}
          {stage === 1 && "Packing Your Order..."}
          {stage === 2 && "On Its Way Soon!"}
        </h2>
        <p className="text-gray-600 animate-fade-in-delay">
          {stage === 0 && (isPaid ? "Your payment has been confirmed" : "Thank you for your order")}
          {stage === 1 && "We're preparing your items"}
          {stage === 2 && (isPaid ? "Track your order anytime" : "Pay on delivery")}
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${stage >= 0 ? 'bg-[#2d6d4c] scale-100' : 'bg-gray-300 scale-75'}`} />
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${stage >= 1 ? 'bg-[#2d6d4c] scale-100' : 'bg-gray-300 scale-75'}`} />
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${stage >= 2 ? 'bg-[#2d6d4c] scale-100' : 'bg-gray-300 scale-75'}`} />
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes draw-check {
          0% { stroke-dashoffset: 100; opacity: 0; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        @keyframes slide-right {
          0% { transform: translateX(-20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-scale-in { animation: scale-in 0.5s ease-out forwards; }
        .animate-draw-check { animation: draw-check 0.5s ease-out 0.3s forwards; }
        .animate-bounce-in { animation: bounce-in 0.5s ease-out forwards; }
        .animate-slide-right { animation: slide-right 0.4s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .animate-fade-in-delay { animation: fade-in 0.4s ease-out 0.2s forwards; opacity: 0; }
      `}</style>
    </div>
  );
};

export default OrderSuccessAnimation;
