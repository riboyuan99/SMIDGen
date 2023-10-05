# SMIDGen

A web application that allows users to pull in tweets based on keywords, determine relavence of the given tweets, and use AI and machine
learning to recommend new keywords based on the tweets selected as relavant. Project owners will be able to create, delete, and rename projects, as well as manage access to projects by other users.

# To get current state running (locally):
1. Install [Node](https://nodejs.org/en/)
2. Install [Python](https://www.python.org/) with [pip enabled](https://pip.pypa.io/en/stable/installation/)
3. Install [Git](https://git-scm.com/downloads)
4. `git clone https://github.com/Sensify-Lab/SMIDGen.git`
7. Create a Python virtual environment`python3 -m venv smidgen-venv`.  
   (Why do we need a virtual environment: https://stackoverflow.com/questions/23948317/why-is-virtualenv-necessary)
9. Activate virtual environment: `source smidgen-venv/bin/activate`
10. Install all packages: `pip install numpy flask flask-cors requests nltk pandas scikit-learn transformers`     
You may encounter [an error](https://github.com/Sensify-Lab/SMIDGen/blob/main/images/install_transformer_error_rust.png)("can't find Rust compiler") while installing transformers(ref: https://github.com/huggingface/transformers/issues/2831).       
To fix this:   `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`.   
    [enter "1" to proceed with installation](https://github.com/Sensify-Lab/SMIDGen/blob/main/images/enter_1.png)    
    `source "$HOME/.cargo/env"`.    
 `pip install transformers`(might take a while)
13. [Download nltk stopwords and punkt package](https://github.com/Sensify-Lab/SMIDGen/blob/main/images/download_nltk_package.png): `python -m nltk.downloader punkt stopwords`.   

14. Run the Python server: `nohup python SMIDGen/python/searchTweetsNew.py &`.    
    Note that the output is redirected to "nohup.out"
5. `cd SMIDGen`
6. `npm install express firebase firebase-admin`
15. In app.js, [comment line 400 and uncomment line 401](https://github.com/Sensify-Lab/SMIDGen/blob/main/images/toRunLocally.png)    

15. Run the SMIDGen server: `node app.js`
16. Access the website: http://127.0.0.1:8080

(Tip: To find the Python server: `ps -fA | grep python`)

# To get current state running (remotely):
## Make sure you either using UDEL wifi or connected to UDEL VPN:
1. [Log into smidgen.cis.udel.edu.](https://github.com/Sensify-Lab/SMIDGen/blob/main/images/login.png)   

2. Clone the repository: `git clone https://github.com/Sensify-Lab/SMIDGen`
>***Note:*** you will need to use a [GitHub Personal Access Token](https://github.com/settings/tokens) for the password field to clone through SSH. Your account password will NOT work.
4. Create virtual environment: `python3 -m venv smidgen-venv`
5. Activate virtual environment: `source smidgen-venv/bin/activate`
6. `pip install numpy flask flask-cors requests nltk pandas scikit-learn transformers`
7. `python -m nltk.downloader punkt stopwords`
7. `cd SMIDGen`
8. `npm install`
9. `npm install --save firebase-admin@10.3`.  
    Question: Why do we need to specify firebase-admin's version?    
    Answer: The node on udel server is too old for newest firebase-admin. So if we do `node app.js` without this step, it will give us [an error](https://github.com/Sensify-Lab/SMIDGen/blob/main/images/node%20too%20old.png)     
 
    I tried to upgrade npm(node) but failed, because I [don't have the permission to do so](https://github.com/Sensify-Lab/SMIDGen/blob/main/images/fail_to_upgrade_npm.png)     
    Thus I have to downgrade firebase-admin:) 
10. `cd ..`
11. `nohup python SMIDGen/python/searchTweetsNew.py &`
12. `cd SMIDGen`
13. `nohup node app.js &`
14. Visit https://smidgen.cis.udel.edu



Firebase: https://console.firebase.google.com/project/smidgen-5f8b9/overview

