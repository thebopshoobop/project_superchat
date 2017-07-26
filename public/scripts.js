$(chat);
// global socket for testing
var socket = io.connect('http://localhost:3000');

function chat() {
  //let socket = io.connect("http:localhost/3000");

  // Show login form if user is not logged in
  let userName = document.cookie.superChatUsername;
  if (!userName) {
    $('#login').show();
  } else {
    actions.logIn(userName);
  }

  // Handle login submit
  $('#login').on('click', 'button', event => {
    event.preventDefault();
    let userName = $('#login input').val();
    socket.emit('checkUsername', userName);
  });

  // Handle bad username
  socket.on('invalidUserName', () => {
    $('#login input').val('');
    alert('Username already taken. Try Again.');
  });

  // Log in handler
  socket.on('validUserName', userName => {
    actions.logIn(userName);
  });

  // Log out hander
  $('#userStuff').on('click', 'button', event => {
    // Remove Rooms
    $('#rooms').children().each(child => {
      $(child).delete();
    });
    $('#login').show();
    socket.emit('logOut', $('#userStuff').find('h3').text());
    document.cookie.superChatUsername = '';
  });

  // Add a new room to the page
  socket.on('addRoom', roomName => {
    actions.buildRoom(roomName);
  });

  // Add a new post to a room
  socket.on('addPost', messageObj => {
    //console.log(messageObj);
    actions.buildPost(messageObj);
  });

  // User submits a new post, build it!
  $('#rooms').on('click', 'button', event => {
    event.preventDefault();
    actions.newPost(event);
  });
}

let actions = {
  buildRoom: function(roomName) {
    // Create a room with some jQuery magics
    let article = $('<article>')
      .addClass('col-md-4 col-lg-3')
      .attr('data-id', roomName);
    let h = $('<h2>').text(roomName);
    let ul = $('<ul>');
    let form = $('<form>');
    let section = $('<section>').addClass('form-group');
    let label = $('<label>').attr('for', 'post');
    let text = $('<textarea>').attr('name', 'post');
    let button = $('<button>')
      .addClass('btn btn-submit post-button')
      .text('Post something plz')
      .attr('type', 'button');
    section.append(label).append(text);
    form.append(section).append(button);
    article.append(h).append(form).append(ul);
    $('#rooms').append(article);
  },
  buildPost: function(messageObj) {
    // Create a post with some jQuery magics
    let li = $('<li>');
    let title = $('<h3>').text(messageObj.author);
    let body = $('<p>').text(messageObj.message);
    li.append(title).append(body);
    let targetText = '[data-id="' + messageObj.roomName + '"]';
    console.log(targetText);
    $(targetText).children('ul').prepend(li);
  },
  newPost: function(event) {
    // Get post details, trigger server event
    let $target = $(event.target);
    let roomName = $target.closest('article').attr('data-id');
    let author = 'anon'; //change later
    let $textBox = $target.siblings('section').children('textarea');
    let message = $textBox.val();
    $textBox.val('');
    socket.emit('addPost', roomName, author, message);
  },
  logIn: function(userName) {
    $('#login input').val('');
    $('#login').hide();
    let $userStuff = $('#userStuff');
    $userStuff.show();
    $userStuff.find('h3').text(userName);
    document.cookie.superChatUsername = userName;
  }
};

//
// <article id="" class="col-md-4 col-lg-3">
//   <h2>Da chat Room</h2>
//   <ul>
//
//   </ul>
// <form>
//<input type=text>
// </article>
// <section class='form-group'>
//   <label for='post'>
//   <textarea name='post'>
// </section>
// <button class='btn btn-submit post-button'>
//

// Room:room-name
