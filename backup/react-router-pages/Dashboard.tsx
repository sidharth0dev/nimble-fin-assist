import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BalanceCard } from "@/components/BalanceCard";
import { SpendingChart } from "@/components/SpendingChart";
import { RecentTransactions } from "@/components/RecentTransactions";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Mock data
const spendingData = [
  { category: "Food", amount: 450 },
  { category: "Shopping", amount: 320 },
  { category: "Transport", amount: 180 },
  { category: "Entertainment", amount: 220 },
  { category: "Bills", amount: 680 },
];

const recentTransactions = [
  {
    id: "1",
    description: "Grocery Store",
    amount: -85.5,
    category: "Food & Dining",
    date: "Oct 14",
    type: "expense" as const,
  },
  {
    id: "2",
    description: "Salary Deposit",
    amount: 3500,
    category: "Income",
    date: "Oct 13",
    type: "income" as const,
  },
  {
    id: "3",
    description: "Electric Bill",
    amount: -120,
    category: "Bills & Utilities",
    date: "Oct 12",
    type: "expense" as const,
  },
  {
    id: "4",
    description: "Coffee Shop",
    amount: -12.5,
    category: "Food & Dining",
    date: "Oct 11",
    type: "expense" as const,
  },
];

export default function Dashboard() {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's your financial overview.</p>
          </div>
          <Button onClick={() => setIsAddTransactionOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        {/* Balance Card */}
        <BalanceCard balance={8450} change={420} changePercentage={5.2} />

        {/* Charts */}
        <SpendingChart data={spendingData} />

        {/* Recent Transactions */}
        <RecentTransactions transactions={recentTransactions} />
      </div>

      <AddTransactionModal open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen} />
    </DashboardLayout>
  );
}
