import { WifiOff, Satellite, AlertCircle } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#DDDDDD] dark:bg-[#000000] px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-white dark:bg-[#262626] p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-[#FF5F02]/10 blur-xl" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-black/5 dark:bg-white/5">
                  <Satellite className="h-7 w-7 text-[#262626] dark:text-white" />
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#262626] dark:text-white">
                You're Offline
              </h1>
              <p className="mt-1 text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200">
                Please check your internet connection and try again.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-black/5 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200">
                  <AlertCircle className="h-4 w-4" />
                  No Internet Connection
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-black/5 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200">
                  <WifiOff className="h-4 w-4" />
                  Connection lost
                </span>
              </div>

              <div className="mt-6 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-black/5 dark:bg-white/5 p-4">
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  Tip: If you're using mobile data, try toggling Airplane Mode off/on, then return to the app.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
