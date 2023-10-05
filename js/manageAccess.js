$(document).ready(function () {

    // CODE to make added users visible on the access table
    var button_add = document.getElementById("add_clicked");
    // user_count is the number of users given access to the project
    var user_count = 1;

    // Function that changes the HTML layout after the add button is clicked
    button_add.onclick = function() {
        user_count++;
        var add_name = document.getElementById("user_name");
        var add_email = document.getElementById("user_email");
        var add_role = document.getElementById("select_role");
        
        // Make a new row and append the following user info
        var user_table = document.getElementById("users");
        var new_row = user_table.insertRow();

        // user_num is for the count of the row
        var user_num = new_row.insertCell(0);
        user_num.className = "pl-4";
        user_num.innerHTML = user_count.toString();

        var user_name = new_row.insertCell(1);
        var name_header = document.createElement("h5");
        name_header.className = "font-medium mb-0";
        name_header.innerHTML = document.getElementById("user_name").value;
        user_name.appendChild(name_header);

        var user_email = new_row.insertCell(2);
        user_email.className = "text-muted";
        user_email.innerHTML = document.getElementById("user_email").value;

        var user_role = new_row.insertCell(3);
        // Making a new select tag
        var role_selector = document.createElement("select");
        role_selector.className = "form-control category-select";
        role_selector.id = "role_selector";
        user_role.appendChild(role_selector);
        // Adding the options admin & user, 0 & 1 respectively
        var admin_option = document.createElement("option");
        admin_option.value = "Admin";
        admin_option.text = "Admin";
        var user_option = document.createElement("option");
        user_option.value = "User";
        user_option.text = "User";
        role_selector.appendChild(admin_option);
        role_selector.appendChild(user_option);
        // Finding the selected index in the add user window, and selecting that in the table row
        var selected_role = document.getElementById("select_role");
        role_selector.selectedIndex = selected_role.selectedIndex;

        // Delete button
        var cancel_cell = new_row.insertCell(4);
        var del_bttn = document.createElement("button");
        del_bttn.type = "button";
        del_bttn.id = "delete_clicked";
        del_bttn.className = "btn btn-outline-danger btn-circle btn-lg btn-circle ml-2";
        del_bttn.innerHTML = '<i class="fa fa-trash"></i>';
        cancel_cell.appendChild(del_bttn);
        // .onclick function added to every delete button
        del_bttn.onclick = function() {
            new_row.remove();
            alert("User removed!");
        }

        // Show alert "New user added!"
        alert("New user added!");

        /*
            Want to get the add popup to disappear and then the alert to show, where you get to
            click 'ok' and then you get to see the access table and list of people.
        */
    }
});





	  
	  