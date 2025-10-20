import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCurrency } from '@/hooks/useCurrency'
import { formatCurrency } from '@/lib/currency'

interface BudgetCardProps {
  category: string;
  spent: number;
  limit: number;
}

export function BudgetCard({ category, spent, limit }: BudgetCardProps) {
  const { currency } = useCurrency()
  const percentage = (spent / limit) * 100;
  const remaining = limit - spent;
  const isOverBudget = spent > limit;

  return (
    <Card className="border-border bg-card hover:bg-card/80 transition-smooth">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{category}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(spent, currency)} of {formatCurrency(limit, currency)}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`text-lg font-semibold ${
                  isOverBudget ? "text-destructive" : "text-success"
                }`}
              >
                {formatCurrency(Math.abs(remaining), currency)}
              </p>
              <p className="text-xs text-muted-foreground">
                {isOverBudget ? "over budget" : "remaining"}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Progress
              value={Math.min(percentage, 100)}
              className={`h-2 ${isOverBudget ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"}`}
            />
            <p className="text-xs text-muted-foreground text-right">{percentage.toFixed(1)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
