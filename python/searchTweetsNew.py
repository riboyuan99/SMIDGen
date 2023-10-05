
import requests
from pprint import pprint
import time
from collections import Counter
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import string
from flask_cors import CORS
from flask import Flask, request
import sys
import json

app = Flask(__name__)


bearer_token = "AAAAAAAAAAAAAAAAAAAAAGmmogEAAAAAEf3Pat%2FwV2Kb1INOGgXQG%2B6suss%3D2VKZ2UFgeRlOL1ydyp8qiQrhcq7Gg6IaiSfDtWKjL7kGogWWKY"
search_url = "https://api.twitter.com/2/tweets/search/recent"

result_cat = {'1552382715982479364': 'Buying up endless shit cause it’s Big Cat Szn 🦁. \n'
                    '\n'
                    'I wanna skip august but Leo Appreciation month can '
                    'stay 😇✨'
}

result_dog = {
    '1557086380999655424': 'Hi Twitter 👋 I’m Wiley Nickel. Democrat running for Congress against Bo Hines in #NC13 - a must win TOSS-UP. He endorsed Trump for ‘24 and says he’s “the greatest president in American history.”\n' +
      '\n' +
      'I have 27K followers.\n' +
      'Bo Hines has 53K\n' +
      '\n' +
      'Can you follow and RT to help me catch up?',
    '1557086234631176197': '@SheHulkOfficial @disneyplus Thank you for taking time out of your busy schedule to stop by and say hi to the INCREDIBLE $VOLT ⚡️⚡️❤️👀🤯🤯🤯🤯🤯🤯🤯 https://t.co/12w9vvFKTJ',
    '1557086047552434177': '@mcamarillo35 Hi',
    '1557085909966671872': '@JunePriv7 Hi',
    '1557085050860183555': 'Ay shout out to God and all the other deities in the universe for doing they job and dishing out sweet sweet karma to that specific person I know about who funny enough someone I know saw you today at DHS and they say Hi 🤣🤣🤣🤣🤣🤣',
    '1557084613922668544': '@andrealucasEEOC @AGAshleyMoody @NAACP @ADL @HSI_HQ @FBI @JustinTrudeau @EmmanuelMacron @INTERPOL_HQ @SecDef @TheJusticeDept @hrw @UN_HRC @HRC @ACLUFL @ACLU @NAACP_LDF @KSonderlingEEOC @USEEOC @TheFlaBar @DHSgov @FCC @DerrickNAACP @16thSMA @AAguilarMPD @ACLUTx @ACLU_NorCal @ACLUVA @ACLU_NC @ACLUofMichigan @ACLU_Mass @AGAlanWilson @Georgia_AG @NevadaAG @AGRutledge @EEOCChair @FBIMiamiFL @IRS_CI @USAttyKing @POTUS @AshleyMoodyFL @INTERPOL_Cyber @AOC @katieporteroc @valdemings @RValdesMPD Hi,\n' +
      '\n' +
      'Andrea Lucas knows it was Carlos Aguirre who obtained sex footage of everyone involved in my ongoing whistleblower case\n' +
      'She’s working with him and told him to get the sex footage of state attorney generals on the USA including Ashley moody.',
    '1557084107355705345': '@cupofcarliejo Hi',
    '1557083756720259075': '@simgurujessica Torque says Hi 😊 https://t.co/u260I1EKXz',
    '1557083647223640065': '@Happydog___ Hi 😌',
    '1557083640412000256': 'See our latest Honolulu, HI #IT #InformationTechnology job opportunity and click the link in our bio to apply: Tier II Helpdesk at SAIC',
    '1557083597844217857': 'All the money being spent on developing AI could be better spent on education to promote HI.',
    '1557083586909683713': '@thecockneycrew1 Hi sweetie ❣️❣️❣️',
    '1557083552826769411': "@miss_sparkles11 Aaww what a cutie hi Titus nice to meet you you're going to love Daisy and Cooper their cute to ❤❤❤🐕🐕🐕 https://t.co/YrksxgVl8r",
    '1557083507964477443': '@skaijackson hi my friend how are you doing today on this fine Tuesday evening',
    '1557082427272544257': '#SanFrancisco I have arrived. Come say hi :)  #datesf #sfdate #fmty #fm2u',
    '1557081431460835328': '@Dandelionh3art Hi beautiful friend',
    '1557081041772298240': 'Yikes... Full 5 bars of service speed test on Kauai, HI.\n' +
      '\n' +
      '@ATT @Speedtest https://t.co/OezbRSV3zc',
    '1557080695846998016': '@vfsglobalcare Hi there, am traveling to Netherlands for a business meeting on 9/11 but hasn’t been able to get an in person visa appointment any time near my travel. All centers are full, is there any chance you can help me get an appointment to allow my travel?',
    '1557080146116546566': 'This week, it’s Tomato Tuesday 🍅\n' +
      '\n' +
      '🍅Who’s racing East Nashville Tomato 5K this weekend and/or heading to the Tomato Art Fest?!\n' +
      '\n' +
      '🍅Be sure to say hi at both! We’ll be cheering on racers &amp; offering AC to overheated Fest goers!! \n' +
      '\n' +
      '🍅Need some gear to tackle the day? We got you! https://t.co/0rPMGcXRbn',
    '1557079667680481281': '@kimmarinesis Hi beautiful Kimmy ♥️🥰',
    '1557078698557308928': '@AZ_Brittney Hi',
    '1557078320986165249': '@BumbleTus Luthien says hi! https://t.co/sf6ZTo4NFh',
    '1557078300798947329': 'Hi all my Twitter kitty pals! Wanted to wish you all the happiest international cat day!Susan c.',
    '1557078280930574336': 'Kills me knowing I won’t be in HI with my friends and other good people on Friday but I know they’ll have the best time and I’ll be there in spirit. 🌼',
    '1557077951652380673': 'Hi everyone. \n' +
      'We’ve been a little quiet because \n' +
      'I found another lump on D.\n' +
      'Taking her to the Onco on Thursday. \n' +
      'My girl is doing well overall, \n' +
      'but good vibes appreciated.🥺🧡  -Dh\n' +
      '\n' +
      '#Gingerlicious\n' +
      '#CancerWarrior \n' +
      '#FuckCancer https://t.co/64Ot9dZMIK',
    '1557077627856334850': 'If jobs with titles like "Senior Station Engineer" sound appealing to you, follow us to hear about these types of opportunities in #Haleiwa, HI. #Engineering',
    '1557077543471259648': '@Fe_Fi_Fiona @madisonhornok Hi! I’m an LGBTQIA2S+ candidate, &amp; I proudly display my support of the LGBTQIA2S+ community on my website. I also care deeply about creating systems that work for all of us. \n' +
      '\n' +
      'Check out our website at https://t.co/320IfRCoEx. Happy to answer questions. I’d love to have your vote!',
    '1557077511812546562': "@katalva3 Hi my sweet friend Kat, while you could very well be right, a lot of people seem to feel Meadows is the inside informant, trying to save his own ass !!  Can't wait to find out who rolled on trump !!\n" +
      'TTYL🥰!!!',
    '1557077404899745797': 'Well hi there https://t.co/4ZzIg8HD5c',
    '1557077302265221120': '@ottoscreams Hi Otto sweet cake! My very favorite Twitter kitty pal! I love all my pals but a kitty I used to have looked like you! Have a good one,darling!',
    '1557076773489328129': '@dkwestfall1 @mynovelyear Hi Irene. Followed📚✅',
    '1557076769378693120': 'Would ever deserve to bear. \n' +
      '\n' +
      'Martín and Carlos rest side by side at the Holy Sepulcher Cemetery. Two brothers, two suicides. \n' +
      '\n' +
      'These graves were naked around Easter, but I went to say hi and pledge “Not me.” \n' +
      '\n' +
      'Please hurry, people.',
    '1557076465186897920': "@whatifisaidit Hi GG, Yeah...we're all worried about trump and you Miss Lindsey !!  Can't wait till Georgia's done with you...I think you're gonna like prison !",
    '1557076401047556096': "@PCHDaniielleLam hi danielle so how are you do you have what I've been looking for text me back or just give me a call ok my number is 602 299 9859 ok",
    '1557076394873602051': 'Ranger Roy rest time . Drop by and say hi or like and will e tweeting and answering tweets  and might drop a song or two #RRmusicman 🌻💎💚💚',
    '1557076270759813120': '@gmf1369 @jimboneberg @amberluvsblue @PLITIQUE @inquisitiveace @staffan_broman @greggschuder @ReReloveslaughs @DanaNicoleHaley @CathyCatbeen057 @Hi_I_am_August @jetaimemakia @tailoredgene @Kendra979969 @DawsonKing_ Followed all.',
    '1557076219987841025': '@abby_abigail02 hi',
    '1557076108650094594': '@Emywinst Hi 💙',
    '1557076068585992193': "Hi Vicki I'm looking at you right now. What kind of gripe does the Latinos have? It's  not with us. You are right we are peace makers. https://t.co/ffR4jdfiMk",
    '1557076060482723840': 'It’s #CupcakeDay? Spoil me with cupcakes!!! Maybe @CupcakKe_rapper will say hi too!',
    '1557075834992721920': '@MzKatieCassidy @InspireByDoing @MzKatieCassidy hi Katie it’s Jared from fan expo Boston 2017 on my twitter https://t.co/oz0krRtTfq',
    '1557075637889708033': 'Hi everyone! Let’s support each other on TikTok🥰 everyone link your tiktok below so we can all follow each other #ugccommunity #ugc #ugcwork https://t.co/VxT6bM1CBh',
    '1557075521363755008': 'Hi pretties 🖤 https://t.co/Y2HhMjDAx1',
    '1557075281789214720': '@saferprint @CherylHouser8 @SchmollSandy @Elaineplaywrite @ZoeyZoeAz @ladyindrak @gbarbie1948 @auberon135 @fraterfdisk @datsyuklover @MexicanTalking @Velvetviolet131 @Air_Jess_G6 @AReliability001 @Felix147MJ @bkat5150 Hi, Safer and all. #SlavaUkraini https://t.co/Ay5jOMwWXN',
    '1557073979503812609': '@SnapSupps_Tammy Hi Tammy! Here is my portfolio https://t.co/nWrWdi0XgQ',
    '1557073740176826368': 'Hi. I’d love to be 1. https://t.co/itqN2NQ8q0',
    '1557073411414757376': '@imbluesparrow @RichardGrenell @RalstonReports @GovSisolak Hi! It appears you’re in a cult! Press -1- to speak with a sane American citizen, or -2- to continue on your path to lunacy. https://t.co/fDTQtX85EG',
    '1557073330250948608': '@Happydog___ Hi there!!!',
    '1557073078227697664': '@JessicaSmock3 Hi sexy https://t.co/RFbjQQnIDA',
    '1557072909549465601': '@mono_golira_ hi brah'
  }

def nltk_filter(str):
    str = str.lower()
    stop_words = set(stopwords.words('english'))
    word_tokens = word_tokenize(str)
    
    filtered_sentence = [w for w in word_tokens if not w.lower() in stop_words]
    filtered_sentence = []
    
    for w in word_tokens:
        if w not in stop_words:
            filtered_sentence.append(w)

    return filtered_sentence

# Strip symbols.
def strip_symbols(str):
    str = str.replace("\\n", "")
    str = str.replace("&amp;", "")
    str = str.replace("’", "")
    str = str.replace("”", "")
    str = str.replace("“", "")
    # Characters to replace
    for char in string.punctuation:
        str=str.replace(char,'')
    return str

def bearer_oauth(r):
    """
    Method required by bearer token authentication.
    """

    r.headers["Authorization"] = f"Bearer {bearer_token}"
    r.headers["User-Agent"] = "v2FullArchiveSearchPython"
    return r

def connect_to_endpoint(url, params):
    response = requests.request(
        "GET", search_url, auth=bearer_oauth, params=params)
    print(response, flush=True)
    if response.status_code != 200:
        raise Exception(response.status_code, response.text)

    return response.json()

@app.route("/tweets",methods=["GET","POST"])
def get_tweets():

    # # Get search parameters from nodejs server
    search_params = request.get_json()


    keyword_arr = search_params['keyword_arr'].split(' ')
    counts = int(search_params['counts'])
    api_response = []
    hit_terms = []
    no_results = []
    for tz in range(len(keyword_arr)):
        # API query parameters.
        query_params = {'query': '%s lang:en -birthday -is:retweet' % keyword_arr[tz],  # "election lang:und -is:retweet",
                        'tweet.fields': 'public_metrics,created_at,lang,source,context_annotations',
                        'max_results': 10,
                        'expansions': 'author_id',
                        'user.fields': 'name,username,location'}  # information for users

        # Call the twitter API with the given paramaters. Save the result temporarily.
        try: 
            pprint(search_url)
            pprint(query_params)
            rescheck = connect_to_endpoint(search_url, query_params)
        except:
            return json.dumps({"result":"Too Many Requests", "suggest_keywords": None})


        # If the response produced results, append them to an array, otherwise ignore it.
        if(rescheck['meta']['result_count'] != 0):
            api_response.append(rescheck)
            hit_terms.append(keyword_arr[tz])
        else:
            no_results.append(keyword_arr[tz])

 
    # Required - Full-archive queries have a 1 request / 1 second limit
    if(len(keyword_arr)>1):
        time.sleep(1.2)

    count = 0
    result = {}

    if len(api_response) > 0:
        for x in range(len(api_response)):
            for tweet_info in api_response[x]['data']:
                if(count < counts):
                    result[tweet_info['id']] = tweet_info['text']
                    count = count + 1
                else:
                    suggestion_list = find_most_common(result.values(), 5, keyword_arr)
                    suggestion_str = ' '.join(suggestion_list)
                    return json.dumps({"result":result, "suggest_keywords": suggestion_str})

    # result = result_dog
    # suggestion_str = "just a test"
    suggestion_str = ""
    # will never reach this line.
    return json.dumps({"result":result, "suggest_keywords": suggestion_str})


def find_most_common(list_of_strings, frequency, keywords):
    tweet_text_string =  " ".join(list_of_strings)
    tweet_text_string = strip_symbols(tweet_text_string)
    tweet_text_string = nltk_filter(tweet_text_string)
    word_count = dict(Counter(tweet_text_string).most_common(frequency))
    for key in keywords:
        word_count.pop(key, None)
    
    suggestion = list(word_count.keys())
    return suggestion

if __name__ == "__main__":

    # keywords = ['cat', 'dog']
    # counts = 10
    # result = get_tweets(keywords,counts)

    # suggestion = find_most_common(list(result.values()), 4, keywords)
    # print(result)
    # pprint(suggestion)

    cli = sys.modules['flask.cli']
    cli.show_server_banner = lambda *x: None
    print(" ** API running. **")
    app.run(port=8081, debug=False)
    #nohup python searchTweetsNew.py &> apilog.out &