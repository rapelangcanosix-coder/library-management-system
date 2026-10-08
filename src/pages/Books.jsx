import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Books() {
  const [books, setBooks] = useState(() => {
    const savedBooks = localStorage.getItem("books");

    if (savedBooks) {
      return JSON.parse(savedBooks);
    }

    return [];
  });

  const [isbn, setIsbn] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [quantity, setQuantity] = useState("");
  const [search, setSearch] = useState("");

  const [editingIsbn, setEditingIsbn] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem(
      "books",
      JSON.stringify(books)
    );
  }, [books]);

  function getBorrowedQuantity(bookIsbn) {
    const transactions =
      JSON.parse(
        localStorage.getItem("transactions")
      ) || [];

    let borrowedQuantity = 0;

    transactions.forEach((transaction) => {
      if (
        transaction.isbn === bookIsbn &&
        transaction.transaction === "Borrowed"
      ) {
        borrowedQuantity =
          borrowedQuantity +
          Number(transaction.quantity);
      }

      if (
        transaction.isbn === bookIsbn &&
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

  function clearForm() {
    setIsbn("");
    setTitle("");
    setAuthor("");
    setQuantity("");
    setEditingIsbn(null);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (
      isbn === "" ||
      title === "" ||
      author === "" ||
      quantity === ""
    ) {
      alert("Please fill in all fields");
      return;
    }

    if (
      Number(quantity) < 0 ||
      !Number.isInteger(Number(quantity))
    ) {
      alert(
        "Quantity must be a whole number"
      );
      return;
    }

    if (editingIsbn !== null) {
      const borrowedQuantity =
        getBorrowedQuantity(editingIsbn);

      if (
        isbn !== editingIsbn &&
        borrowedQuantity > 0
      ) {
        alert(
          "You cannot change the ISBN while this book is borrowed"
        );
        return;
      }

      if (
        Number(quantity) < borrowedQuantity
      ) {
        alert(
          "Quantity cannot be less than the number of books currently borrowed"
        );
        return;
      }

      const updatedBooks = books.map(
        (book) => {
          if (book.isbn === editingIsbn) {
            return {
              isbn,
              title,
              author,
              quantity: Number(quantity)
            };
          }

          return book;
        }
      );

      setBooks(updatedBooks);
      clearForm();
      return;
    }

    const existingBook = books.find(
      (book) => book.isbn === isbn
    );

    if (existingBook) {
      alert(
        "A book with this ISBN already exists"
      );
      return;
    }

    const newBook = {
      isbn,
      title,
      author,
      quantity: Number(quantity)
    };

    setBooks([...books, newBook]);

    clearForm();
  }

  function handleEdit(book) {
    setIsbn(book.isbn);
    setTitle(book.title);
    setAuthor(book.author);
    setQuantity(book.quantity);
    setEditingIsbn(book.isbn);
  }

  function handleDelete(bookIsbn) {
    const borrowedQuantity =
      getBorrowedQuantity(bookIsbn);

    if (borrowedQuantity > 0) {
      alert(
        "This book cannot be deleted because it is currently borrowed"
      );
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmDelete) {
      return;
    }

    const updatedBooks = books.filter(
      (book) => book.isbn !== bookIsbn
    );

    setBooks(updatedBooks);
  }

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

  const filteredBooks = books.filter(
    (book) => {
      const searchText =
        search.toLowerCase();

      return (
        book.isbn
          .toLowerCase()
          .includes(searchText) ||
        book.title
          .toLowerCase()
          .includes(searchText) ||
        book.author
          .toLowerCase()
          .includes(searchText)
      );
    }
  );

  return (
    <div className="page-container">

      <div className="page-header">
        <h1>Books Management</h1>
        <p>Manage books in the library</p>
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

        <h2>
          {editingIsbn !== null
            ? "Update Book"
            : "Add New Book"}
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            <div className="form-group">
              <label>ISBN</label>

              <input
                type="text"
                value={isbn}
                onChange={(e) =>
                  setIsbn(e.target.value)
                }
                placeholder="Enter ISBN"
              />
            </div>

            <div className="form-group">
              <label>Title</label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Enter book title"
              />
            </div>

            <div className="form-group">
              <label>Author</label>

              <input
                type="text"
                value={author}
                onChange={(e) =>
                  setAuthor(e.target.value)
                }
                placeholder="Enter author name"
              />
            </div>

            <div className="form-group">
              <label>Quantity</label>

              <input
                type="number"
                min="0"
                step="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                placeholder="Enter quantity"
              />
            </div>

          </div>

          <br />

          <button
            type="submit"
            className="primary-button"
          >
            {editingIsbn !== null
              ? "Update Book"
              : "Add Book"}
          </button>

          {editingIsbn !== null && (
            <button
              type="button"
              className="secondary-button"
              onClick={clearForm}
            >
              Cancel
            </button>
          )}

        </form>

      </div>

      <div className="section">

        <h2>Book List</h2>

        <input
          className="search-box"
          type="text"
          placeholder="Search by ISBN, title or author..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>ISBN</th>
                <th>Title</th>
                <th>Author</th>
                <th>Quantity</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    No books found
                  </td>
                </tr>
              ) : (
                filteredBooks.map(
                  (book) => {
                    const borrowedQuantity =
                      getBorrowedQuantity(
                        book.isbn
                      );

                    const availableQuantity =
                      Number(book.quantity);

                    return (
                      <tr key={book.isbn}>

                        <td>{book.isbn}</td>

                        <td>{book.title}</td>

                        <td>{book.author}</td>

                        <td>
                          {availableQuantity}
                        </td>

                        <td>
                          {availableQuantity > 0 ? (
                            <span className="status-available">
                              Available
                            </span>
                          ) : (
                            <span className="status-out">
                              Out of Stock
                            </span>
                          )}
                        </td>

                        <td>

                          <button
                            className="primary-button"
                            onClick={() =>
                              handleEdit(book)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="danger-button"
                            onClick={() =>
                              handleDelete(
                                book.isbn
                              )
                            }
                          >
                            Delete
                          </button>

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

export default Books;