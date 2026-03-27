import pandas as pd
from sklearn.cluster import KMeans

data = pd.DataFrame({
    'humor':[3,5,2],
    'estresse':[2,1,4],
    'sono':[4,5,2]
})

kmeans = KMeans(n_clusters=2, random_state=42)
data['cluster'] = kmeans.fit_predict(data)

print(data)
