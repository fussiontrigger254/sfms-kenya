import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";
import "./Financials.css";

const initialForm = {
  farm: "",
  type: "expense",
  category: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
  linked_crop: "",
  linked_livestock: "",
};

const expenseCategories = [
  "Fertiliser",
  "Feed",
  "Labour",
  "Medicine",
  "Pesticides",
  "Herbicides",
  "Fuel",
  "Transport",
  "Vet",
  "Equipment",
  "Other",
];

const revenueCategories = [
  "Crop Sale",
  "Milk",
  "Eggs",
  "Livestock Sale",
  "Manure",
  "Other",
];

function formatKES(value) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Financials() {
  const [records, setRecords] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [livestock, setLivestock] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(initialForm);

  const [filters, setFilters] = useState({
    type: "",
    category: "",
    farm: "",
    search: "",
  });

  const loadRecords = async () => {
    try {
      setError("");

      const params = {};

      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.farm) params.farm = filters.farm;
      if (filters.search) params.search = filters.search;

      const response = await apiClient.get("financials/records/", {
        params,
      });

      setRecords(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load financial records.");
    }
  };

  const loadSupportingData = async () => {
    try {
      const [farmsResponse, cropsResponse, livestockResponse] =
        await Promise.all([
          apiClient.get("farms/"),
          apiClient.get("crops/"),
          apiClient.get("animals/"),
        ]);

      setFarms(farmsResponse.data);
      setCrops(cropsResponse.data);
      setLivestock(livestockResponse.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load farm information.");
    }
  };

  const loadInitialData = async () => {
    setLoading(true);

    try {
      await Promise.all([
        loadRecords(),
        loadSupportingData(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadRecords();
    }
  }, [filters.type, filters.category, filters.farm, filters.search]);

  const categories = useMemo(() => {
    if (filters.type === "revenue") {
      return revenueCategories;
    }

    if (filters.type === "expense") {
      return expenseCategories;
    }

    return [
      ...new Set([
        ...expenseCategories,
        ...revenueCategories,
      ]),
    ];
  }, [filters.type]);

  const formCategories =
    formData.type === "revenue"
      ? revenueCategories
      : expenseCategories;

  const totals = useMemo(() => {
    let income = 0;
    let expenses = 0;

    records.forEach((record) => {
      const amount = Number(record.amount || 0);

      if (record.type === "revenue") {
        income += amount;
      } else {
        expenses += amount;
      }
    });

    return {
      income,
      expenses,
      net: income - expenses,
    };
  }, [records]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "type") {
      setFormData((previous) => ({
        ...previous,
        type: value,
        category: "",
      }));
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
    setFormError("");
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (record) => {
    setEditingId(record.id);

    setFormData({
      farm: record.farm || "",
      type: record.type || "expense",
      category: record.category || "",
      amount: record.amount || "",
      date: record.date || "",
      description: record.description || "",
      linked_crop: record.linked_crop || "",
      linked_livestock: record.linked_livestock || "",
    });

    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormLoading(true);
    setFormError("");

    try {
      if (!formData.farm) {
        throw new Error("Please select a farm.");
      }

      if (!formData.category) {
        throw new Error("Please select a category.");
      }

      if (!formData.amount || Number(formData.amount) <= 0) {
        throw new Error("Amount must be greater than zero.");
      }

      const payload = {
        farm: formData.farm,
        type: formData.type,
        category: formData.category,
        amount: Number(formData.amount),
        date: formData.date,
        description: formData.description,
        linked_crop: formData.linked_crop || null,
        linked_livestock: formData.linked_livestock || null,
      };

      if (editingId) {
        await apiClient.patch(
          `financials/records/${editingId}/`,
          payload
        );
      } else {
        await apiClient.post(
          "financials/records/",
          payload
        );
      }

      closeForm();
      await loadRecords();
    } catch (err) {
      console.error(err);

      if (err.message) {
        setFormError(err.message);
      } else {
        setFormError(
          "Unable to save the financial record."
        );
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this financial record?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await apiClient.delete(
        `financials/records/${id}/`
      );

      await loadRecords();
    } catch (err) {
      console.error(err);
      setError("Unable to delete the financial record.");
    }
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      category: "",
      farm: "",
      search: "",
    });
  };

  const getFarmName = (farmId) => {
    const farm = farms.find(
      (item) => String(item.id) === String(farmId)
    );

    return farm?.farm_name || "Farm";
  };

  if (loading) {
    return (
      <div className="financials-container">
        <div className="financials-loading">
          Loading financial records...
        </div>
      </div>
    );
  }

  return (
    <div className="financials-container">
      <header className="financials-header">
        <div>
          <Link to="/" className="back-link">
            ← Dashboard
          </Link>

          <h1>Financials</h1>

          <p>
            Track farm income, expenses and profit in KES.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openCreateForm}
        >
          + Add Transaction
        </button>
      </header>

      {error && (
        <div className="financial-error">
          {error}
        </div>
      )}

      <section className="financial-summary">
        <div className="summary-card income-card">
          <span>Total Income</span>
          <strong>{formatKES(totals.income)}</strong>
        </div>

        <div className="summary-card expense-card">
          <span>Total Expenses</span>
          <strong>{formatKES(totals.expenses)}</strong>
        </div>

        <div
          className={`summary-card ${
            totals.net >= 0
              ? "profit-card"
              : "loss-card"
          }`}
        >
          <span>
            {totals.net >= 0
              ? "Net Profit"
              : "Net Loss"}
          </span>

          <strong>
            {formatKES(Math.abs(totals.net))}
          </strong>
        </div>
      </section>

      <section className="filters-card">
        <div className="filters-header">
          <h2>Transactions</h2>

          <button
            className="clear-filter-button"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>

        <div className="filters-grid">
          <div className="field">
            <label htmlFor="filter-type">
              Type
            </label>

            <select
              id="filter-type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="revenue">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="filter-category">
              Category
            </label>

            <select
              id="filter-category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All categories</option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="filter-farm">
              Farm
            </label>

            <select
              id="filter-farm"
              name="farm"
              value={filters.farm}
              onChange={handleFilterChange}
            >
              <option value="">All farms</option>

              {farms.map((farm) => (
                <option
                  key={farm.id}
                  value={farm.id}
                >
                  {farm.farm_name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="filter-search">
              Search
            </label>

            <input
              id="filter-search"
              name="search"
              type="search"
              placeholder="Search category or description..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </section>

      {showForm && (
        <section className="financial-form-card">
          <div className="form-header">
            <div>
              <h2>
                {editingId
                  ? "Edit Transaction"
                  : "Add Transaction"}
              </h2>

              <p>
                Record farm income or expenditure.
              </p>
            </div>

            <button
              type="button"
              className="close-button"
              onClick={closeForm}
            >
              ×
            </button>
          </div>

          {formError && (
            <div className="financial-error">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="farm">
                  Farm *
                </label>

                <select
                  id="farm"
                  name="farm"
                  value={formData.farm}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">
                    Select farm
                  </option>

                  {farms.map((farm) => (
                    <option
                      key={farm.id}
                      value={farm.id}
                    >
                      {farm.farm_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="type">
                  Transaction Type *
                </label>

                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  required
                >
                  <option value="expense">
                    Expense
                  </option>

                  <option value="revenue">
                    Income
                  </option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="category">
                  Category *
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">
                    Select category
                  </option>

                  {formCategories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="amount">
                  Amount (KES) *
                </label>

                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="date">
                  Date *
                </label>

                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="linked_crop">
                  Crop
                </label>

                <select
                  id="linked_crop"
                  name="linked_crop"
                  value={formData.linked_crop}
                  onChange={handleFormChange}
                >
                  <option value="">
                    None
                  </option>

                  {crops.map((crop) => (
                    <option
                      key={crop.id}
                      value={crop.id}
                    >
                      {crop.crop_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="linked_livestock">
                  Livestock
                </label>

                <select
                  id="linked_livestock"
                  name="linked_livestock"
                  value={formData.linked_livestock}
                  onChange={handleFormChange}
                >
                  <option value="">
                    None
                  </option>

                  {livestock.map((animal) => (
                    <option
                      key={animal.id}
                      value={animal.id}
                    >
                      {animal.animal_tag}{" "}
                      {animal.animal_type
                        ? `— ${animal.animal_type}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field full-field">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Add any useful details..."
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={formLoading}
              >
                {formLoading
                  ? "Saving..."
                  : editingId
                    ? "Update Transaction"
                    : "Save Transaction"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="records-list">
        {records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💰</div>

            <h3>No financial records yet</h3>

            <p>
              Add your first income or expense transaction
              to start tracking your farm finances.
            </p>

            <button
              className="primary-button"
              onClick={openCreateForm}
            >
              + Add Transaction
            </button>
          </div>
        ) : (
          records.map((record) => (
            <article
              className="transaction-card"
              key={record.id}
            >
              <div className="transaction-main">
                <div className="transaction-title-row">
                  <div>
                    <span
                      className={`transaction-type ${
                        record.type === "revenue"
                          ? "revenue"
                          : "expense"
                      }`}
                    >
                      {record.type === "revenue"
                        ? "INCOME"
                        : "EXPENSE"}
                    </span>

                    <h3>{record.category}</h3>
                  </div>

                  <strong
                    className={`transaction-amount ${
                      record.type === "revenue"
                        ? "revenue-text"
                        : "expense-text"
                    }`}
                  >
                    {record.type === "revenue"
                      ? "+"
                      : "-"}
                    {formatKES(record.amount)}
                  </strong>
                </div>

                {record.description && (
                  <p className="transaction-description">
                    {record.description}
                  </p>
                )}

                <div className="transaction-meta">
                  <span>
                    📅 {formatDate(record.date)}
                  </span>

                  <span>
                    🌱{" "}
                    {record.farm_name ||
                      getFarmName(record.farm)}
                  </span>

                  {record.crop_name && (
                    <span>
                      🌾 {record.crop_name}
                    </span>
                  )}

                  {record.animal_tag && (
                    <span>
                      🐄 {record.animal_tag}
                    </span>
                  )}
                </div>
              </div>

              <div className="transaction-actions">
                <button
                  className="edit-button"
                  onClick={() =>
                    openEditForm(record)
                  }
                >
                  Edit
                </button>

                <button
                  className="delete-button"
                  onClick={() =>
                    handleDelete(record.id)
                  }
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

export default Financials;