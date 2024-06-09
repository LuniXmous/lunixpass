
// Add an event listener to the "Add User" button
document.querySelector('#add-user-btn').addEventListener('click', () => {
  // Create a new table row
  const newRow = document.createElement('tr');

  // Create the cells for the new row
  const numberCell = document.createElement('th');
  numberCell.scope = 'row';
  numberCell.textContent = tableBody.childElementCount + 1;

  const firstNameCell = document.createElement('td');
  firstNameCell.textContent = 'New User';

  const lastNameCell = document.createElement('td');
  lastNameCell.textContent = 'New User';

  const handleCell = document.createElement('td');
  handleCell.textContent = '@newuser';

  const actionCell = document.createElement('td');

  // Create the update and delete buttons
  const updateBtn = document.createElement('button');
  updateBtn.className = 'btn btn-warning btn-sm';
  updateBtn.innerHTML = '<i class="fa-solid fa-pen"></i> Update';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-danger btn-sm';
  deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Delete';

  actionCell.appendChild(updateBtn);
  actionCell.appendChild(deleteBtn);

  // Append the cells to the new row
  newRow.appendChild(numberCell);
  newRow.appendChild(firstNameCell);
  newRow.appendChild(lastNameCell);
  newRow.appendChild(handleCell);
  newRow.appendChild(actionCell);

  // Append the new row to the table body
  tableBody.appendChild(newRow);
});