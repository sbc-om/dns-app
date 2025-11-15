import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-muted p-4">
              <WifiOff className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">You're Offline</CardTitle>
          <CardDescription>
            No internet connection available
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Please check your internet connection and try again.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
