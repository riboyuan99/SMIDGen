var tweets = {}
var user_keywords;

$(document).ready(function (){
    $('#spinner').css('visibility', 'hidden');
    var numberOfTweets = document.getElementById("numberOfTweets")
    var search_numOfTweets = "50" // default number of tweets
    
    // When user change number of tweets:
    var oneHundred = document.getElementById("oneHundred")
    oneHundred.onclick = function(e){
        numberOfTweets.textContent = 100
        search_numOfTweets = 100
    }
    var oneFifty = document.getElementById("oneFifty")
    oneFifty.onclick = function(e){
        numberOfTweets.textContent = 150
        search_numOfTweets = 150
    }

    var params = new URLSearchParams(location.search);
    var projID = params.get('projectid')
    var label_link = document.getElementById('label_tweets');
    label_link.href = "/labelTweets?projectid="+projID



    // Get current status:
    var project_info_for_keyword = {}
	project_info_for_keyword.proj_id = projID

    $.ajax({
		type: "POST",
		url: "/getKeyword",
		data:JSON.stringify(project_info_for_keyword),
		contentType: "application/json; charset=utf-8"
	})
    .then(function(data){
        document.getElementById('keywords').value = data
        var project_info = {}
	    project_info.proj_id = projID
        return $.ajax({
            type: "POST",
            url: "/loadTweets_proj",
            data:JSON.stringify(project_info),
            contentType: "application/json; charset=utf-8"
        }).done(function(data){
            for (var key in data){
                loadTweets( key, data[key] );
            }
        })
    })
    

    // Save tweets(todo): 
    var button_save_tweets = document.getElementById("save_tweets")
    button_save_tweets.onclick = function(){

        if(!user_keywords){
            alert("Haven't search tweets yet! Nothing to save")
            return
        }

        var deleteExistingTweets = {}
        deleteExistingTweets.project_id = projID
        $.ajax({
            type: "POST",
            url: "/deleteExistingTweets",
            data: JSON.stringify(deleteExistingTweets),
            contentType: "application/json"
        })
        .then(function(data){
            var save_params = {};
            save_params.keywords = user_keywords
            save_params.project_id = projID
            save_params.save_tweets = tweets
            return $.ajax({
                type: "POST",
                url: "/saveTweets",
                data: JSON.stringify(save_params),
                contentType: "application/json"
            }).done(function(data){
                alert('Tweets saved!')
            })
        })



    };


    // When user click search button:
    var button_search = document.getElementById("search")
    button_search.onclick = function(){
        disable()
        // AJAX request to server:

        var search_param = {};
        user_keywords = document.getElementById("keywords").value
        search_param.keywords = user_keywords
        search_param.numOfTweets = search_numOfTweets
        console.log(search_param)
        $.ajax({
            type: "POST",
            url: "/searchTweets",
            data: JSON.stringify(search_param),
            contentType: "application/json"
        }).done(function(data){
            enable()
            clearTweetsDiv()
            tweets = data['result']
            document.getElementById('keywords').value = user_keywords + " (" + data['suggest_keywords'] + ")"
            if(tweets != "Too Many Requests"){
                for (var key in tweets){
                    loadTweets( key, tweets[key] );
                }
            }else{
                alert("Error: Too Many Requests")
            }
        })
    };

    function clearTweetsDiv(){
        var div = document.getElementById('tweets');
        while(div.firstChild){
            div.removeChild(div.firstChild);
        }

    }
    
    //Load tweets to the "tweets" div
    function loadTweets(id, content){
        var tweets_div = document.getElementById("tweets")
        
        var dashed_line = document.createElement("div")
        dashed_line.className = "hr-line-dashed"

        var tweet_div = document.createElement("div")
        tweet_div.className = "search-result"
        tweet_div.id = id.toString() + "tweet_div"

        var tweet_id = document.createElement("a")
        tweet_id.className = "search-link"
        tweet_id.text = id
        tweet_id.href = "#"
        tweet_id.id = id.toString() + "tweet_id"

        var tweet_content = document.createElement("p")
        tweet_content.textContent = content
        tweet_content.innerHTML = tweet_content.innerHTML.replace(/\n\r?/g, '<br />');
        tweet_content.id = id.toString() + "tweet_content"

        tweet_div.append(tweet_id)
        tweet_div.append(tweet_content)

        tweets_div.append(dashed_line)
        tweets_div.append(tweet_div)
    
    }

    function sleep(ms) {
        return new Promise(resolveFunc => setTimeout(resolveFunc, ms));
    }

    function disable(){
        $('#spinner').css('visibility', 'visible');
        
        $("body").append('<div id="overlay" style="opacity: 0.4; background-color:grey;position:absolute;top:0;left:0;height:100%;width:100%;z-index:999"></div>');
    }

    function enable(){
        $('#spinner').css('visibility', 'hidden');
        $("#overlay").remove();
    }

});





	  
	  