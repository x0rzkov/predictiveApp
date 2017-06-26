from flask import Flask, render_template, redirect, make_response, request
import json
import cPickle
import numpy as np
import pandas as pd
import scipy as sp
import sklearn

app = Flask(__name__)
app.debug=True

def Mbox(title, text, style):
    ctypes.windll.user32.MessageBoxA(0, text, title, style)
   
def loadmodels():

    #Load models
    with open('static/pythonModels/cluster_model.pkl', 'rb') as fid:
         global cluster_model 
         cluster_model = cPickle.load(fid)
    global mean_arr, std_arr, df_corr_matrix
    
    #load the arrays containing mean and std dev values for all features 
    mean_arr = np.load('static/pythonModels/mean_arr.pkl')
    std_arr = np.load('static/pythonModels/std_arr.pkl')
    df_corr_matrix = pd.read_pickle('static/pythonModels/corr_matrix.pkl')
     
         
@app.route("/predictiveApp")
def index():
    loadmodels()
    return render_template("predApp_index.html")
     
@app.route('/prediction', methods=['GET', 'POST']) 
def MakePrediction():
   aloe_vera = float(json.dumps(request.json['herbs']))
   broccoli_powder = 0.0
   detox_green_tea = float(json.dumps(request.json['tea']))
   energy_bar_white_chocolate = 0.0
   fusion_spice_red_tea = 0.0
   ginger_lemon_tea = 0.0
   grounded_garlic_n_ginger = 0.0
   healthsmart_foods_choc_protein = 0.0
   muscle_combat_crunch = 0.0
   oh_yeah_nutritional_shake = 0.0
   power_bar = float(json.dumps(request.json['protein']))
   sprirulina = 0.0
   wheat_grass = 0.0
   
   #Clustering
   cust_spendings = [aloe_vera,broccoli_powder,detox_green_tea,energy_bar_white_chocolate,fusion_spice_red_tea,ginger_lemon_tea,grounded_garlic_n_ginger,healthsmart_foods_choc_protein,
   muscle_combat_crunch,oh_yeah_nutritional_shake,power_bar,sprirulina,wheat_grass]
   
   z_cust_spendings = (cust_spendings - mean_arr) / std_arr
   Xsingle = z_cust_spendings.astype(float)
   Xsingle_rs = Xsingle.reshape(1, 13)
   
   cluster_pred = cluster_model.predict(Xsingle_rs)
   cluster = cluster_pred[0]
   
   ################################################################################################
   #Recommending
   customer_dict = {'Aloe Vera': aloe_vera, 'Detox Green Tea': detox_green_tea, 'Power bar - Banana Strawberry': power_bar}
   customer_spendings = pd.Series(customer_dict)
   all_corr_scores = pd.Series()
   for i in range(0, len(customer_spendings.index)):
        correlation = df_corr_matrix[customer_spendings.index[i]]
        correlation = correlation.map(lambda x: x * customer_spendings.values[i])  #
        all_corr_scores = all_corr_scores.append(correlation)
        sum_all_corr_scores = all_corr_scores.groupby(all_corr_scores.index).sum()
        sum_all_corr_scores.sort_values(inplace = True, ascending = False)
        sorted_scores = sum_all_corr_scores.drop(customer_spendings.index)
        top_scores = sorted_scores.head(3).index.values
    
   return (json.dumps([cluster, top_scores.tolist()]))
      
         
if __name__ == "__main__":
    app.run()
   
