from fastapi import FastAPI

app = FastAPI(title="HCM202_Proj_BE")


@app.get("/")
def root():
    return {"message": "Welcome to HCM202_Proj_BE API"}
