import { WifiOff, Satellite, AlertCircle } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-800 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#FF5F02] rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF5F02] rounded-full blur-[120px] animate-pulse animation-delay-700"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto space-y-8 animate-fade-in">
        {/* Icon with glow effect */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-[#FF5F02] rounded-full blur-2xl opacity-40 animate-pulse"></div>
            <div className="relative bg-linear-to-br from-gray-800 to-black p-8 rounded-full border-2 border-[#FF5F02]/30 shadow-2xl">
              <Satellite className="h-20 w-20 text-[#FF5F02] animate-bounce-slow" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-[#FF5F02] via-[#FF8534] to-[#FF5F02] bg-clip-text text-transparent animate-shimmer">
            You're Offline
          </h1>
          <div className="flex items-center justify-center gap-2 text-[#FF5F02]/80">
            <AlertCircle className="h-5 w-5" />
            <p className="text-lg md:text-xl font-medium">
              No Internet Connection
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="max-w-md mx-auto space-y-4">
          <p className="text-gray-400 text-base md:text-lg leading-relaxed">
            Please check your internet connection and try again.
          </p>
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="h-5 w-5 text-[#FF5F02]/60" />
            <span className="text-sm text-gray-500">
              Connection lost
            </span>
          </div>
        </div>

        {/* Decorative dots */}
        <div className="flex justify-center gap-2 pt-8">
          <div className="w-2 h-2 rounded-full bg-[#FF5F02] animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-[#FF5F02] animate-pulse animation-delay-200"></div>
          <div className="w-2 h-2 rounded-full bg-[#FF5F02] animate-pulse animation-delay-400"></div>
        </div>
      </div>
    </div>
  );
}
