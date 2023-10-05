var projID
var projName
var uid
var current_user_is_owner = null
$(document).ready(function () {
    uid = window.sessionStorage.getItem('user')
    var params = new URLSearchParams(window.location.search);
    projID = params.get('projectid')

    //check if the current user is owner:
    var user = {}
    user['uid'] = uid
    user['proj_id'] = projID
    $.ajax({
        type: "POST",
        url: "/inProject",
        data: JSON.stringify(user),
        contentType: "application/json"
    }).done(function(data){
        if(!data){
            window.location.href = "http://127.0.0.1:5000/projects";
        }else{
            $.ajax({
                type: "POST",
                url: "/isOwner",
                data: JSON.stringify(user),
                contentType: "application/json"
            }).done(function(data){
                current_user_is_owner = data
                if(!current_user_is_owner){
                    document.getElementById("add_user").disabled = true
                }
                $.ajax({
                    type: "POST",
                    url: "/loadCollaborators",
                    data: JSON.stringify(project_info),
                    contentType: "application/json"
                }).done(function(data){
                    for (const [key, value] of Object.entries(data)) {
                        load_Collaborator(value['email'], value['role'], value['name'])
                      }
                })
            })

        }
    })




    // get project name:
    var project_info = {}
    project_info['project_id'] = projID
    $.ajax({
        type: "POST",
        url: "/getProjectName",
        data: JSON.stringify(project_info),
        contentType: "application/json"
    }).done(function(data){
        projName = data
    })



    // CODE to make added users visible on the access table
    var button_add = document.getElementById("add_clicked");
    // Function that changes the HTML layout after the add button is clicked
    button_add.onclick = add_Collaborator








    function add_Collaborator(){
        var add_name = document.getElementById("user_name").value;
        var add_email = document.getElementById("user_email").value;

        var user_info = {}
        user_info.uemail = add_email
        user_info.projID = projID
        $.ajax({
            type: "POST",
            url: "/check_uemail",
            data: JSON.stringify(user_info),
            contentType: "application/json"
        }).done(function(result){
            console.log("result: ", result)
            if(result['add']){
                        // Make a new row and append the following user info
                        var user_table = document.getElementById("users");
                        var new_row = user_table.insertRow();

                        var user_name = new_row.insertCell(0);
                        var name_header = document.createElement("h5");
                        name_header.className = "font-medium mb-0";
                        name_header.innerHTML = add_name
                        user_name.appendChild(name_header);

                        var user_email = new_row.insertCell(1);
                        user_email.className = "text-muted";
                        user_email.innerHTML = add_email

                        var user_role = new_row.insertCell(2);
                        // Making a new select tag
                        var role_selector = document.createElement("select");
                        role_selector.className = "form-control category-select";
                        role_selector.id = "role_selector";
                        user_role.appendChild(role_selector);
                        // Adding the options admin & user, 0 & 1 respectively
                        var user_option = document.createElement("option");
                        user_option.value = "Editor";
                        user_option.text = "Editor";
                        role_selector.appendChild(user_option);


                        // Delete button
                        var cancel_cell = new_row.insertCell(3);
                        var del_bttn = document.createElement("button");
                        del_bttn.type = "button";
                        del_bttn.id = "delete_clicked";
                        del_bttn.className = "btn btn-outline-danger btn-circle btn-lg btn-circle ml-2";
                        del_bttn.innerHTML = '<i class="fa fa-trash"></i>';
                        cancel_cell.appendChild(del_bttn);
                        // .onclick function added to every delete button
                        del_bttn.onclick = function() {
                            new_row.remove();
                            var delete_info = {}
                            delete_info['email'] = add_email
                            delete_info['projID'] = projID
                            $.ajax({
                                type: "POST",
                                url: "/deleteCollaborator",
                                data:JSON.stringify(delete_info),
                                contentType: "application/json; charset=utf-8"
                            }).done(function(data){
                                alert("User deleted!")
                            })
                        }
                        var info = {}
                        info.uid = result['uid']
                        info.name = add_name
                        info.email = add_email
                        info.project_name = projName
                        info.role = "editor"
                        info.project_id = projID
                        $.ajax({
                            type: "POST",
                            url: "/addCollaborator",
                            data:JSON.stringify(info),
                            contentType: "application/json; charset=utf-8"
                        }).done(function(data){
                            alert("User added to the project!")
                        })


            }else{
                alert("User doesn't exist or already in the project!")
            }
            
        })
        document.getElementById("cancel_clicked").click()

    }

    function load_Collaborator(email, role, name){
        // Make a new row and append the following user info
        var user_table = document.getElementById("users");
        var new_row = user_table.insertRow();

        var user_name = new_row.insertCell(0);
        var name_header = document.createElement("h5");
        name_header.className = "font-medium mb-0";
        name_header.innerHTML = name
        user_name.appendChild(name_header);

        var user_email = new_row.insertCell(1);
        user_email.className = "text-muted";
        user_email.innerHTML = email

        var user_role = new_row.insertCell(2);
        // Making a new select tag
        var role_selector = document.createElement("select");
        role_selector.className = "form-control category-select";
        role_selector.id = "role_selector";
        user_role.appendChild(role_selector);
        // Adding the options admin & user, 0 & 1 respectively
        if(role == 'owner'){
            var admin_option = document.createElement("option");
            admin_option.value = "Owner";
            admin_option.text = "Owner";
            role_selector.appendChild(admin_option);

        }else{
            var user_option = document.createElement("option");
            user_option.value = "Editor";
            user_option.text = "Editor";
            role_selector.appendChild(user_option);

        }
        if(!current_user_is_owner){
            role_selector.setAttribute("disabled", "disabled")
        }

        // Delete button
        var cancel_cell = new_row.insertCell(3);
        var del_bttn = document.createElement("button");
        del_bttn.type = "button";
        del_bttn.id = "delete_clicked";
        del_bttn.className = "btn btn-outline-danger btn-circle btn-lg btn-circle ml-2";
        del_bttn.innerHTML = '<i class="fa fa-trash"></i>';
        cancel_cell.appendChild(del_bttn);
        // .onclick function added to every delete button
        if(current_user_is_owner){
            del_bttn.onclick = function() {
                new_row.remove();
                var delete_info = {}
                delete_info['email'] = email
                delete_info['projID'] = projID
                $.ajax({
                    type: "POST",
                    url: "/deleteCollaborator",
                    data:JSON.stringify(delete_info),
                    contentType: "application/json; charset=utf-8"
                }).done(function(data){
                    alert("User deleted!")
                })
            }
        }else{
            del_bttn.disabled = true
        }
        

    }

})


	  
	  