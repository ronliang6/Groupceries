const client = algoliasearch('691PDCNR9Q', 'cc9618d9eb730c8f4d8773b668175030');
const users = client.initIndex('users');

autocomplete('#aa-search-input', {}, [
    {
      source: autocomplete.sources.hits(users, { hitsPerPage: 3 }),
      displayKey: 'email',
      templates: {
        header: '<div class="aa-suggestions-category">Users</div>',
        suggestion({_highlightResult}) {
          return `
          <span>${_highlightResult.name.value}</span> <br>
          <span>${_highlightResult.email.value}</span>
          `;
        }
      }
    },
]);

function sendRequest() {
    let email = document.getElementById("aa-search-input").value;
    console.log(email);
    clearInput();
    // make a post request of that email and do things with it.
    sendFriendEmail(email);
}

function sendFriendEmail(email) {
    $.ajax({
        type: 'POST',
        url: '/home/user',
        data: {friendEmail: email, currentUser: localStorage.getItem('uid')},
        success: function(data){
          console.log(data);
          //do something with the data via front-end framework
          location.reload();
        }
      });
}

function clearInput() {
    document.getElementById("aa-search-input").value = "";
}