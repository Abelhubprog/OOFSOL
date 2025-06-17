import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function OOFCounter() {
  const [count, setCount] = useState(1337420);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 10) + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-purple-800/50 border-purple-700 glass-card max-w-md mx-auto">
      <CardContent className="p-6 text-center">
        <div className="text-sm text-purple-300 mb-2">Global OOF Moments</div>
        <div className="text-4xl font-bold text-yellow-400 animate-pulse-slow">
          {count.toLocaleString()}
        </div>
        <div className="text-sm text-purple-400">And counting...</div>
        <div className="mt-4 text-xs text-purple-500">
          Updated every few seconds from the multiverse of missed opportunities
        </div>
      </CardContent>
    </Card>
  );
}
