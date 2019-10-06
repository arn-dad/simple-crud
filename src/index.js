const url = 'https://5d8e0901370f02001405c7c9.mockapi.io/api/v1/postblog/';
const endpoint = 'item';

const $ = function (selector) { // reusable function for shorthed
  return document.querySelector(selector); // select all html tag by give selector like in css 
}

let selectedItemID = null;  // Temporary hold id for check if it is update or delete.

const onReady = function () { // onReady calls when HTML ready
  console.log('DOM Loaded');
  getItemList(function (data) { // get list of item initialy
    createTable(data) // whene data is get from backend createTabel function calls whit data from backend
  })

  const submitBtn = $('#submit');
  submitBtn.addEventListener('click', function () { // add click event for button for update or delete
    if (selectedItemID) { // if selectedID is set we call updateItem function otherwise we create new item
      updateItem(); // updateItem functional
    } else {
      createItem(); // createItem create new item and send it to backend
    }
  })
}

const createTable = function (data) {
  const tbody = $('#table-root'); // get element from html
  let template = '';
  for (let i = 0; i < data.length; i++) { // loop over array 
    // for each data in array create Template literals
    // see ref here https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
    const row = `
          <tr>
            <th>#${data[i].id}</th>
            <td>${data[i].name}</td>
            <td>${data[i].description}</td>
            <td>$${data[i].price}</td>
            <td><a onclick="onEdit(${data[i].id})" href="#">Edit</a></td>
            <td><a onclick="onDelete(${data[i].id})" href="#">Delete</a></td>
          </tr >
      `;

    template += row // add each new row (string) in tamplate
  }
  // append created string with tags in to DOM 
  // please see how innerHTML works!
  tbody.innerHTML = template;
}

const fillForm = function (data) { // fill form onEdit click
  const name = $('#name');
  const description = $('#description');
  const price = $('#price');

  name.value = data.name;
  description.value = data.description;
  price.value = data.price;

}

const createItem = function () {
  const name = $('#name');
  const description = $('#description');
  const price = $('#price');

  if (!name.value.trim() || !price.value.trim()) { // if data in form missing
    showErrors() // error function show massages under inputs 
    return
  }

  hideErrors(); // clear function messages under inputs

  const data = { // prepare data to send
    name: name.value,
    description: description.value,
    price: price.value
  }

  fetch( // fetch with POST (create) method
    `${url}${endpoint}`,
    {
      method: "POST", // method POST used to create new data in items list in backend
      body: JSON.stringify(data), // change normal javascript object in to JSON format
      headers: {
        'Content-Type': 'application/json' // what kind of data we will send to backend
      }
    }
  )
    .then(function (response) {
      if (response.ok && response.status === 201) {
        getItemList(function (data) { // call getList after add new item in list
          createTable(data) // update tabel view
        })
        // clear form inputs values 
        name.value = '',
          description.value = '',
          price.value = ''
      }
    })
    .catch(function (err) {
      console.log("Error", err);
    });
}

const updateItem = function () {
  if (!selectedItemID) { // check if item was selected previously
    return;
  }
  //  get data from html form
  const name = $('#name');
  const description = $('#description');
  const price = $('#price');

  const updateData = { // prepare data to update
    name: name.value,
    description: description.value,
    price: price.value
  }

  // fetch method PUT (update)
  fetch(
    `${url}${endpoint}/${selectedItemID}`,
    {
      method: "PUT", // method
      body: JSON.stringify(updateData), // data what we will update
      headers: {
        'Content-Type': 'application/json' // what kind of data we will send to backend
      }
    }
  )
    .then(function (response) {
      if (response.ok && response.status === 200) { // check if response is success
        getItemList(function (data) { // update table data
          createTable(data)
        })
        // clear data in form 
        name.value = '';
        description.value = '';
        price.value = '';
        selectedItemID = null; // clear id 
      }
    })
    .catch(function (err) {
      console.log("Error", err);
    });
}

const getById = function (id) { // get single item for edit one item
  fetch(
    `${url}${endpoint}/${id}`
  ).then(function (response) {
    if (response.ok && response.status === 200) {
      return response.json().then(function (responseData) {
        selectedItemID = responseData.id
        fillForm(responseData);
      });
    }
  }).catch();
  hideErrors();
}

const getItemList = function (callback) {
  fetch(
    `${url}${endpoint}`
  ).then(function (response) {
    if (response.ok && response.status === 200) {
      return response.json().then(function (responseData) {
        callback(responseData); // 
      });
    }
  }).catch();
}

const deleteById = function (id) { // delete item in the list
  fetch(
    `${url}${endpoint}/${id}`,
    {
      method: 'DELETE'
    }
  ).then(function (response) {
    if (response.ok && response.status === 200) {
      return response.json().then(function (responseData) {
        getItemList(function (data) { // update tabel view
          createTable(data)
        })
      });
    }
  }).catch();
}

const onEdit = function (id) { // call getById function and passing id of item
  getById(id)
}

const onDelete = function (id) { // ask confiramtion if true call deleteById function
  const result = confirm('Are you sure you wanna delete this item?');
  if (result) {
    deleteById(id)
  }
}

const showErrors = function () { // select all tags whit class help 
  const heplers = document.querySelectorAll('.help');

  heplers.forEach(element => { // give them display block style
    element.style = 'display: block'
  });
}

const hideErrors = function () { // select all tags with class help
  const heplers = document.querySelectorAll('.help');
  heplers.forEach(element => { // give them display none style
    element.style = 'display: none'
  });
}