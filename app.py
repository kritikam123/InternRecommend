from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import matplotlib.pyplot as mp
import os
app=FastAPI()

class skillModel(BaseModel):
    data: list

@app.post("/process-skills")
def process_skills(skills: skillModel):
    print("Received skills: ",skills.data)
    data1 = skills.data
    skill_counts = [1] * len(data1)  # each skill has count 1
    mp.bar(data1, skill_counts)
    mp.xlabel("Skills")
    mp.ylabel("Count")
    mp.title("Skills Bar Chart")

    filename = "skills_bar_chart.png"

    mp.savefig(filename)
    mp.close()
    full_path = os.path.abspath(filename)
    print(f"Bar chart saved at: {full_path}")
    return {"message": "Skills received!", "skills": skills.data}
    