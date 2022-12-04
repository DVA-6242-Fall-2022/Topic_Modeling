import pandas as pd
from psaw import PushshiftAPI
import datetime as dt
from joblib import Parallel, delayed
from newspaper import Article
from tqdm import tqdm
import numpy as np

# Initialize PushShift
api = PushshiftAPI()

# Define columns you would like from submission
filters = ['id', 'subreddit', 'author', 
           'created_utc', 'domain', 'url', 
           'title', 'num_comments', 'selftext', 
           'score'] 

# Define the start and end date for data collection
start_date = int(dt.datetime(2020, 1, 1).timestamp())
end_date = int(dt.datetime(2022, 9, 30).timestamp())

# List of subreddits from where you would like to collect data
subreddit_list = ['worldnews']
subreddits = ','.join(subreddit_list)

# Function to collect posts/submissions
def get_submission_data(filters, start_date, end_date, 
                   subreddits, size=None, 
                   num_comments=None, score=None, 
                   len_selftext=None):
    api_request_generator = api.search_submissions(subreddit=subreddits, num_comments = num_comments, 
                                                   score = score, filter=filters, 
                                                   after=start_date, before=end_date, 
                                                   sort="score:desc", size=size)
    submission_df = pd.DataFrame([submission.d_ for submission in api_request_generator])
    if len(submission_df) == 0:
        print("Empty Dataframe")
        return
        
    submission_df["created_utc"] = pd.to_datetime(submission_df["created_utc"], unit='s')
    submission_df = submission_df.sort_values(by=['created_utc'], ascending=True)
    if len_selftext:
        submission_df = submission_df[submission_df['selftext'].str.len() > len_selftext]
        
    return submission_df[filters]


df = pd.read_csv("raw_reddit_news_posts.csv")

# Function to append comments to the submission data
def get_comments(subreddit, link_id, limit, comment_length = None):
    api_request_generator = api.search_comments(subreddit=subreddit, 
                                                link_id= link_id,
                                                sort="score:desc", 
                                                filter=["author", "body"], limit=limit)
    
    comments_df = pd.DataFrame([comments.d_ for comments in api_request_generator])
    comment = '...'.join(comments_df["body"])
    if comment_length:
        return comment[0:comment_length]
    else:
        return comment
    

def add_comments_to_df(submission_df, limit=10, comment_length = None, n_jobs=-2):
    comments = Parallel(n_jobs=n_jobs)(delayed(get_comments)(row['subreddit'], 
                                                        row['id'], limit, comment_length) for i, row in tqdm(submission_df.iterrows()))
    return submission_df.assign(comments=comments)

#function to add url content scraped from newspaper library
def get_url_content(url):
  article = Article(url)
        
  try:
      article.download()
      article.parse()
      
      if article.text != '':
          return article.text
      else:
          return "Not Available"
  
  except:
      return "Not Available"


def add_url_content_to_df(df, n_jobs=-2):
    url_contents = Parallel(n_jobs=n_jobs)(delayed(get_url_content)(row['url']) for i, row in tqdm(df.iterrows()))
            
    return df.assign(url_content=url_contents)

n = 100  #chunk row size
list_df = [df[i:i+n] for i in range(0,df.shape[0],n)]
i = 0
for chunk_df in list_df:
  int_df = add_comments_to_df(chunk_df, 20)
  int_df = add_url_content_to_df(int_df)
  if i == 0:
    int_df.to_csv("raw_reddit_news_posts_comments.csv", index=False)
  else:
    int_df.to_csv('raw_reddit_news_posts_comments.csv', mode='a', index=False, header=False)
  print(f"Dataframe: {i} done")
  i = i+1
