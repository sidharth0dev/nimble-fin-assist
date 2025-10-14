import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BalanceCardProps {
  balance: number;
  change: number;
  changePercentage: number;
}

export function BalanceCard({ balance, change, changePercentage }: BalanceCardProps) {
  const isPositive = change >= 0;

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">Current Balance</p>
          <div className="flex items-baseline gap-3">
            <h2 className="text-4xl font-bold text-foreground">${balance.toLocaleString()}</h2>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                isPositive ? "text-success" : "text-destructive"
              }`}
            >
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{changePercentage}%</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {isPositive ? "+" : ""}${Math.abs(change).toLocaleString()} from last month
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
