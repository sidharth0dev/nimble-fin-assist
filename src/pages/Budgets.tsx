import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BudgetCard } from "@/components/BudgetCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const categories = [
  "Food & Dining",
  "Shopping",
  "Transportation",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Other",
];

// Mock budget data
const initialBudgets = [
  { id: "1", category: "Food & Dining", spent: 450, limit: 600 },
  { id: "2", category: "Shopping", spent: 320, limit: 400 },
  { id: "3", category: "Transportation", spent: 180, limit: 200 },
  { id: "4", category: "Bills & Utilities", spent: 680, limit: 700 },
];

export default function Budgets() {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [newCategory, setNewCategory] = useState("");
  const [newLimit, setNewLimit] = useState("");

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategory || !newLimit) {
      toast.error("Please fill in all fields");
      return;
    }

    const limit = parseFloat(newLimit);
    if (isNaN(limit) || limit <= 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }

    const newBudget = {
      id: Date.now().toString(),
      category: newCategory,
      spent: 0,
      limit,
    };

    setBudgets([...budgets, newBudget]);
    toast.success("Budget created successfully");
    
    setNewCategory("");
    setNewLimit("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Budgets</h1>
          <p className="text-muted-foreground mt-1">Track your spending against your budget limits.</p>
        </div>

        {/* Create Budget */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddBudget} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="limit">Budget Limit</Label>
                <Input
                  id="limit"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="bg-input border-border"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full sm:w-auto">
                  Create Budget
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Active Budgets */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Active Budgets</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                category={budget.category}
                spent={budget.spent}
                limit={budget.limit}
              />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
