function Users() {
  return (
    <div>
      <h1>User Management</h1>

      <h2>Add New User</h2>

      <form>
        <div>
          <label>Name:</label>
          <br />
          <input type="text" />
        </div>

        <br />

        <div>
          <label>Membership ID:</label>
          <br />
          <input type="text" />
        </div>

        <br />

        <div>
          <label>Role:</label>
          <br />
          <select>
            <option>Member</option>
            <option>Librarian</option>
          </select>
        </div>

        <br />

        <button type="submit">Add User</button>
      </form>

      <h2>Users List</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Membership ID</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>John Smith</td>
            <td>LIB001</td>
            <td>Member</td>
            <td>
              <button>Update</button>
              <button>Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Users;