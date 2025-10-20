import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ArrowUpRight, ArrowDownRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock transactions data
const allTransactions = [
  {
    id: "1",
    description: "Grocery Store",
    amount: -85.5,
    category: "Food & Dining",
    date: "Oct 14, 2025",
    type: "expense" as const,
  },
  {
    id: "2",
    description: "Salary Deposit",
    amount: 3500,
    category: "Income",
    date: "Oct 13, 2025",
    type: "income" as const,
  },
  {
    id: "3",
    description: "Electric Bill",
    amount: -120,
    category: "Bills & Utilities",
    date: "Oct 12, 2025",
    type: "expense" as const,
  },
  {
    id: "4",
    description: "Coffee Shop",
    amount: -12.5,
    category: "Food & Dining",
    date: "Oct 11, 2025",
    type: "expense" as const,
  },
  {
    id: "5",
    description: "Gas Station",
    amount: -45,
    category: "Transportation",
    date: "Oct 10, 2025",
    type: "expense" as const,
  },
  {
    id: "6",
    description: "Online Shopping",
    amount: -89.99,
    category: "Shopping",
    date: "Oct 9, 2025",
    type: "expense" as const,
  },
  {
    id: "7",
    description: "Movie Tickets",
    amount: -28,
    category: "Entertainment",
    date: "Oct 8, 2025",
    type: "expense" as const,
  },
  {
    id: "8",
    description: "Freelance Payment",
    amount: 450,
    category: "Income",
    date: "Oct 7, 2025",
    type: "income" as const,
  },
];

export default function Transactions() {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = allTransactions.filter((transaction) =>
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground mt-1">View and manage all your transactions.</p>
          </div>
          <Button onClick={() => setIsAddTransactionOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No transactions found.</p>
              </CardContent>
            </Card>
          ) : (
            filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="border-border bg-card hover:bg-card/80 transition-smooth">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          transaction.type === "income"
                            ? "bg-success/20 text-success"
                            : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <ArrowDownRight className="h-5 w-5" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span className="truncate">{transaction.category}</span>
                          <span>•</span>
                          <span className="flex-shrink-0">{transaction.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p
                        className={`text-lg font-bold ${
                          transaction.type === "income" ? "text-success" : "text-foreground"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}$
                        {Math.abs(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <AddTransactionModal open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen} />
    </DashboardLayout>
  );
}
