
"use client";

import { useEffect, useState } from "react";

type Transaction = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
};

const categories = [
  "Yeme & İçme",
  "Ulaşım",
  "Giyim",
  "Faturalar",
  "Eğlence",
  "Diğer",
];

const incomeCategories = [
  "Maaş",
  "Harçlık",
  "Burs",
  "Freelance",
  "Yatırım",
  "Diğer",
];

const months = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function SummaryCard({
  title,
  amount,
}: {
  title: string;
  amount: number;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-sm text-gray-500">{title}</h2>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {amount.toLocaleString("tr-TR")} TL
      </p>
    </div>
  );
}

export default function Home() {
 

  const [expenseInput, setExpenseInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("Diğer");
  const [transactionType, setTransactionType] =
    useState<"income" | "expense">("expense");
  const [dateInput, setDateInput] = useState(getToday);
  const [selectedMonth, setSelectedMonth] = useState(
    () => getToday().slice(0, 7)
  );

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransactionId, setEditingTransactionId] =
    useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
  try {
    const savedTransactions = localStorage.getItem(
      "finwise-transactions"
    );

    if (savedTransactions !== null) {
      const parsedTransactions = JSON.parse(savedTransactions);

      if (Array.isArray(parsedTransactions)) {
        setTransactions(parsedTransactions);
      }
    }
  } catch (error) {
    console.error("İşlemler yüklenemedi:", error);
  } finally {
    setIsLoaded(true);
  }
}, []);

useEffect(() => {
  if (!isLoaded) {
    return;
  }
   localStorage.setItem(
    "finwise-transactions",
    JSON.stringify(transactions)
  );
}, [transactions, isLoaded]);

const editingTransaction = transactions.find(
  (item) => item.id === editingTransactionId
);



  // Toplam gider ve bakiye hesaplama
  const income = transactions
   .filter((item) => item.type === "income")
   .reduce((sum, item) => sum + item.amount, 0);

  const expense = transactions
   .filter((item) => item.type === "expense")
   .reduce((sum, item) => sum + item.amount, 0);

  const balance = income - expense;
  const selectedYear = Number(dateInput.slice(0, 4));
  const selectedMonthForDate = Number(dateInput.slice(5, 7));

  const daysInMonth = new Date(
    selectedYear,
    selectedMonthForDate,
    0
  ).getDate();

  // Kategorilere göre harcama hesaplama
  const categoryTotals = categories.map((category) => {
    const total = transactions
      .filter(
        (item) =>
          item.type === "expense" &&
          item.category === category
      )
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      category: category,
      total: total,
    };
  });

  // Seçilen aya ait harcamaları bulma
  const monthlyExpenses = transactions.filter(
  (item) =>
    item.type === "expense" &&
    item.date.startsWith(selectedMonth)
  );

  const monthlyIncomes = transactions.filter(
  (item) =>
    item.type === "income" &&
    item.date.startsWith(selectedMonth)
);

const monthlyIncomeTotal = monthlyIncomes.reduce(
  (total, item) => total + item.amount,
  0
);



  // Seçilen ayın toplam harcamasını hesaplama
  const monthlyTotal = monthlyExpenses.reduce(
    (total, item) => total + item.amount,
    0
  );

  const monthlyBalance = monthlyIncomeTotal - monthlyTotal;

  const monthlyCategoryTotals = categories.map((category) => {
  const total = monthlyExpenses
    .filter((item) => item.category === category)
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    category: category,
    total: total,
  };
});

const monthlyIncomeCategoryTotals = incomeCategories.map((category) => {
  const total = monthlyIncomes
    .filter((item) => item.category === category)
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    category: category,
    total: total,
  };
});

  // Yeni harcama ekleme
  function handleAddTransaction() {
  const amount = Number(expenseInput);

  if (
    !expenseInput.trim() ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !descriptionInput.trim() ||
    !dateInput ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateInput) ||
    !Number.isFinite(new Date(`${dateInput}T12:00:00`).getTime())
  ) {
    return;
  }

  const newTransaction: Transaction = {
    id: crypto.randomUUID(),
    description: descriptionInput.trim(),
    amount: amount,
    category: categoryInput,
    date: dateInput,
    type: transactionType,
  };

  setTransactions((previousTransactions) => [
    newTransaction,
    ...previousTransactions,
  ]);

  

  setExpenseInput("");
  setDescriptionInput("");
}

  // Harcama silme
  function handleDeleteTransaction(id: string) {
  setTransactions((previousTransactions) =>
    previousTransactions.filter((item) => item.id !== id)
  );
}
const handleSaveEdit = () => {
  if (editingTransactionId === null) {
    return;
  }

  const amount = Number(editAmount);

if (
  editDescription.trim() === "" ||
  editAmount.trim() === "" ||
  !Number.isFinite(amount) ||
  amount <= 0
) {
  alert("Lütfen geçerli bir açıklama ve sıfırdan büyük bir tutar gir.");
  return;
}

  setTransactions((prev) =>
    prev.map((item) =>
      item.id === editingTransactionId
        ? {
            ...item,
            description: editDescription,
            amount: amount,
            category: editCategory,
          }
        : item
    )
  );
  setEditingTransactionId(null);
};


  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50 px-4 py-12">
      <h1 className="text-6xl font-bold text-green-700">
        FinWise
      </h1>

      <p className="mt-4 text-center text-lg text-gray-600">
        Akıllı Kişisel Finans Asistanın
      </p>

      <p className="mt-2 text-center text-sm text-gray-500">
        Bütçeni yönet, hedeflerini planla, bilinçli kararlar ver.
      </p>

      {/* Özet kartları */}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <SummaryCard
          title="Toplam Bakiye"
          amount={balance}
        />

        <SummaryCard
          title="Gelirler"
          amount={income}
        />

        <SummaryCard
          title="Giderler"
          amount={expense}
        />
      </div>

      {/* Harcama ekleme formu */}
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        <input
          type="number"
          value={expenseInput}
          onChange={(e) => setExpenseInput(e.target.value)}
          placeholder={
            transactionType === "income"
              ? "Gelir tutarını gir"
              : "Gider tutarını gir"
}
          className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
        />

        <input
          type="text"
          value={descriptionInput}
          onChange={(e) => setDescriptionInput(e.target.value)}
          placeholder={
            transactionType === "income"
              ? "Gelir açıklaması"
              : "Harcama açıklaması"
}
          className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
        />

        <select
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
        >
          {(transactionType === "income" ? incomeCategories : categories).map(
            (category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-3 gap-2">
  <select
    aria-label="Gün"
    value={dateInput.slice(8, 10)}
    onChange={(e) =>
      setDateInput(dateInput.slice(0, 8) + e.target.value)
    }
    className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
  >
    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
      <option key={day} value={String(day).padStart(2, "0")}>
        {day}
      </option>
    ))}
  </select>

  <select
    aria-label="Ay"
    value={dateInput.slice(5, 7)}
    onChange={(e) => {
      const year = dateInput.slice(0, 4);
      const month = e.target.value;
      const lastDay = new Date(
        Number(year),
        Number(month),
        0
      ).getDate();

      const day = Math.min(Number(dateInput.slice(8, 10)), lastDay);
      setDateInput(`${year}-${month}-${String(day).padStart(2, "0")}`);
    }}
    className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
  >
    {[
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ].map((month, index) => (
      <option
        key={month}
        value={String(index + 1).padStart(2, "0")}
      >
        {month}
      </option>
    ))}
  </select>

  <select
    aria-label="Yıl"
    value={dateInput.slice(0, 4)}
    onChange={(e) => {
      const year = e.target.value;
      const month = dateInput.slice(5, 7);
      const lastDay = new Date(
        Number(year),
        Number(month),
        0
      ).getDate();

      const day = Math.min(Number(dateInput.slice(8, 10)), lastDay);
      setDateInput(`${year}-${month}-${String(day).padStart(2, "0")}`);
    }}
    className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
  >
    {Array.from(
      { length: 11 },
      (_, i) => new Date().getFullYear() - i
    ).map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ))}
  </select>
</div>

<div className="mb-4">
  <label className="mb-2 block font-medium">
    İşlem Türü
  </label>

  <select
    value={transactionType}
    onChange={(e) => {
      const selectedType = e.target.value as "income" | "expense";

      setTransactionType(selectedType);

      if (selectedType === "income") {
        setCategoryInput("Maaş");
      } else {
        setCategoryInput("Diğer");
      }
    }}
    className="w-full rounded-lg border border-gray-300 p-3"
  >
    <option value="expense">Gider</option>
    <option value="income">Gelir</option>
  </select>
</div>

        <button
          type="button"
          onClick={handleAddTransaction}
          className="rounded-lg bg-green-700 px-5 py-3 text-white hover:bg-green-800"
        >
          {transactionType === "income" ? "Gelir Ekle" : "Gider Ekle"}
        </button>
      </div>

      {/* Aylık harcama analizi */}
      <div className="mt-8 w-full max-w-md rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Aylık Harcama Analizi
        </h2>

        <div className="grid grid-cols-2 gap-3">
  <div>
    <label className="mb-2 block text-sm text-gray-600">
      Ay
    </label>

    <select
      value={selectedMonth.slice(5, 7)}
      onChange={(e) =>
        setSelectedMonth(
          `${selectedMonth.slice(0, 4)}-${e.target.value}`
        )
      }
      className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
    >
      {months.map((month, index) => (
        <option
          key={month}
          value={String(index + 1).padStart(2, "0")}
        >
          {month}
        </option>
      ))}
    </select>
  </div>

  <div>
    <label className="mb-2 block text-sm text-gray-600">
      Yıl
    </label>

    <select
      value={selectedMonth.slice(0, 4)}
      onChange={(e) =>
        setSelectedMonth(
          `${e.target.value}-${selectedMonth.slice(5, 7)}`
        )
      }
      className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
    >
      {Array.from(
        { length: 11 },
        (_, i) => new Date().getFullYear() - i
      ).map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  </div>
</div>

        <div className="mt-4 grid grid-cols-3 gap-2">
  <div className="rounded-lg bg-green-50 p-3">
    <p className="text-xs text-gray-600">Aylık Gelir</p>
    <p className="mt-2 font-bold text-green-700">
      {monthlyIncomeTotal.toLocaleString("tr-TR")} TL
    </p>
  </div>

  <div className="rounded-lg bg-red-50 p-3">
    <p className="text-xs text-gray-600">Aylık Gider</p>
    <p className="mt-2 font-bold text-red-600">
      {monthlyTotal.toLocaleString("tr-TR")} TL
    </p>
  </div>

  <div className="rounded-lg bg-slate-100 p-3">
    <p className="text-xs text-gray-600">Aylık Fark</p>
    <p
  className={`mt-2 font-bold ${
    monthlyBalance > 0
      ? "text-green-700"
      : monthlyBalance < 0
      ? "text-red-600"
      : "text-gray-900"
  }`}
>
  {monthlyBalance.toLocaleString("tr-TR")} TL
</p>
  </div>
</div>

        <div className="mt-5 border-t border-gray-200 pt-4">
  <h3 className="mb-3 font-semibold text-gray-900">
    Bu Ay Kategorilere Göre Harcamalar
  </h3>
  {monthlyTotal === 0 && (
  <p className="py-3 text-sm text-gray-500">
    Bu ay için gider kaydı bulunmuyor.
  </p>
)}

  {monthlyCategoryTotals
    .filter((item) => item.total > 0)
    .map((item) => (
    <div
      key={item.category}
      className="flex justify-between py-2"
    >
      <span className="text-gray-600">
        {item.category}
      </span>

      <span className="font-medium text-gray-900">
        {item.total.toLocaleString("tr-TR")} TL
      </span>
    </div>
  ))}
</div> 

<div className="mt-5 border-t border-gray-200 pt-4">
  <h3 className="mb-3 font-semibold text-gray-900">
    Bu Ay Kategorilere Göre Gelirler
  </h3>

  {monthlyIncomeTotal === 0 && (
  <p className="py-3 text-sm text-gray-500">
    Bu ay için gelir kaydı bulunmuyor.
  </p>
)}

  {monthlyIncomeCategoryTotals
  .filter((item) => item.total > 0)
  .map((item) => (
    <div
      key={item.category}
      className="flex justify-between py-2"
    >
      <span className="text-gray-600">
        {item.category}
      </span>

      <span className="font-medium text-green-700">
        {item.total.toLocaleString("tr-TR")} TL
      </span>
    </div>
  ))}
</div>
    </div>

      {/* Kategori harcamaları */}
      <div className="mt-8 w-full max-w-md rounded-xl bg-green-50 p-5">
        <h2 className="mb-4 text-xl font-bold text-green-900">
          Kategori Harcamaları
        </h2>

        {categoryTotals.map((item) => (
          <div
            key={item.category}
            className="flex justify-between border-b border-green-200 py-3"
          >
            <span className="text-green-800">
              {item.category}
            </span>

            <span className="font-semibold text-green-900">
              {item.total.toLocaleString("tr-TR")} TL
            </span>
          </div>
        ))}
      </div>

      {/* Son işlemler */}
      <div className="mt-8 w-full max-w-md">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Son İşlemler
        </h2>

        {editingTransaction && (
  <div className="mt-3 rounded-lg bg-blue-50 p-4">
    <h3 className="mb-3 font-semibold text-blue-900">
      İşlemi Düzenle
    </h3>

    <input
      type="text"
      value={editDescription}
      onChange={(e) => setEditDescription(e.target.value)}
      placeholder="İşlem açıklaması"
      className="mb-3 w-full rounded-lg border border-gray-300 p-2 text-gray-900"
    />

    <input
      type="number"
      value={editAmount}
      onChange={(e) => setEditAmount(e.target.value)}
      placeholder="İşlem tutarı"
      className="w-full rounded-lg border border-gray-300 p-2 text-gray-900"
    />

    <select
      value={editCategory}
      onChange={(e) => setEditCategory(e.target.value)}
      className="mt-3 w-full rounded-lg border border-gray-300 p-2 text-gray-900"
    >
      {(editingTransaction.type === "income"
        ? incomeCategories
        : categories
      ).map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>

    <button
      type="button"
      onClick={handleSaveEdit}
      className="mr-2 mt-3 rounded-lg bg-green-700 px-4 py-2 text-white"
    >
      Kaydet
    </button>

    <button
      type="button"
      onClick={() => setEditingTransactionId(null)}
      className="mt-3 rounded-lg bg-gray-200 px-4 py-2 text-gray-800"
    >
      İptal
    </button>
  </div>
)}

        {transactions.length === 0 ? (
          <p className="text-gray-500">
            Henüz işlem eklenmedi.
          </p>
        ) : (
          transactions.map((item) => (
            <div
              key={item.id}
              className="mb-2 flex items-center justify-between gap-4 rounded-lg bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {item.description}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  <span>{item.category}</span>
                  <span className="mx-1">·</span>
                  <span>
                    {new Date(
                      `${item.date}T12:00:00`
                    ).toLocaleDateString("tr-TR")}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`font-semibold ${
                    item.type === "income" ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {item.type === "income" ? "+" : "-"}
                  {item.amount.toLocaleString("tr-TR")} TL
                </span>

                <button
                  onClick={() => {
                    setEditingTransactionId(item.id);
                    setEditDescription(item.description);
                    setEditAmount(String(item.amount));
                    setEditCategory(item.category);
                  }}
                  className="rounded-lg bg-blue-100 px-3 py-2 text-sm text-blue-700"
                >
                  Düzenle
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteTransaction(item.id)}
                  className="rounded-lg border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                >
                  Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
