import nltk
from nltk.corpus import stopwords
import string
nltk.download('omw-1.4')
from nltk.stem import WordNetLemmatizer
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from pprint import pprint

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.ensemble import VotingClassifier
from sklearn.model_selection import train_test_split
from sklearn import svm
from sklearn.metrics import accuracy_score

lemma = WordNetLemmatizer()
stop = set(stopwords.words('english')) 
exclude = set(string.punctuation)

def clean(doc):
    stop_free = " ".join([i for i in doc.split() if i not in stop]) # remove stop words
    punc_free = ''.join(ch for ch in stop_free if ch not in exclude) # remove punctuation
    normalized = " ".join(lemma.lemmatize(word) for word in punc_free.split()) # group words with similar meaning
    return normalized

def train(input, is_relevant, embedding_type, classifier):


    Label = "is_work"
    InputDataCol = 'sentences'
    embedding_type = "TF-IDF"
    classifier = "VT"


    data_df = None
    X_train = None
    X_test = None
    y_train = None
    y_test = None
    #---------------------BERT embeddings----------------------
    # The "all-mpnet-base-v2" model provides the best quality
    if embedding_type == "BERT":
        model = SentenceTransformer("all-mpnet-base-v2")
        InputData_embeddings_BERT = model.encode(InputData)

        BERT_embeddings_df = pd.DataFrame(np.row_stack(InputData_embeddings_BERT), index = InputData)
        BERT_embeddings_df[Label] = is_work
        data_df = BERT_embeddings_df
        X = data_df.drop(columns = [Label], axis = 1) # axis: specified column
        Y = data_df.loc[:,Label]
        X_train, X_test, y_train, y_test = train_test_split(X, Y, test_size=0.3)

    # #---------------------TF-IDF embeddings----------------------
    if embedding_type == "TF-IDF":
        data_df = pd.DataFrame({InputDataCol: InputData, Label: is_work})
        train, test = train_test_split(data_df, test_size=0.2)

        tf_idf_vectorizer = TfidfVectorizer(analyzer='word', stop_words='english')

        train_tfidf = tf_idf_vectorizer.fit_transform(train[InputDataCol])
        X_train = pd.DataFrame(train_tfidf.todense(), columns=tf_idf_vectorizer.get_feature_names())
        y_train = train[Label]

        test_tfidf = tf_idf_vectorizer.transform(test[InputDataCol])
        X_test = pd.DataFrame(test_tfidf.todense(), columns=tf_idf_vectorizer.get_feature_names())
        y_test = test[Label]

    #-------------------------Classfier----------------------------
    if classifier == "SVC":
        clf = SVC(kernel='rbf', class_weight='balanced', probability=True)
    if classifier == "SVC-Sweep":
        clf = SVC(kernel='poly', class_weight='balanced', C=1, decision_function_shape='ovo', gamma=0.0001,
                probability=True)
    if classifier == "LSVC":
        clf = svm.LinearSVC()
    if classifier == "RF":
        clf = RandomForestClassifier(n_jobs=-1, class_weight="balanced")
    if classifier == "GBT":
        clf = GradientBoostingClassifier(n_estimators=100, learning_rate=1.0, max_depth=1, random_state=0)
    if classifier == "VT":
        clf1 = SVC(kernel='rbf', class_weight="balanced", probability=True)
        clf2 = RandomForestClassifier(n_jobs=-1, class_weight="balanced")
        clf3 = GradientBoostingClassifier(n_estimators=100, learning_rate=1.0, max_depth=1, random_state=0)
        clf = VotingClassifier(estimators=[('svc', clf1), ('rf', clf2), ('gbt', clf3)], voting='soft', weights=[1, 1, 1])


    #----------------------Train the model and then make prediction----------------------
    clf = clf.fit(X_train, y_train)
    predictions = clf.predict(X_test)

    #----------------------Accuracy score-----------------
    score = accuracy_score(y_test, predictions)
    
    return score



if __name__ == "__main__":

    InputData = ['I got tonne shit worry especially becoming Assisstant Manager work', 'I need start working big time', 'I work much work I stuff house I done anything awhile', 'As I enough stress ahead start school I constantly worry employment', 'Work unproductive usual', 'He hasnt worked week schedule screwed up extra time study', 'First work bos freaked bretts dad feel bad trying empathize', 'Something work best friend going down need someone call say grandfather died', 'Right crazy busy trying get apartment together I working too', 'Our roomie still heard job interview month almost since got fired', 'Work great top that Ive hardly spent anytime boyfriend', 'top im work deal bratty kid', 'I need think thing order job', 'bos bad person', 'Leadership work They always favorite I hate it', 'long hour work weekend', 'Looking Job', 'looking new job', 'looking work stressed lately', 'loosing job homeschooling kid life general relationship suck', 'Losing job bc corona situation', 'losing pay job', 'Lost job I know rent paid', 'lot problem work', 'lot work pressure past week need relax make plan let relax together', 'man spent craking wip work', 'man job unreal unreasonable demand customer idiot', 'manager want change vacation again', 'I really need emotional pick up', 'Your Actual Problem Anxiety restless dissatisfaction either circumstance unfulfilled emotional requirement produced stress', 'During emotional bullshit another thing worry about', 'You feel like control emotion', 'I feel pain though different way bad u Depression People', 'You experiencing severe stress trying guard disappointment', 'Dont hate stressed out know stressing fault', 'cry day month since dog Rocky died', 'much anxiety stress mean ive always it getting harder harder ignore', 'I really depressed low breakup', 'Its causing lot turmoil within me I really know deal it', 'I think im suffering depression something Ive sad lately', 'Trying cope condition think beyond capability led considerable anxiety stress', 'It hard concise big issue me I settled issue', 'lot list', 'terrible time planning dinner tonite please suggestion', 'At moment life', 'shelter place order driving insane able go', 'Being shut virus', 'Being stuck inside due coronavirus', 'unproductive', 'buying house pretty stressful', 'Coronavirus happening I cant leave house', 'Difficulty installing security protection multiple device', 'everything stress', 'everything stress lately', 'everything im overwhelmed help time urgggg', 'feel like everything', 'getting dinner ready christmas incredible challenge', 'getting rid clutter making home cozy', 'Ive trying potty train 2 year old seeming understand', 'ive worrying regain control father house', 'dealing managing workhome life balance feeling guilty it', 'dealing husband increasing confusion', 'family stuff nothing worry about', 'issue fam', 'stressed getting ready baby', 'stressed taking care kid', 'kid sick miss work', 'lately stressful teething infant', 'need money pay bill', 'need find job asap get money', 'needed know though charging credit card would good idea', 'overdrew bank account 200 dollar', 'I recently bought 5th wheel rv sure I have', 'recently made large purchase found financially unstable', 'stress money wish more', 'totaled car need another car asap', 'want earn money', 'able pay car payment last month due holiday', 'went pick medicine insurance denied tried call company', 'I wish I could start new job sooner 6th I NEED MONEY', 'I wish I earned enough home I could continue selfisolating']

    is_work = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    # Embedding type: BERT, TF-IDF
    # Classifier: SVC, SVC-Sweep, LSVC, RF, GBT, VT
    score = train(InputData, is_work, "BERT", "VT")
    print("Score: ", score)

