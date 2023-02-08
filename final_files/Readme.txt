*  
Description:
Our code includes three different aspects:
1. Data collection and preprocessing 
2. Model building
3. Application building
All of the required files can be found in the single directory on github.


Installation:
Google Colab can be used for running the code for data collection, preprocessing and model building. In addition to all the libraries installed in Google Colab by default, you would need to install Bertopic, and VaderSentiment. They can easily be installed using pip as shown below:
* pip install vadersentiment==3.3.2 
* pip install bertopic==0.12.0


If not using Google Colab then python 3.8 and higher versions are recommended.


→ Data collection and preprocessing: For data collection, we used Pushshift API to scrape the Reddit posts and top 10 comments for each post. Then we performed text cleaning for both the posts and the comments.
1. You need to specify the subreddit, start date, and end date, data_collection_updated.py script can be used to collect comments and the URL content if it exists.
2. The posts and comments are cleaned using the datacleaning.py script. It mostly includes removing whitespaces, special characters, hyperlinks, stop words, punctuations, doing lemmatization.


→ Model building: The output from the first step is used as the input for this step. The file name has to be specified in the notebook titled “Subreddit_Modelling.ipynb”. There are various outputs from this notebook including:
1. Topic frequency file (csv)
2. Topics over time file (csv)
3. Representative documents file (csv)
4. Comments sentiment file (csv)
5. Word frequency barchart (html)
6. Intertopic distance visualization (html)
7. Comment sentiment visualtization (html)
8. Topics over time visualization (html)
These files are then used in the next step to create the final app.


→ Application building:  The web application has been built using React, a javascript web framework. Various other libraries such as D3, Moment and Lodash have been used to provide utility. To install the visualization, the following steps can be taken:-
1. Ensure that ‘node package manager’ has been installed. To check this, run ‘npm --version’. If an error occurs, install the npm from https://nodejs.org/en/download/
2. Next, change the directory to ‘frontend’. This directory holds all of the code for the web application.
3. Run the command ‘npm i’ while in the frontend directory. This will install all the dependencies required for the web app. After the dependencies have been installed, the web app can be run.


Execution:
The given code has to be executed in the order:
1. data_collection_updated.py
2. datacleaning.py
3. Subreddit_Modelling.ipynb
4. Frontend


After getting the csv and html files from the Model building step, we are ready to use them in our visualization. Use the files ‘Topics over time file’ and ‘Comments sentiment file’ and run them through the file ‘TP_Data_Processing_Frontend.ipynb’ to process the data for the web app. Then copy the output csv generated into the ‘frontend/src/data’. Use the html files generated in the Model building step and copy them in ‘frontend/public’ by creating an appropriate folder.


After installation the files can be run. To start the web app, change directory to ‘frontend’ and run the command ‘npm start’. This will run the web app locally in your browser where you will be able to see the visualization for the data.