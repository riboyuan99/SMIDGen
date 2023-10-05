var projID;
$(document).ready(function () {
    
    
    var params = new URLSearchParams(window.location.search);
    projID = params.get('projectid')
    //get project info(project name and project keyword)
    var proj_info = {}
    proj_info.proj_id = projID
    $.ajax({
        type: "POST",
        url: "/getProjInfo",
        data: JSON.stringify(proj_info),
        contentType: "application/json"
    }).done(function(data){
        console.log(data)
        document.getElementById("projectName").innerText = "Project Name: " + data['name']
        document.getElementById("projectKeyword").innerText = "Project Keyword: " + data['keyword']
    })

    // load saved tweets:
    $('#spinner').css('visibility', 'visible');
    var project_info = {}
    project_info.projectID = projID
    $.ajax({
        type: "POST",
        url: "/loadTweets",
        data: JSON.stringify(project_info),
        contentType: "application/json"
    }).done(function(data){
        $('#spinner').css('visibility', 'hidden');
        for(var i =0; i<data.length; i++){
            loadTweets(data[i]['id'], data[i]['content'],data[i]['relevance'])
        }
    })

    function loadTweets(id, content, relevance){
        var type = "checkbox"

        var tweets_ul = document.getElementById('tweets_ul')

        var tweet_li = document.createElement('li')
        tweet_li.id = id + '-li'
        tweet_li.className = "list-group-item d-flex justify-content-start align-items-center border-start-0 border-top-0 border-end-0 border-bottom-10 rounded-0 mb-2"

        var tweet_content_div = document.createElement('div')
        tweet_content_div.id = id + '-contentdiv'
        tweet_content_div.className = "d-flex align-items-center ml-5"
        tweet_content_div.textContent = content


        var checkboxes_div = document.createElement('div')
        
        //----------
        var related_div = document.createElement('div')
        related_div.className = "form-check"

        var related_input = document.createElement('input');
        related_input.className = "form-check-input related_checkbox"
        related_input.setAttribute("type", type)
        related_input.setAttribute("name", "flexRadioDefault")
        related_input.id = id + "-related_checkbox"

        var related_label = document.createElement('label');
        related_label.className = "form-check-label"
        related_label.setAttribute("for", related_input.id)
        related_label.innerHTML = "Related"

        if(relevance){
            if(relevance == "related"){
                related_input.checked = true
            }
        }
        //------
        
        var unrelated_div = document.createElement('div')
        unrelated_div.className = "form-check"

        var unrelated_input = document.createElement('input');
        unrelated_input.className = "form-check-input unrelated_checkbox"
        unrelated_input.setAttribute("type", type)
        unrelated_input.setAttribute("name", "flexRadioDefault")
        unrelated_input.id = id + "-unrelated_checkbox"

        var unrelated_label = document.createElement('label');
        unrelated_label.className = "form-check-label"
        unrelated_label.setAttribute("for", unrelated_input.id)
        unrelated_label.innerHTML = "Unrelated"

        if(relevance){
            if(relevance == "unrelated"){
                unrelated_input.checked = true
            }
        }
        //------
        related_div.append(related_input)
        related_div.append(related_label)
        unrelated_div.append(unrelated_input)
        unrelated_div.append(unrelated_label)

        checkboxes_div.append(related_div)
        checkboxes_div.append(unrelated_div)

        tweet_li.append(checkboxes_div)
        tweet_li.append(tweet_content_div)

        tweets_ul.append(tweet_li)

    }

    //save relevance:
    var button_save_tweets = document.getElementById("saveRelavance")
    button_save_tweets.onclick = function(){
        var relevance_arr = []
        $("#tweets_ul .related_checkbox").each(function() {
            var tweet_id = $(this).attr('id').split('-')[0]
            var checked = $(this).is(":checked")
            if(checked){
                relevance_arr.push({'id': tweet_id, 'relevance': "related"})
            }

        });
        $("#tweets_ul .unrelated_checkbox").each(function() {
            var tweet_id = $(this).attr('id').split('-')[0]
            var checked = $(this).is(":checked")
            if(checked){
                relevance_arr.push({'id': tweet_id, 'relevance': "unrelated"})
            }

        });
        var project_info = {}
        project_info.projectID = projID
        project_info.relevance = relevance_arr
        $.ajax({
            type:"POST",
            url:"/saveRelevance",
            contentType: "application/json",
            data: JSON.stringify(project_info),
            contentType: "application/json; charset=utf-8"
        })
        alert("Saved!")


    }

});
