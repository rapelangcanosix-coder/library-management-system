import { useState, useEffect } from "react";
import {
  useNavigate,
  useLocation
} from "react-router-dom";

function Dashboard() {
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [borrowedBooks, setBorrowedBooks] = useState(0);
  const [overdueBooks, setOverdueBooks] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  function loadDashboardData() {
    const books =
      JSON.parse(localStorage.getItem("books")) || [];

    const members =
      JSON.parse(localStorage.getItem("members")) || [];

    const transactions =
      JSON.parse(localStorage.getItem("transactions")) || [];

    let bookCount = 0;

    books.forEach((book) => {
      bookCount =
        bookCount + Number(book.quantity);
    });

    setTotalBooks(bookCount);
    setTotalMembers(members.length);

    const borrowedRecords = [];

    transactions.forEach((transaction) => {
      if (transaction.transaction === "Borrowed") {
        const existingRecord =
          borrowedRecords.find(
            (item) =>
              item.studentId === transaction.studentId &&
              item.isbn === transaction.isbn
          );

        if (existingRecord) {
          existingRecord.quantity =
            existingRecord.quantity +
            Number(transaction.quantity);

          existingRecord.dueDate =
            transaction.dueDate;
        } else {
          borrowedRecords.push({
            studentId: transaction.studentId,
            isbn: transaction.isbn,
            quantity: Number(transaction.quantity),
            dueDate: transaction.dueDate
          });
        }
      }

      if (transaction.transaction === "Returned") {
        const existingRecord =
          borrowedRecords.find(
            (item) =>
              item.studentId === transaction.studentId &&
              item.isbn === transaction.isbn
          );

        if (existingRecord) {
          existingRecord.quantity =
            existingRecord.quantity -
            Number(transaction.quantity);

          if (existingRecord.quantity <= 0) {
            const index =
              borrowedRecords.indexOf(existingRecord);

            borrowedRecords.splice(index, 1);
          }
        }
      }
    });

    let borrowedCount = 0;

    borrowedRecords.forEach((record) => {
      borrowedCount =
        borrowedCount + record.quantity;
    });

    setBorrowedBooks(borrowedCount);

    let overdueCount = 0;

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    borrowedRecords.forEach((record) => {
      if (
        !record.dueDate ||
        record.dueDate === "-"
      ) {
        return;
      }

      const dueDate =
        new Date(record.dueDate);

      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        overdueCount =
          overdueCount + record.quantity;
      }
    });

    setOverdueBooks(overdueCount);
  }

  useEffect(() => {
    loadDashboardData();
  }, [location]);

  function handleLogout() {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) {
      return;
    }

    localStorage.removeItem("loggedIn");

    navigate("/");
  }

  return (
    <div className="page-container">

      <div className="page-header">
        <h1>Library Dashboard</h1>
        <p>Library Management System</p>
      </div>

      <div className="navigation">

        <button
          onClick={() =>
            navigate("/dashboard")
          }
        >
          Dashboard
        </button>

        <button
          onClick={() =>
            navigate("/books")
          }
        >
          Books
        </button>

        <button
          onClick={() =>
            navigate("/members")
          }
        >
          Members
        </button>

        <button
          onClick={() =>
            navigate("/transactions")
          }
        >
          Transactions
        </button>

        <button
          className="danger-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

      <div className="section">

        <h2>Library Statistics</h2>

        <div className="dashboard-cards">

          <div className="dashboard-card">
            <h3>Total Books</h3>
            <p>{totalBooks}</p>
          </div>

          <div className="dashboard-card">
            <h3>Total Members</h3>
            <p>{totalMembers}</p>
          </div>

          <div className="dashboard-card">
            <h3>Borrowed Books</h3>
            <p>{borrowedBooks}</p>
          </div>

          <div className="dashboard-card">
            <h3>Overdue Books</h3>
            <p>{overdueBooks}</p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;