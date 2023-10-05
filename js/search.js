// Navbanner show ul on click
$(document).ready(function () {
  $(".menu-icon").on("click", function () {
      $("nav ul").toggleClass("showing");
  });
});

// Scrolling effect for navbar
$(window).on("scroll", function () {
  if ($(window).scrollTop()) {
      $('nav').addClass('black');
  } else {
      $('nav').removeClass('black');
  }
})

// Jump to labeling page:
var params = new URLSearchParams(location.search);
var projID = params.get('projectid')
var label_link = document.getElementById('label');
label_link.href = "/labelTweets?projectid="+projID


// Dynamically add extra query spaces for a multi-query.
var dynaplus = document.getElementById("add_tweet_query_button");
if (dynaplus) {
  document.getElementById("add_tweet_query_button").onclick = function () {
      var label = document.createElement("div");
      var input = document.createElement("input");
      input.setAttribute("type", "text");
      input.setAttribute("name", "tweet");
      input.setAttribute("value", "");
      input.setAttribute("id", "tweet");
      label.setAttribute("value", "Tweet:")
      label.appendChild(input);
      document.getElementById("multi_query").appendChild(label);
      return false;
  };
}

// Function that chains the following: Flask API ----> Twitter API ----> Return Tweet Data
function checkTweet() {
  // Nonsense security for testing.
  var user = firebase.auth().currentUser;
  if (user) {
      console.log("User", user.uid, "signed in");
  } else {
      console.log("No user logged in.")
      $("#error_test").html("Error: Must be logged in.").css("color", "red");
      return;
  }

  const inputArray = []
  var serializedData = "tweet=";

  // Grab all inputs from all fields
  var input = document.getElementsByName('tweet');
  var resultDiv = document.getElementById('result');
  var saveButton = document.getElementById('save_results_btn');

  // Put values into an array
  for (var i = 0; i < input.length; i++) {
      inputArray.push(input[i].value)
      console.log(input[i].value);
  }

  // Join the values into a single comma separated string.
  input = inputArray.join(",");

  // Serialize data for AJAX
  serializedData += input;
  console.log('serializedData:', serializedData)

  //console.log("searializedData", serializedData);
  // Hide the results DIV to start and set default color.
  $("#result").css("color", "black");
  resultDiv.style.visibility = "hidden";
  saveButton.style.visibility = "hidden";

  // If the query is empty, prompt the user. Otherwise continue.
  if ($('#tweet').val() == null || $('#tweet').val() == "") {
      resultDiv.style.visibility = "visible";
      $("#result").html("Required Field.").css("color", "red");
  } else {
      $.ajax({
          type: "POST",
          // UDEL url:
          //url: "http://smidgen.cis.udel.edu:6970/twapi",
          url: "http://127.0.0.1:6970/twapi",
          //data: inputFormatted,
          //data: $('#tweet').serialize(),
          data: serializedData,
          dataType: "html",
          cache: false,
          success: function (result) {
              // Remove outside quotes.
              result = result.replace(/(^"|"$)/g, '')

              //$('#resultTitle').show();
              // Show and add the data recieved to the results div.
              resultDiv.style.visibility = "visible";
              console.log("result: ", result)
              $("#result").html(result);
              // Show save button and sticky the header so table labels still show as the user scrolls.
              saveButton.style.visibility = "visible";
              stickyHeader();
          },
          error: function (textStatus, errorThrown) {
              resultDiv.style.visibility = "visible";
              $("#result").html(textStatus + " " + errorThrown);
          }
      });
  }
}

// Function to clear loaded data when the user wants to refresh the data.
function removeAllChildNodes(parent) {
  while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
  }
}

// Save Query Results
function saveQueryData() {
  // Nonsense security for testing.
  var user = firebase.auth().currentUser;
  if (user) {
      console.log("User", user.uid, "signed in");
  } else {
      console.log("No user logged in.")
      $("#error_test").html("Error: Must be logged in.").css("color", "red");
      return;
  }

  // Used to grab data from URL (Project ID)
  let params = new URLSearchParams(location.search);
  projID = params.get('projectid');
  //params.delete('projectid');

  // Grab ProjID from URL, if there is no ProjID notify the user and exit the save function.
  if (projID == null) {
      $("#error_test").html("Error: No project selected.").css("color", "red");
      return;
  }
  //console.log("projID: ", projID);

  // Grab all tables -- table[0] is query results, table[1] is saved data loaded from DB
  dataTable = document.getElementsByTagName('table');
  tweetTable = dataTable[0];
  //console.log(dataTable.length);

  var mp = new Map()
  // Grab all table rows [Tweet ID - Tweet Text]
  var allTRs = tweetTable.getElementsByTagName('tr');
  for (var trCounter = 0; trCounter < allTRs.length; trCounter++) {

      // Grab all th (1) within the row (Tweet ID)
      var allTHsInTR = allTRs[trCounter].getElementsByTagName('th');
      // Grab all td (1) within the row (Tweet Text)
      var allTDsInTR = allTRs[trCounter].getElementsByTagName('td');

      if (allTDsInTR.length) {
          //console.log("TH[0]",allTHsInTR[0].innerHTML)
          //console.log("TD[0]",allTDsInTR[0].innerHTML)
          //Map TweetID:TweetText
          mp.set(allTHsInTR[0].innerHTML, allTDsInTR[0].innerHTML)
      }
  }

  // Useless for now, just testing.
  for (let i = 0; i < dataTable.length; i++) {
      dataTable[i].setAttribute("id", "tweet_data");
  }
  //console.log("JSON mp:",JSON.stringify(Array.from(mp.entries())));

  $.ajax({
  type: "POST",
  //url: "http://smidgen.cis.udel.edu:5000/savequerydata",
  url: "http://127.0.0.1:5000/savequerydata",
      data: {projID: projID, mp: JSON.stringify(Array.from(mp.entries()))}
  //contentType: "application/json"
}).done(function(reply){
  //Ajax reply
      if(reply.length != 0)
      {
          console.log(reply);
      }
      else{
          console.log("Tweets saved successfully.")
      }
})
}

// Load exisiting tweet data the user has saved to the database.
function loadData() {
  // Nonsense security for testing.
  var user = firebase.auth().currentUser;
  if (user) {
      console.log("User", user.uid, "signed in");
  } else {
      console.log("No user logged in.")
      $("#error_test").html("Error: Must be logged in.").css("color", "red");
      return;
  }

  // Grab ProjID from URL, if there is no ProjID notify the user and exit the load function.
  // Used to grab data from URL (Project ID)
  let params = new URLSearchParams(location.search);
  projID = params.get('projectid');
  params.delete('projectid');

  // Grab ProjID from URL, if there is no ProjID notify the user and exit the save function.
  if (projID == null) {
      $("#error_test").html("Error: No project selected.").css("color", "red");
      return;
  }
  console.log("projID: ", projID);

  // Ajax call to load saved tweets.
  $.ajax({
  type: "POST",
  //url: "http://smidgen.cis.udel.edu:5000/loadtweetdata",
  url: "http://127.0.0.1:5000/loadtweetdata",
      data: {key: projID},
}).done(function(data){
      //console.log("loadData ajax call complete: data -->", data);
      //console.log("loadedTweets IN: ",loadedTweets);

      // Function to handle frontend displaying of the data.
      loadDataTable(data);
})
};

function loadDataTable(tweetData)
{
  // Clear previous data.
  var loadData = document.getElementById('saved_data')
  removeAllChildNodes(loadData);
  loadData.style.visibility = "visible";

  // ---- Table Layout ----
  // tr:Table Row, th:Table Header, td:Table Data
  // <table>
  //   <tr>
  //     <th>TweetID</th>
  //     <td>TweetText</td>
  //   </tr>
  // </table>
  //console.log("Callback TD: ",tweetData);

  // Create table to append data to.
  var table = document.createElement("table");

  // Setting header labels.
  var tr = document.createElement("tr");
  var th = document.createElement("th");

  // Create row, attach "Tweet ID" header, append to row.
  table.appendChild(tr);
  th.textContent = "Tweet ID";
  th.setAttribute("id", "sticky");
  tr.appendChild(th);

  // Create another header, attach "Tweet ID" to header, append to row.
  var th = document.createElement("th");
  th.textContent = "Tweet Text";
  th.setAttribute("id", "sticky");
  tr.appendChild(th);

  //Append above to a the table.
  table.appendChild(tr);

  for (const [key, value] of Object.entries(tweetData)) {
      //console.log(`${key}: ${value}`);
      var tr = document.createElement("tr");
      var th = document.createElement("th");
      var td = document.createElement("td");
      // Append table row.
      table.appendChild(tr);
      // Set data and append to the appended row.
      th.textContent = key;
      tr.appendChild(th);
      td.textContent = value;
      tr.appendChild(td);
      // Repeat until all tweets are loaded.
  }

  // Append the final results to the data div.
  loadData.appendChild(table);
}

function stickyHeader(){
  //var tbody = document.getElementsByTagName("tbody");
  //console.log(typeof tbody);
  // Setting header labels.
  var tr = document.createElement("tr");
  var th = document.createElement("th");

  // Create row, attach "Tweet ID" header, append to row.
  th.textContent = "Tweet ID";
  th.setAttribute("id", "sticky");
  tr.appendChild(th);

  // Create another header, attach "Tweet ID" to header, append to row.
  var th = document.createElement("th");
  th.textContent = "Tweet Text";
  th.setAttribute("id", "sticky");
  tr.appendChild(th);

  //Append above to a the table.
  $(tr).insertBefore('table > tbody > tr:first');
  //tbody.appendChild(tr);
}

// When the user hits enter, simulate form submission which calls checkTweet();
$('#tweet').keypress(function (event) {
  var keycode = (event.keyCode ? event.keyCode : event.which);
  if (keycode == '13') {
      $(".query_button").click();
  }
});

// Prevent the page from reloading when the user submits with the enter key.
$("#tweet_in").submit(function (e) {
  e.preventDefault();
});