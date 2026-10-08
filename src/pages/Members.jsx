import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Members() {
  const [members, setMembers] = useState(() => {
    const savedMembers =
      localStorage.getItem("members");

    if (savedMembers) {
      return JSON.parse(savedMembers);
    }

    return [];
  });

  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");

  const [editingStudentId, setEditingStudentId] =
    useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem(
      "members",
      JSON.stringify(members)
    );
  }, [members]);

  function getBorrowedBooks(memberId) {
    const transactions =
      JSON.parse(
        localStorage.getItem("transactions")
      ) || [];

    let borrowedBooks = 0;

    transactions.forEach((transaction) => {
      if (
        transaction.studentId === memberId &&
        transaction.transaction === "Borrowed"
      ) {
        borrowedBooks =
          borrowedBooks +
          Number(transaction.quantity);
      }

      if (
        transaction.studentId === memberId &&
        transaction.transaction === "Returned"
      ) {
        borrowedBooks =
          borrowedBooks -
          Number(transaction.quantity);
      }
    });

    if (borrowedBooks < 0) {
      return 0;
    }

    return borrowedBooks;
  }

  function clearForm() {
    setStudentId("");
    setName("");
    setEmail("");
    setEditingStudentId(null);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (
      studentId === "" ||
      name === "" ||
      email === ""
    ) {
      alert("Please fill in all fields");
      return;
    }

    if (editingStudentId !== null) {
      const borrowedBooks =
        getBorrowedBooks(
          editingStudentId
        );

      if (
        studentId !== editingStudentId &&
        borrowedBooks > 0
      ) {
        alert(
          "You cannot change the Student ID while the member has borrowed books"
        );
        return;
      }

      const updatedMembers =
        members.map((member) => {
          if (
            member.studentId ===
            editingStudentId
          ) {
            return {
              studentId,
              name,
              email
            };
          }

          return member;
        });

      setMembers(updatedMembers);
      clearForm();
      return;
    }

    const existingMember =
      members.find(
        (member) =>
          member.studentId === studentId
      );

    if (existingMember) {
      alert(
        "A member with this Student ID already exists"
      );
      return;
    }

    const newMember = {
      studentId,
      name,
      email
    };

    setMembers([
      ...members,
      newMember
    ]);

    clearForm();
  }

  function handleEdit(member) {
    setStudentId(member.studentId);
    setName(member.name);
    setEmail(member.email);

    setEditingStudentId(
      member.studentId
    );
  }

  function handleDelete(memberId) {
    const borrowedBooks =
      getBorrowedBooks(memberId);

    if (borrowedBooks > 0) {
      alert(
        "This member cannot be deleted because they still have borrowed books"
      );
      return;
    }

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this member?"
      );

    if (!confirmDelete) {
      return;
    }

    const updatedMembers =
      members.filter(
        (member) =>
          member.studentId !== memberId
      );

    setMembers(updatedMembers);
  }

  function handleLogout() {
    const confirmLogout =
      window.confirm(
        "Are you sure you want to logout?"
      );

    if (!confirmLogout) {
      return;
    }

    localStorage.removeItem(
      "loggedIn"
    );

    navigate("/");
  }

  const filteredMembers =
    members.filter((member) => {
      const searchText =
        search.toLowerCase();

      return (
        member.studentId
          .toLowerCase()
          .includes(searchText) ||
        member.name
          .toLowerCase()
          .includes(searchText) ||
        member.email
          .toLowerCase()
          .includes(searchText)
      );
    });

  return (
    <div className="page-container">

      <div className="page-header">
        <h1>Members Management</h1>
        <p>
          Manage library members
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

        <h2>
          {editingStudentId !== null
            ? "Update Member"
            : "Add New Member"}
        </h2>

        <form
          onSubmit={handleSubmit}
        >

          <div className="form-grid">

            <div className="form-group">
              <label>
                Student ID
              </label>

              <input
                type="text"
                value={studentId}
                onChange={(e) =>
                  setStudentId(
                    e.target.value
                  )
                }
                placeholder="Enter student ID"
              />
            </div>

            <div className="form-group">
              <label>Name</label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                placeholder="Enter member name"
              />
            </div>

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                placeholder="Enter email address"
              />
            </div>

          </div>

          <br />

          <button
            type="submit"
            className="primary-button"
          >
            {editingStudentId !== null
              ? "Update Member"
              : "Add Member"}
          </button>

          {editingStudentId !== null && (
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

        <h2>Member List</h2>

        <input
          className="search-box"
          type="text"
          placeholder="Search by Student ID, name or email..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Borrowed Books</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    No members found
                  </td>
                </tr>
              ) : (
                filteredMembers.map(
                  (member) => {
                    const borrowedBooks =
                      getBorrowedBooks(
                        member.studentId
                      );

                    return (
                      <tr
                        key={
                          member.studentId
                        }
                      >

                        <td>
                          {member.studentId}
                        </td>

                        <td>
                          {member.name}
                        </td>

                        <td>
                          {member.email}
                        </td>

                        <td>
                          {borrowedBooks}
                        </td>

                        <td>

                          <button
                            className="primary-button"
                            onClick={() =>
                              handleEdit(
                                member
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="danger-button"
                            onClick={() =>
                              handleDelete(
                                member.studentId
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

export default Members;