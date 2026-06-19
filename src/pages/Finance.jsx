import React, { useState, useMemo } from "react";
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, Calendar,
  Plus, Search, Filter, Trash2, CheckCircle2, FileText,
  Percent, ArrowRight, Lightbulb
} from "lucide-react";
import { formatDate } from "../utils.js";

const FINANCIAL_TIPS = [
  { icon: "💡", tip: "Track every single expense. Awareness is the first step to financial discipline." },
  { icon: "🛡️", tip: "Aim to save at least 20% of your allowance or income for emergency savings." },
  { icon: "📚", tip: "Invest in yourself first. Buying coding books, courses, or certifications yields the highest return." },
  { icon: "🛍️", tip: "Wait 48 hours before making any non-essential purchase to curb impulse spending." },
  { icon: "🎯", tip: "Set up a monthly budget and stick to it. Discipline is choosing what you want most over what you want now." },
];

export default function Finance({ state, setState, onNav, onXP }) {
  const finance = state?.finance || { income: [], expenses: [], budget: 0, categories: [] };
  const [incSource, setIncSource] = useState("");
  const [incAmount, setIncAmount] = useState("");
  const [incDate, setIncDate] = useState(new Date().toISOString().slice(0, 10));

  const [expDesc, setExpDesc] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] = useState("Food");
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));

  const [newBudget, setNewBudget] = useState(finance.budget || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all, income, expense
  const [catFilter, setCatFilter] = useState("all");

  const categories = finance.categories && finance.categories.length > 0
    ? finance.categories
    : ["Food", "Transport", "Books", "Entertainment", "Utilities", "Other"];

  // Calculations
  const totalIncome = useMemo(() => {
    return (finance.income || []).reduce((s, i) => s + parseFloat(i.amount || 0), 0);
  }, [finance.income]);

  const totalExpense = useMemo(() => {
    return (finance.expenses || []).reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  }, [finance.expenses]);

  const savings = totalIncome - totalExpense;
  const budgetRemaining = (finance.budget || 0) - totalExpense;

  // Grouped category expenses
  const categoryExpenses = useMemo(() => {
    const map = {};
    categories.forEach(c => { map[c] = 0; });
    (finance.expenses || []).forEach(e => {
      const c = e.category || "Other";
      map[c] = (map[c] || 0) + parseFloat(e.amount || 0);
    });
    return map;
  }, [finance.expenses, categories]);

  // Combined sorted transactions log
  const transactions = useMemo(() => {
    const list = [];
    (finance.income || []).forEach(i => {
      list.push({ ...i, type: "income", id: i.id || `inc-${Date.now()}-${Math.random()}` });
    });
    (finance.expenses || []).forEach(e => {
      list.push({ ...e, type: "expense", id: e.id || `exp-${Date.now()}-${Math.random()}` });
    });
    // Sort reverse chronological
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [finance.income, finance.expenses]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.type === "income"
        ? (t.source || "").toLowerCase().includes(searchTerm.toLowerCase())
        : (t.description || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "all" || t.type === typeFilter;
      const matchesCategory = catFilter === "all" || (t.type === "expense" && t.category === catFilter);

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchTerm, typeFilter, catFilter]);

  const handleUpdateBudget = (e) => {
    e.preventDefault();
    const budgetVal = parseFloat(newBudget) || 0;
    setState(prev => ({
      ...prev,
      finance: {
        ...prev.finance,
        budget: budgetVal
      }
    }));
    onXP(10, "Updated Monthly Budget");
  };

  const handleAddIncome = (e) => {
    e.preventDefault();
    if (!incSource || !incAmount) return;
    const amountVal = parseFloat(incAmount) || 0;
    const newItem = {
      id: `inc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      source: incSource,
      amount: amountVal,
      date: incDate
    };

    setState(prev => {
      const currentIncome = prev.finance?.income || [];
      return {
        ...prev,
        finance: {
          ...prev.finance,
          income: [...currentIncome, newItem]
        }
      };
    });

    setIncSource("");
    setIncAmount("");
    onXP(15, `Log Income: ${incSource}`);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expDesc || !expAmount) return;
    const amountVal = parseFloat(expAmount) || 0;
    const newItem = {
      id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      description: expDesc,
      amount: amountVal,
      category: expCategory,
      date: expDate
    };

    setState(prev => {
      const currentExpenses = prev.finance?.expenses || [];
      return {
        ...prev,
        finance: {
          ...prev.finance,
          expenses: [...currentExpenses, newItem]
        }
      };
    });

    setExpDesc("");
    setExpAmount("");
    onXP(15, `Log Expense: ${expDesc}`);
  };

  const handleDeleteTransaction = (type, id) => {
    setState(prev => {
      const groupKey = type === "income" ? "income" : "expenses";
      const list = prev.finance?.[groupKey] || [];
      return {
        ...prev,
        finance: {
          ...prev.finance,
          [groupKey]: list.filter(item => item.id !== id)
        }
      };
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "4px" }}>
      
      {/* Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        
        <div className="glass-card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "12px", background: "var(--indigo-dim)", borderRadius: "12px" }}>
            <Wallet size={24} color="var(--indigo)" />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 600 }}>MONTHLY BUDGET</div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text)", marginTop: "4px" }}>
              ₹{(finance.budget || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px" }}>Limit set</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "12px", background: "var(--cyan-dim)", borderRadius: "12px" }}>
            <TrendingUp size={24} color="var(--cyan)" />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 600 }}>TOTAL INCOME</div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--cyan)", marginTop: "4px" }}>
              ₹{totalIncome.toLocaleString()}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px" }}>Earned / Allowance</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "12px", background: "var(--rose-dim)", borderRadius: "12px" }}>
            <TrendingDown size={24} color="var(--rose)" />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 600 }}>TOTAL EXPENSES</div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--rose)", marginTop: "4px" }}>
              ₹{totalExpense.toLocaleString()}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px" }}>Spent so far</div>
          </div>
        </div>

        <div className="glass-card" style={{
          padding: "24px", display: "flex", alignItems: "center", gap: "16px",
          borderColor: budgetRemaining >= 0 ? "var(--border)" : "rgba(244,63,94,0.3)"
        }}>
          <div style={{
            padding: "12px",
            background: budgetRemaining >= 0 ? "var(--emerald-dim)" : "var(--rose-dim)",
            borderRadius: "12px"
          }}>
            <PiggyBank size={24} color={budgetRemaining >= 0 ? "var(--emerald)" : "var(--rose)"} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 600 }}>BUDGET REMAINING</div>
            <div style={{
              fontSize: "24px", fontWeight: 800,
              color: budgetRemaining >= 0 ? "var(--emerald)" : "var(--rose)",
              marginTop: "4px"
            }}>
              ₹{budgetRemaining.toLocaleString()}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px" }}>
              {budgetRemaining >= 0 ? "Under budget ✓" : "Over budget ✗"}
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Forms & Category breakdown */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
        
        {/* Card 1: Add Transaction & Set Budget */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Monthly Budget Form */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-head)", fontSize: "18px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Wallet size={16} color="var(--indigo)" /> Set Budget
            </h2>
            <form onSubmit={handleUpdateBudget} style={{ display: "flex", gap: "10px" }}>
              <input
                type="number"
                value={newBudget}
                onChange={e => setNewBudget(e.target.value)}
                placeholder="Monthly budget limit (₹)"
                style={{
                  flex: 1, background: "var(--bg-2)", border: "1px solid var(--border)",
                  borderRadius: "var(--r-md)", padding: "10px 14px", color: "var(--text)"
                }}
              />
              <button type="submit" className="primary-btn">Set</button>
            </form>
          </div>

          {/* Add Income Form */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-head)", fontSize: "18px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", color: "var(--cyan)" }}>
              <TrendingUp size={16} color="var(--cyan)" /> Add Income
            </h2>
            <form onSubmit={handleAddIncome} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="text"
                value={incSource}
                onChange={e => setIncSource(e.target.value)}
                placeholder="Source (e.g. Allowance, Freelance)"
                style={{
                  background: "var(--bg-2)", border: "1px solid var(--border)",
                  borderRadius: "var(--r-md)", padding: "10px 14px", color: "var(--text)"
                }}
                required
              />
              <input
                type="number"
                value={incAmount}
                onChange={e => setIncAmount(e.target.value)}
                placeholder="Amount (₹)"
                style={{
                  background: "var(--bg-2)", border: "1px solid var(--border)",
                  borderRadius: "var(--r-md)", padding: "10px 14px", color: "var(--text)"
                }}
                required
              />
              <input
                type="date"
                value={incDate}
                onChange={e => setIncDate(e.target.value)}
                style={{
                  background: "var(--bg-2)", border: "1px solid var(--border)",
                  borderRadius: "var(--r-md)", padding: "10px 14px", color: "var(--text)"
                }}
              />
              <button type="submit" className="primary-btn" style={{ justifyContent: "center", background: "var(--cyan-dim)", borderColor: "var(--cyan)" }}>
                <Plus size={16} /> Add Income
              </button>
            </form>
          </div>

        </div>

        {/* Card 2: Add Expense Form */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: "18px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", color: "var(--rose)" }}>
            <TrendingDown size={16} color="var(--rose)" /> Add Expense
          </h2>
          <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="text"
              value={expDesc}
              onChange={e => setExpDesc(e.target.value)}
              placeholder="Description (e.g. Books, Lunch)"
              style={{
                background: "var(--bg-2)", border: "1px solid var(--border)",
                borderRadius: "var(--r-md)", padding: "10px 14px", color: "var(--text)"
              }}
              required
            />
            <input
              type="number"
              value={expAmount}
              onChange={e => setExpAmount(e.target.value)}
              placeholder="Amount (₹)"
              style={{
                background: "var(--bg-2)", border: "1px solid var(--border)",
                borderRadius: "var(--r-md)", padding: "10px 14px", color: "var(--text)"
              }}
              required
            />
            <select
              value={expCategory}
              onChange={e => setExpCategory(e.target.value)}
              style={{
                background: "var(--bg-2)", border: "1px solid var(--border)",
                borderRadius: "var(--r-md)", padding: "10px 14px", color: "var(--text)"
              }}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="date"
              value={expDate}
              onChange={e => setExpDate(e.target.value)}
              style={{
                background: "var(--bg-2)", border: "1px solid var(--border)",
                borderRadius: "var(--r-md)", padding: "10px 14px", color: "var(--text)"
              }}
            />
            <button type="submit" className="primary-btn" style={{ justifyContent: "center", background: "var(--rose-dim)", borderColor: "var(--rose)" }}>
              <Plus size={16} /> Add Expense
            </button>
          </form>
        </div>

        {/* Card 3: Expense Category Breakdown & Tips */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div className="glass-card" style={{ padding: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-head)", fontSize: "18px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Percent size={16} color="var(--purple)" /> Category Breakdown
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {categories.map(cat => {
                const amount = categoryExpenses[cat] || 0;
                const ratio = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
                return (
                  <div key={cat}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                      <span style={{ color: "var(--text-2)" }}>{cat}</span>
                      <span style={{ fontWeight: 700, color: "var(--text)" }}>₹{amount} ({ratio.toFixed(0)}%)</span>
                    </div>
                    <div style={{ height: "6px", background: "var(--bg-3)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${ratio}%`, background: "var(--purple)", borderRadius: "3px" }} />
                    </div>
                  </div>
                );
              })}
              {totalExpense === 0 && (
                <div style={{ color: "var(--text-3)", textAlign: "center", padding: "10px 0", fontSize: "13px" }}>
                  No expenses logged yet.
                </div>
              )}
            </div>
          </div>

          <div className="glass-card" style={{ padding: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-head)", fontSize: "18px", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Lightbulb size={16} color="var(--amber)" /> Financial Tips
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {FINANCIAL_TIPS.map((t, idx) => (
                <div key={idx} style={{ display: "flex", gap: "10px", fontSize: "12px", lineHeight: "1.5" }}>
                  <span>{t.icon}</span>
                  <span style={{ color: "var(--text-2)" }}>{t.tip}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Transaction Log */}
      <div className="glass-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: "20px", fontWeight: 700 }}>Transaction History</h2>
          
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  background: "var(--bg-2)", border: "1px solid var(--border)",
                  borderRadius: "var(--r-md)", padding: "6px 12px 6px 30px", color: "var(--text)",
                  fontSize: "12px"
                }}
              />
            </div>
            
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              style={{
                background: "var(--bg-2)", border: "1px solid var(--border)",
                borderRadius: "var(--r-md)", padding: "6px 12px", color: "var(--text)",
                fontSize: "12px"
              }}
            >
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>

            {typeFilter === "expense" && (
              <select
                value={catFilter}
                onChange={e => setCatFilter(e.target.value)}
                style={{
                  background: "var(--bg-2)", border: "1px solid var(--border)",
                  borderRadius: "var(--r-md)", padding: "6px 12px", color: "var(--text)",
                  fontSize: "12px"
                }}
              >
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* List table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-3)", fontWeight: 600 }}>
                <th style={{ padding: "12px" }}>Date</th>
                <th style={{ padding: "12px" }}>Description / Source</th>
                <th style={{ padding: "12px" }}>Type</th>
                <th style={{ padding: "12px" }}>Category</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Amount</th>
                <th style={{ padding: "12px", width: "40px" }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "background 0.2s" }} className="hover-row">
                  <td style={{ padding: "12px", color: "var(--text-2)" }}>{formatDate(t.date)}</td>
                  <td style={{ padding: "12px", fontWeight: 600, color: "var(--text)" }}>
                    {t.type === "income" ? t.source : t.description}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span className={`chip chip-${t.type === "income" ? "cyan" : "rose"}`} style={{ textTransform: "capitalize" }}>
                      {t.type}
                    </span>
                  </td>
                  <td style={{ padding: "12px", color: "var(--text-2)" }}>
                    {t.type === "expense" ? t.category : "-"}
                  </td>
                  <td style={{
                    padding: "12px", textAlign: "right", fontWeight: 700,
                    color: t.type === "income" ? "var(--cyan)" : "var(--rose)"
                  }}>
                    {t.type === "income" ? "+" : "-"} ₹{t.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <button
                      onClick={() => handleDeleteTransaction(t.type, t.id)}
                      className="icon-btn"
                      style={{ color: "var(--text-3)", hover: { color: "var(--rose)" } }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: "30px", textAlign: "center", color: "var(--text-3)" }}>
                    No transactions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
