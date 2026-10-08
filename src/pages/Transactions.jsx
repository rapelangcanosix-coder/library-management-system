import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Transactions() {
  const [quantity, setQuantity] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [search, setSearch] = useState("");

  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);

  const [transactions, setTransactions] = useState(() => {
    const savedTransactions =
      localStorage.getItem("transactions");

    if (savedTransactions) {
      return JSON.parse(savedTransactions);
    }

    return [];
  });

  const navigate = useNavigate();

  useEffect(() => {
    const savedBooks = localStorage.getItem("books");

    if (savedBooks) {
      const savedBooksList = JSON.parse(savedBooks);

      setBooks(savedBooksList);

      if (savedBooksList.length > 0) {
        setSelectedBook(savedBooksList[0].isbn);
      }
    }
  }, []);

  useEffect(() => {
    const savedMembers =
      localStorage.getItem("members");

    if (savedMembers) {
      const savedMembersList =
        JSON.parse(savedMembers);

      setMembers(savedMembersList);

      if (savedMembersList.length > 0) {
        setSelectedMember(
          savedMembersList[0].studentId
        );
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "transactions",
      JSON.stringify(transactions)
    );
  }, [transactions]);

  function validQuantity() {
    if (
      quantity === "" ||
      Number(quantity) <= 0 ||
      !Number.isInteger(Number(quantity))
    ) {
      alert(
        "Quantity must be a positive whole number"
      );

      return false;
    }

    return true;
  }

  function addStock() {
    if (!selectedBook) {
      alert("Please select a book");
      return;
    }

    if (!validQuantity()) {
      return;
    }

    const selectedBookData = books.find(
      (book) => book.isbn === selectedBook
    );

    if (!selectedBookData) {
      alert("Book not found");
      return;
    }

    const newBooks = books.map((book) => {
      if (book.isbn === selectedBook) {
        return {
          ...book,
          quantity:
            Number(book.quantity) +
            Number(quantity),
        };
      }

      return book;
    });

    setBooks(newBooks);

    localStorage.setItem(
      "books",
      JSON.stringify(newBooks)
    );

    const newTransaction = {
      member: "Library",
      studentId: "-",
      book: selectedBookData.title,
      isbn: selectedBookData.isbn,
      transaction: "Stock Added",
      quantity: Number(quantity),
      date: new Date().toLocaleDateString(),
      dueDate: "-"
    };

    setTransactions([
      ...transactions,
      newTransaction
    ]);

    setQuantity("");
  }

  function borrowBook() {
    if (!selectedMember) {
      alert("Please select a member");
      return;
    }

    if (!selectedBook) {
      alert("Please select a book");
      return;
    }

    if (!validQuantity()) {
      return;
    }

    if (dueDate === "") {
      alert("Please select a due date");
      return;
    }

    const today = new Date();
    const selectedDueDate =
      new Date(dueDate);

    today.setHours(0, 0, 0, 0);
    selectedDueDate.setHours(0, 0, 0, 0);

    if (selectedDueDate < today) {
      alert(
        "Due date cannot be in the past"
      );

      return;
    }

    const selectedBookData = books.find(
      (book) => book.isbn === selectedBook
    );

    if (!selectedBookData) {
      alert("Book not found");
      return;
    }

    if (
      Number(selectedBookData.quantity) <= 0
    ) {
      alert("This book is out of stock");
      return;
    }

    if (
      Number(quantity) >
      Number(selectedBookData.quantity)
    ) {
      alert("Not enough books available");
      return;
    }

    const selectedMemberData = members.find(
      (member) =>
        member.studentId === selectedMember
    );

    if (!selectedMemberData) {
      alert("Member not found");
      return;
    }

    const newBooks = books.map((book) => {
      if (book.isbn === selectedBook) {
        return {
          ...book,
          quantity:
            Number(book.quantity) -
            Number(quantity)
        };
      }

      return book;
    });

    setBooks(newBooks);

    localStorage.setItem(
      "books",
      JSON.stringify(newBooks)
    );

    const newTransaction = {
      member: selectedMemberData.name,
      studentId:
        selectedMemberData.studentId,
      book: selectedBookData.title,
      isbn: selectedBookData.isbn,
      transaction: "Borrowed",
      quantity: Number(quantity),
      date: new Date().toLocaleDateString(),
      dueDate: dueDate
    };

    setTransactions([
      ...transactions,
      newTransaction
    ]);

    setQuantity("");
    setDueDate("");
  }

  function returnBook() {
    if (!selectedMember) {
      alert("Please select a member");
      return;
    }

    if (!selectedBook) {
      alert("Please select a book");
      return;
    }

    if (!validQuantity()) {
      return;
    }

    const selectedMemberData = members.find(
      (member) =>
        member.studentId === selectedMember
    );

    if (!selectedMemberData) {
      alert("Member not found");
      return;
    }

    const borrowedQuantity =
      getCurrentlyBorrowedQuantity(
        selectedMember,
        selectedBook
      );

    if (borrowedQuantity <= 0) {
      alert(
        "This member has not borrowed this book"
      );

      return;
    }

    if (
      Number(quantity) > borrowedQuantity
    ) {
      alert(
        "Return quantity is greater than the quantity currently borrowed"
      );

      return;
    }

    const selectedBookData = books.find(
      (book) => book.isbn === selectedBook
    );

    if (!selectedBookData) {
      alert("Book not found");
      return;
    }

    const newBooks = books.map((book) => {
      if (book.isbn === selectedBook) {
        return {
          ...book,
          quantity:
            Number(book.quantity) +
            Number(quantity)
        };
      }

      return book;
    });

    setBooks(newBooks);

    localStorage.setItem(
      "books",
      JSON.stringify(newBooks)
    );

    const newTransaction = {
      member: selectedMemberData.name,
      studentId:
        selectedMemberData.studentId,
      book: selectedBookData.title,
      isbn: selectedBookData.isbn,
      transaction: "Returned",
      quantity: Number(quantity),
      date: new Date().toLocaleDateString(),
      dueDate: "-"
    };

    setTransactions([
      ...transactions,
      newTransaction
    ]);

    setQuantity("");
  }

  function getCurrentlyBorrowedQuantity(
    studentId,
    isbn
  ) {
    let borrowedQuantity = 0;

    transactions.forEach((transaction) => {
      if (
        transaction.studentId === studentId &&
        transaction.isbn === isbn &&
        transaction.transaction === "Borrowed"
      ) {
        borrowedQuantity =
          borrowedQuantity +
          Number(transaction.quantity);
      }

      if (
        transaction.studentId === studentId &&
        transaction.isbn === isbn &&
        transaction.transaction === "Returned"
      ) {
        borrowedQuantity =
          borrowedQuantity -
          Number(transaction.quantity);
      }
    });

    if (borrowedQuantity < 0) {
      return 0;
    }

    return borrowedQuantity;
  }

  function getStatus(item) {
    if (
      item.transaction !== "Borrowed"
    ) {
      return "-";
    }

    if (
      !item.dueDate ||
      item.dueDate === "-"
    ) {
      return "-";
    }

    const today = new Date();
    const dueDate =
      new Date(item.dueDate);

    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      return "Overdue";
    }

    return "On Time";
  }

  const borrowedRecords = [];

  transactions.forEach((transaction) => {
    if (
      transaction.transaction === "Borrowed"
    ) {
      const existingRecord =
        borrowedRecords.find(
          (item) =>
            item.studentId ===
              transaction.studentId &&
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
          member: transaction.member,
          studentId:
            transaction.studentId,
          book: transaction.book,
          isbn: transaction.isbn,
          quantity: Number(
            transaction.quantity
          ),
          dueDate: transaction.dueDate
        });
      }
    }

    if (
      transaction.transaction === "Returned"
    ) {
      const existingRecord =
        borrowedRecords.find(
          (item) =>
            item.studentId ===
              transaction.studentId &&
            item.isbn === transaction.isbn
        );

      if (existingRecord) {
        existingRecord.quantity =
          existingRecord.quantity -
          Number(transaction.quantity);

        if (existingRecord.quantity <= 0) {
          const index =
            borrowedRecords.indexOf(
              existingRecord
            );

          borrowedRecords.splice(
            index,
            1
          );
        }
      }
    }
  });

  const filteredTransactions =
    transactions.filter((item) => {
      const searchText =
        search.toLowerCase();

      return (
        (item.member || "")
          .toLowerCase()
          .includes(searchText) ||
        (item.studentId || "")
          .toLowerCase()
          .includes(searchText) ||
        (item.book || "")
          .toLowerCase()
          .includes(searchText) ||
        (item.isbn || "")
          .toLowerCase()
          .includes(searchText)
      );
    });

  function handleLogout() {
    const confirmLogout =
      window.confirm(
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
        <h1>Book Transactions</h1>
        <p>
          Manage borrowing, returning and book stock
        </p>
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

        <h2>Manage Transactions</h2>

        <div className="form-grid">

          <div className="form-group">
            <label>Member</label>

            <select
              value={selectedMember}
              onChange={(e) =>
                setSelectedMember(
                  e.target.value
                )
              }
            >
              <option value="">
                Select Member
              </option>

              {members.map((member) => (
                <option
                  key={member.studentId}
                  value={member.studentId}
                >
                  {member.name} -{" "}
                  {member.studentId}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Book</label>

            <select
              value={selectedBook}
              onChange={(e) =>
                setSelectedBook(
                  e.target.value
                )
              }
            >
              <option value="">
                Select Book
              </option>

              {books.map((book) => (
                <option
                  key={book.isbn}
                  value={book.isbn}
                >
                  {book.title} - ISBN:{" "}
                  {book.isbn}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quantity</label>

            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value
                )
              }
              placeholder="Enter quantity"
            />
          </div>

          <div className="form-group">
            <label>Due Date</label>

            <input
              type="date"
              min={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              value={dueDate}
              onChange={(e) =>
                setDueDate(
                  e.target.value
                )
              }
            />
          </div>

        </div>

        <br />

        <button
          className="secondary-button"
          onClick={addStock}
        >
          Add Stock
        </button>

        <button
          className="success-button"
          onClick={borrowBook}
        >
          Borrow Book
        </button>

        <button
          className="primary-button"
          onClick={returnBook}
        >
          Return Book
        </button>

      </div>

      <div className="section">

        <h2>Currently Borrowed Books</h2>

        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>Member</th>
                <th>Student ID</th>
                <th>Book</th>
                <th>ISBN</th>
                <th>Quantity</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {borrowedRecords.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    No books are currently borrowed
                  </td>
                </tr>
              ) : (
                borrowedRecords.map(
                  (item, index) => {
                    const status =
                      getStatus({
                        transaction:
                          "Borrowed",
                        dueDate:
                          item.dueDate
                      });

                    return (
                      <tr key={index}>

                        <td>
                          {item.member}
                        </td>

                        <td>
                          {item.studentId}
                        </td>

                        <td>
                          {item.book}
                        </td>

                        <td>
                          {item.isbn}
                        </td>

                        <td>
                          {item.quantity}
                        </td>

                        <td>
                          {item.dueDate}
                        </td>

                        <td>
                          <span
                            className={
                              status ===
                              "Overdue"
                                ? "status-overdue"
                                : "status-on-time"
                            }
                          >
                            {status}
                          </span>
                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      <div className="section">

        <h2>Transaction History</h2>

        <input
          className="search-box"
          type="text"
          placeholder="Search by member, student ID, book or ISBN..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

        <button
          className="secondary-button"
          onClick={() =>
            setSearch("")
          }
        >
          Clear Search
        </button>

        <br />
        <br />

        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>Member</th>
                <th>Student ID</th>
                <th>Book</th>
                <th>ISBN</th>
                <th>Transaction</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(
                  (item, index) => {
                    const status =
                      getStatus(item);

                    return (
                      <tr key={index}>

                        <td>
                          {item.member}
                        </td>

                        <td>
                          {item.studentId || "-"}
                        </td>

                        <td>
                          {item.book}
                        </td>

                        <td>
                          {item.isbn || "-"}
                        </td>

                        <td>
                          {item.transaction}
                        </td>

                        <td>
                          {item.quantity}
                        </td>

                        <td>
                          {item.date}
                        </td>

                        <td>
                          {item.dueDate || "-"}
                        </td>

                        <td>
                          {status === "Overdue" ? (
                            <span className="status-overdue">
                              Overdue
                            </span>
                          ) : status === "On Time" ? (
                            <span className="status-on-time">
                              On Time
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Transactions;