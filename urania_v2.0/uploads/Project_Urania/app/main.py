# ------------------------------
# main.py
# Entry point of the Urania app
# ------------------------------

# Import FastAPI framework
from fastapi import FastAPI, Request, Form

# Import HTML response class
from fastapi.responses import HTMLResponse

# Import Jinja2 template engine
from fastapi.templating import Jinja2Templates

from fastapi.staticfiles import StaticFiles

# Import our compatibility engine
from app.engine import compute_compatibility

# ------------------------------
# Create FastAPI app instance
# ------------------------------
app = FastAPI()

# Static files (favicon, js, css)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# ------------------------------
# Configure templates directory
# ------------------------------
templates = Jinja2Templates(directory="app/templates")

# ------------------------------
# Temporary in-memory storage
# (used for v0 only)
# ------------------------------
latest_result = {}

# ------------------------------
# Home route - Input screen
# ------------------------------
@app.get("/", response_class=HTMLResponse)
async def input_page(request: Request):
    # Render the input form page
    return templates.TemplateResponse(
        "input.html",
        {"request": request}
    )

# ------------------------------
# Results route - Compute logic
# ------------------------------
@app.post("/results", response_class=HTMLResponse)
async def results_page(
    request: Request,

    # Person 1 inputs
    you_dob: str = Form(...),
    you_time: str = Form(...),
    you_place: str = Form(None),
    you_lagna: str = Form(None),

    # Person 2 inputs
    partner_dob: str = Form(...),
    partner_time: str = Form(...),
    partner_place: str = Form(None),
    partner_lagna: str = Form(None),
):
    # Collect inputs into dictionaries
    you = {
        "dob": you_dob,
        "time": you_time,
        "place": you_place,
        "lagna": you_lagna,
    }

    partner = {
        "dob": partner_dob,
        "time": partner_time,
        "place": partner_place,
        "lagna": partner_lagna,
    }

    # Call compatibility engine
    result = compute_compatibility(you, partner)

    # Store result temporarily (v0 approach)
    global latest_result
    latest_result = result

    # Render results page
    return templates.TemplateResponse(
        "results.html",
        {
            "request": request,
            "you": you,
            "partner": partner,
            "result": result,
        }
    )

# ------------------------------
# Share route - Poster view
# ------------------------------
@app.get("/share", response_class=HTMLResponse)
async def share_page(request: Request):
    # Render poster / share page
    return templates.TemplateResponse(
        "share.html",
        {
            "request": request,
            "result": latest_result,
        }
    )
