from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import httpx
import os
import tempfile
from PIL import Image
import io
from gradio_client import Client, handle_file
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
FASHNAI_API_KEY = os.getenv("FASHNAI_API_KEY", "FASHNAI_API_KEY_HERE")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


class TryOnRequest(BaseModel):
    person_image: str  # base64
    garment_image: str  # base64
    garment_description: str = "a shirt"


def decode_image_to_file(base64_str: str, suffix: str = ".png") -> str:
    image_data = base64.b64decode(base64_str)
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    image.save(tmp.name, format="PNG")
    return tmp.name


def call_idm_vton(person_path: str, garment_path: str, garment_desc: str) -> str:
    client = Client("yisol/IDM-VTON")
    result = client.predict(
        dict={"background": handle_file(person_path), "layers": [], "composite": None},
        garm_img=handle_file(garment_path),
        garment_des=garment_desc,
        is_checked=True,
        is_checked_crop=True,
        denoise_steps=40,
        seed=42,
        api_name="/tryon"
    )
    with open(result[0], "rb") as f:
        return base64.b64encode(f.read()).decode()


async def call_fashn_ai(person_path: str, garment_path: str) -> str:
    with open(person_path, "rb") as f:
        person_b64 = base64.b64encode(f.read()).decode()
    with open(garment_path, "rb") as f:
        garment_b64 = base64.b64encode(f.read()).decode()

    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
            "https://api.fashn.ai/v1/run",
            headers={"Authorization": f"Bearer {FASHNAI_API_KEY}"},
            json={
                "model_image": f"data:image/png;base64,{person_b64}",
                "garment_image": f"data:image/png;base64,{garment_b64}",
                "category": "tops",
            }
        )
        data = response.json()
        if "id" not in data:
            raise HTTPException(status_code=502, detail=f"fashn.ai error: {data}")
        prediction_id = data["id"]

        for _ in range(60):
            import asyncio
            await asyncio.sleep(3)
            poll = await client.get(
                f"https://api.fashn.ai/v1/status/{prediction_id}",
                headers={"Authorization": f"Bearer {FASHNAI_API_KEY}"}
            )
            poll_data = poll.json()
            if poll_data["status"] == "completed":
                image_url = poll_data["output"][0]
                img_response = await client.get(image_url)
                return base64.b64encode(img_response.content).decode()
            elif poll_data["status"] == "failed":
                raise HTTPException(status_code=500, detail="fashn.ai generation failed")

    raise HTTPException(status_code=504, detail="fashn.ai timeout")


@app.get("/health")
def health():
    return {"status": "ok", "service": "vton-saas"}


@app.post("/tryon")
async def tryon(request: TryOnRequest, x_api_key: str = Header(...)):
    # Validate API key
    result = supabase.table("shops").select("*").eq("api_key", x_api_key).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid API key")

    shop = result.data[0]

    # Check usage limit for starter
    if shop["plan"] == "starter" and shop["usage_count"] >= shop["usage_limit"]:
        raise HTTPException(status_code=429, detail="Monthly usage limit reached. Upgrade to Pro.")

    # Decode images
    person_path = decode_image_to_file(request.person_image)
    garment_path = decode_image_to_file(request.garment_image)

    try:
        if shop["plan"] == "pro":
            result_image = await call_fashn_ai(person_path, garment_path)
        else:
            result_image = call_idm_vton(person_path, garment_path, request.garment_description)

        # Increment usage count
        supabase.table("shops").update(
            {"usage_count": shop["usage_count"] + 1}
        ).eq("id", shop["id"]).execute()

        return {"result_image": result_image, "plan": shop["plan"]}

    except Exception as e:
        print(f"TRYON ERROR: {repr(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/auth/signup")
async def signup(data: dict):
    email = data.get("email")
    password = data.get("password")
    shop_name = data.get("shop_name")

    auth_response = supabase.auth.sign_up({"email": email, "password": password})
    user_id = auth_response.user.id

    import secrets
    api_key = secrets.token_urlsafe(32)

    supabase.table("shops").insert({
        "id": user_id,
        "email": email,
        "shop_name": shop_name,
        "plan": "starter",
        "api_key": api_key,
        "usage_count": 0,
        "usage_limit": 50,
    }).execute()

    shop = supabase.table("shops").select("*").eq("id", user_id).execute()

    return {"user": shop.data[0], "message": "Account created"}


@app.post("/auth/login")
async def login(data: dict):
    email = data.get("email")
    password = data.get("password")

    auth_response = supabase.auth.sign_in_with_password({"email": email, "password": password})
    user_id = auth_response.user.id

    shop = supabase.table("shops").select("*").eq("id", user_id).execute()

    return {"user": shop.data[0], "token": auth_response.session.access_token}