from flask import Flask, request, jsonify
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer

app = Flask(__name__)

@app.route("/recommended", methods=["POST"])
def recommended_jobs():
    try:
        data = request.json #comes from node.js
        user_skills = " ".join([str(s) for s in data.get("user_skills", [])]) #gets user skill from request JSON and converts them to single string
        jobs = data.get("jobs", []) #extracts job data from json

        job_text = []
        for job in jobs:
            skills = job.get("skills", []) #extract skill from jobs
            flat_skills = []
            for s in skills:
                if isinstance(s, list):
                    flat_skills.extend([str(i) for i in s]) #check if skill itself is a list
                else:
                    flat_skills.append(str(s)) #add nested skill to flat list
            job_text.append(" ".join(flat_skills)) #converts job skills into one text string

        vectorizer = CountVectorizer()
        vectors = vectorizer.fit_transform([user_skills] + job_text) #converts job skill and user skills to vectors

        similarity = cosine_similarity(vectors[0:1], vectors[1:])[0] #returns top matching jobs

        results = []
        for i, score in enumerate(similarity):
            results.append({
                "job_id": jobs[i]["job_id"],
                "score": float(score)
            })

        results.sort(key=lambda x: x["score"], reverse=True) #sorts by highest first
        return jsonify(results[:3])

    except Exception as e:
        print("Python error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001)
