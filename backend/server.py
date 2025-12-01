from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import razorpay
import hmac
import hashlib
import secrets
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'dheerghayush_db')]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'dheerghayush-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Razorpay Configuration
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# Brevo (Sendinblue) Configuration
BREVO_API_KEY = os.environ.get('BREVO_API_KEY', '')
BREVO_SENDER_EMAIL = os.environ.get('BREVO_SENDER_EMAIL', '')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

# Configure Brevo API
brevo_configuration = sib_api_v3_sdk.Configuration()
brevo_configuration.api_key['api-key'] = BREVO_API_KEY

# Create the main app
app = FastAPI(title="Dheerghayush Naturals API")

# Root health check endpoint
@app.get("/")
async def root_health():
    return {"status": "healthy", "message": "Dheerghayush Naturals API is running", "version": "1.0"}

# Custom exception handler to ensure JSON responses
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# Create routers
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

# Base Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# User Models (Customer Authentication)
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class UserSignup(BaseModel):
    name: str
    email: str
    phone: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    phone: str

# Admin Models
class AdminUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    password_hash: str
    name: str = "Admin"
    role: str = "admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class AdminLogin(BaseModel):
    email: str
    password: str

class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: dict

# Category Models
class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    image: str
    slug: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class CategoryCreate(BaseModel):
    name: str
    image: str
    slug: str

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None
    slug: Optional[str] = None
    is_active: Optional[bool] = None

# Product Models
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str  # category slug
    weight: str
    price: float
    original_price: float
    image: str
    is_bestseller: bool = False
    description: Optional[str] = ""
    stock: int = 100
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    category: str
    weight: str
    price: float
    original_price: float
    image: str
    is_bestseller: bool = False
    description: Optional[str] = ""
    stock: int = 100

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    weight: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    image: Optional[str] = None
    is_bestseller: Optional[bool] = None
    description: Optional[str] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None

# Order Models
class OrderItem(BaseModel):
    id: str
    name: str
    price: float
    quantity: int
    weight: str
    image: str

class CustomerInfo(BaseModel):
    name: str
    email: str
    phone: str
    address: str
    city: str
    state: str
    pincode: str

class OrderCreate(BaseModel):
    user_id: Optional[str] = None
    customer_info: CustomerInfo
    items: List[OrderItem]
    subtotal: float
    shipping_fee: float
    total: float
    payment_method: str  # "COD" or "RAZORPAY"
    razorpay_payment_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    razorpay_signature: Optional[str] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    order_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None  # Optional for guest checkout
    customer_info: CustomerInfo
    items: List[OrderItem]
    subtotal: float
    shipping_fee: float
    total: float
    payment_method: str
    razorpay_payment_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    order_status: str = "pending"  # pending, confirmed, processing, shipped, out_for_delivery, delivered, cancelled
    payment_status: str = "pending"  # pending, paid, failed
    tracking_events: List[dict] = []
    estimated_delivery: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderStatusUpdate(BaseModel):
    order_status: Optional[str] = None
    payment_status: Optional[str] = None

# Dashboard Models
class DashboardStats(BaseModel):
    total_orders: int
    total_revenue: float
    pending_orders: int
    delivered_orders: int
    total_products: int
    total_categories: int
    total_banners: int = 0

# Razorpay Models
class RazorpayOrderCreate(BaseModel):
    amount: float  # Amount in rupees
    currency: str = "INR"

class RazorpayOrderResponse(BaseModel):
    razorpay_order_id: str
    razorpay_key_id: str
    amount: int  # Amount in paise
    currency: str

class RazorpayVerifyPayment(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

# Banner/Hero Slide Models
class Banner(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    subtitle: str
    description: str
    bg_color: str = "#4CAF50"
    image: str
    button_text: str = "Shop Now"
    button_link: str = "/products"
    is_active: bool = True
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BannerCreate(BaseModel):
    title: str
    subtitle: str
    description: str
    bg_color: str = "#4CAF50"
    image: str
    button_text: str = "Shop Now"
    button_link: str = "/products"
    order: int = 0

class BannerUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    bg_color: Optional[str] = None
    image: Optional[str] = None
    button_text: Optional[str] = None
    button_link: Optional[str] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None

# Address Models
class Address(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    email: str
    phone: str
    address: str
    city: str
    state: str
    pincode: str
    is_primary: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AddressCreate(BaseModel):
    name: str
    email: str
    phone: str
    address: str
    city: str
    state: str
    pincode: str
    is_primary: bool = False

class AddressUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    is_primary: Optional[bool] = None

# Order Tracking Models
class OrderTrackingEvent(BaseModel):
    status: str
    description: str
    timestamp: datetime
    location: Optional[str] = None

# Review Models
class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    user_id: str
    user_name: str
    order_id: str
    rating: int  # 1-5
    review_text: Optional[str] = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_verified_purchase: bool = True

class ReviewCreate(BaseModel):
    product_id: str
    order_id: str
    rating: int  # 1-5
    review_text: Optional[str] = ""

class ProductRating(BaseModel):
    product_id: str
    average_rating: float
    total_reviews: int
    rating_distribution: Dict[str, int]  # {"5": 10, "4": 5, ...}

# Password Reset Models
class PasswordResetToken(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    email: str
    token: str
    expires_at: datetime
    used: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class VerifyResetTokenRequest(BaseModel):
    token: str

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def create_access_token(data: dict) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> dict:
    """Decode a JWT access token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to get current authenticated admin"""
    token = credentials.credentials
    payload = decode_access_token(token)
    admin_id = payload.get("sub")
    if not admin_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    admin = await db.admins.find_one({"id": admin_id}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    
    return admin

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to get current authenticated user (or admin)"""
    token = credentials.credentials
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    user_type = payload.get("type", "user")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # If admin logged in via user auth
    if user_type == "admin":
        admin = await db.admins.find_one({"id": user_id}, {"_id": 0})
        if not admin:
            raise HTTPException(status_code=401, detail="Admin not found")
        return {
            "id": admin['id'],
            "name": admin['name'],
            "email": admin['email'],
            "phone": "",
            "is_admin": True,
            "role": admin['role']
        }
    
    # Regular user
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {
        **user,
        "is_admin": False
    }

def generate_reset_token() -> str:
    """Generate a secure random token for password reset"""
    return secrets.token_urlsafe(32)

async def send_password_reset_email(email: str, name: str, reset_token: str) -> bool:
    """Send password reset email using Brevo"""
    try:
        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(brevo_configuration))
        
        reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .button:hover {{ background: #45a049; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                .warning {{ background: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 5px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌿 Dheerghayush Naturals</h1>
                    <p>Password Reset Request</p>
                </div>
                <div class="content">
                    <h2>Hello {name},</h2>
                    <p>We received a request to reset your password for your Dheerghayush Naturals account.</p>
                    <p>Click the button below to reset your password:</p>
                    <center>
                        <a href="{reset_link}" class="button">Reset Password</a>
                    </center>
                    <p>Or copy and paste this link in your browser:</p>
                    <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">{reset_link}</p>
                    <div class="warning">
                        <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
                    </div>
                </div>
                <div class="footer">
                    <p>© 2024 Dheerghayush Naturals. All rights reserved.</p>
                    <p>This is an automated email. Please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            to=[{"email": email, "name": name}],
            sender={"email": BREVO_SENDER_EMAIL, "name": "Dheerghayush Naturals"},
            subject="Reset Your Password - Dheerghayush Naturals",
            html_content=html_content
        )
        
        api_instance.send_transac_email(send_smtp_email)
        logger.info(f"Password reset email sent to {email}")
        return True
        
    except ApiException as e:
        logger.error(f"Brevo API error sending email: {e}")
        return False
    except Exception as e:
        logger.error(f"Error sending password reset email: {e}")
        return False

# ==================== PUBLIC ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Dheerghayush Naturals API", "version": "1.0"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# ==================== USER AUTH ROUTES ====================

@api_router.post("/auth/signup", response_model=UserLoginResponse)
async def user_signup(signup_data: UserSignup):
    """User registration endpoint"""
    try:
        # Check if email already exists
        existing_user = await db.users.find_one({"email": signup_data.email.lower()})
        if existing_user:
            raise HTTPException(status_code=400, detail="This email is already registered. Please sign in or use a different email.")
        
        # Check if phone already exists
        existing_phone = await db.users.find_one({"phone": signup_data.phone})
        if existing_phone:
            raise HTTPException(status_code=400, detail="This phone number is already registered. Please use a different number.")
        
        # Create new user
        user = User(
            name=signup_data.name,
            email=signup_data.email.lower(),
            phone=signup_data.phone,
            password_hash=hash_password(signup_data.password)
        )
        
        doc = user.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.users.insert_one(doc)
        logger.info(f"New user registered: {user.email}")
        
        # Create access token
        access_token = create_access_token({"sub": user.id, "email": user.email, "type": "user"})
        
        return UserLoginResponse(
            access_token=access_token,
            user={
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during signup: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")

@api_router.post("/auth/login", response_model=UserLoginResponse)
async def user_login(login_data: UserLogin):
    """User login endpoint - also supports admin login"""
    try:
        # First check if this is an admin login
        admin = await db.admins.find_one({"email": login_data.email.lower()}, {"_id": 0})
        if admin:
            if not verify_password(login_data.password, admin['password_hash']):
                raise HTTPException(status_code=401, detail="Incorrect password. Please try again.")
            
            if not admin.get('is_active', True):
                raise HTTPException(status_code=401, detail="Your account has been disabled. Please contact support.")
            
            access_token = create_access_token({
                "sub": admin['id'], 
                "email": admin['email'], 
                "type": "admin",
                "role": admin['role']
            })
            
            logger.info(f"Admin logged in via user auth: {admin['email']}")
            
            return UserLoginResponse(
                access_token=access_token,
                user={
                    "id": admin['id'],
                    "name": admin['name'],
                    "email": admin['email'],
                    "phone": "",
                    "is_admin": True,
                    "role": admin['role']
                }
            )
        
        # Regular user login
        user = await db.users.find_one({"email": login_data.email.lower()}, {"_id": 0})
        
        if not user:
            raise HTTPException(status_code=404, detail="Email not found. Please check your email or sign up.")
        
        if not verify_password(login_data.password, user['password_hash']):
            raise HTTPException(status_code=401, detail="Incorrect password. Please try again.")
        
        if not user.get('is_active', True):
            raise HTTPException(status_code=401, detail="Your account has been disabled. Please contact support.")
        
        access_token = create_access_token({"sub": user['id'], "email": user['email'], "type": "user"})
        
        logger.info(f"User logged in: {user['email']}")
        
        return UserLoginResponse(
            access_token=access_token,
            user={
                "id": user['id'],
                "name": user['name'],
                "email": user['email'],
                "phone": user['phone'],
                "is_admin": False
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong. Please try again later.")

@api_router.get("/auth/me", response_model=UserProfile)
async def get_user_profile(user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return UserProfile(
        id=user['id'],
        name=user['name'],
        email=user['email'],
        phone=user['phone']
    )

# ==================== FORGOT PASSWORD ROUTES ====================

@api_router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Request password reset - sends email with reset link"""
    try:
        email = request.email.lower()
        
        # Check if user exists
        user = await db.users.find_one({"email": email}, {"_id": 0})
        
        # Always return success to prevent email enumeration
        if not user:
            logger.info(f"Password reset requested for non-existent email: {email}")
            return {"message": "If an account with this email exists, you will receive a password reset link shortly."}
        
        # Invalidate any existing reset tokens for this user
        await db.password_reset_tokens.update_many(
            {"email": email, "used": False},
            {"$set": {"used": True}}
        )
        
        # Generate new reset token
        reset_token = generate_reset_token()
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        
        token_doc = PasswordResetToken(
            user_id=user['id'],
            email=email,
            token=reset_token,
            expires_at=expires_at
        )
        
        doc = token_doc.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['expires_at'] = doc['expires_at'].isoformat()
        
        await db.password_reset_tokens.insert_one(doc)
        
        # Send email
        email_sent = await send_password_reset_email(email, user['name'], reset_token)
        
        if not email_sent:
            logger.error(f"Failed to send password reset email to {email}")
            # Still return success to prevent enumeration
        
        logger.info(f"Password reset token generated for {email}")
        return {"message": "If an account with this email exists, you will receive a password reset link shortly."}
        
    except Exception as e:
        logger.error(f"Error in forgot password: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong. Please try again later.")

@api_router.post("/auth/verify-reset-token")
async def verify_reset_token(request: VerifyResetTokenRequest):
    """Verify if a password reset token is valid"""
    try:
        token_doc = await db.password_reset_tokens.find_one(
            {"token": request.token, "used": False},
            {"_id": 0}
        )
        
        if not token_doc:
            raise HTTPException(status_code=400, detail="Invalid or expired reset link. Please request a new one.")
        
        # Check expiration
        expires_at = token_doc['expires_at']
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(status_code=400, detail="This reset link has expired. Please request a new one.")
        
        return {"valid": True, "email": token_doc['email']}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying reset token: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong. Please try again later.")

@api_router.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password using the token"""
    try:
        # Find and validate token
        token_doc = await db.password_reset_tokens.find_one(
            {"token": request.token, "used": False},
            {"_id": 0}
        )
        
        if not token_doc:
            raise HTTPException(status_code=400, detail="Invalid or expired reset link. Please request a new one.")
        
        # Check expiration
        expires_at = token_doc['expires_at']
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(status_code=400, detail="This reset link has expired. Please request a new one.")
        
        # Validate password
        if len(request.new_password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")
        
        # Update user password
        new_password_hash = hash_password(request.new_password)
        
        result = await db.users.update_one(
            {"id": token_doc['user_id']},
            {"$set": {"password_hash": new_password_hash}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="User not found.")
        
        # Mark token as used
        await db.password_reset_tokens.update_one(
            {"token": request.token},
            {"$set": {"used": True}}
        )
        
        logger.info(f"Password reset successful for user {token_doc['user_id']}")
        return {"message": "Password reset successful. You can now login with your new password."}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resetting password: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong. Please try again later.")

# ==================== USER ADDRESS ROUTES ====================

@api_router.get("/user/addresses")
async def get_user_addresses(user: dict = Depends(get_current_user)):
    """Get all addresses for current user"""
    addresses = await db.addresses.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
    for addr in addresses:
        if isinstance(addr.get('created_at'), str):
            addr['created_at'] = datetime.fromisoformat(addr['created_at'])
    return addresses

@api_router.post("/user/addresses", response_model=Address)
async def create_user_address(address_data: AddressCreate, user: dict = Depends(get_current_user)):
    """Create a new address for current user"""
    try:
        # If this is set as primary, unset other primary addresses
        if address_data.is_primary:
            await db.addresses.update_many(
                {"user_id": user['id']},
                {"$set": {"is_primary": False}}
            )
        
        # If this is the first address, make it primary
        existing_count = await db.addresses.count_documents({"user_id": user['id']})
        if existing_count == 0:
            address_data.is_primary = True
        
        address = Address(user_id=user['id'], **address_data.model_dump())
        doc = address.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.addresses.insert_one(doc)
        logger.info(f"Address created for user {user['id']}")
        return address
        
    except Exception as e:
        logger.error(f"Error creating address: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create address: {str(e)}")

@api_router.put("/user/addresses/{address_id}")
async def update_user_address(address_id: str, update_data: AddressUpdate, user: dict = Depends(get_current_user)):
    """Update an address"""
    # Verify address belongs to user
    address = await db.addresses.find_one({"id": address_id, "user_id": user['id']})
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # If setting as primary, unset other primary addresses
    if update_dict.get('is_primary'):
        await db.addresses.update_many(
            {"user_id": user['id'], "id": {"$ne": address_id}},
            {"$set": {"is_primary": False}}
        )
    
    await db.addresses.update_one({"id": address_id}, {"$set": update_dict})
    
    updated = await db.addresses.find_one({"id": address_id}, {"_id": 0})
    return updated

@api_router.delete("/user/addresses/{address_id}")
async def delete_user_address(address_id: str, user: dict = Depends(get_current_user)):
    """Delete an address"""
    address = await db.addresses.find_one({"id": address_id, "user_id": user['id']})
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    was_primary = address.get('is_primary', False)
    
    await db.addresses.delete_one({"id": address_id})
    
    # If deleted address was primary, set another as primary
    if was_primary:
        remaining = await db.addresses.find_one({"user_id": user['id']})
        if remaining:
            await db.addresses.update_one(
                {"id": remaining['id']},
                {"$set": {"is_primary": True}}
            )
    
    return {"message": "Address deleted successfully"}

@api_router.put("/user/addresses/{address_id}/primary")
async def set_primary_address(address_id: str, user: dict = Depends(get_current_user)):
    """Set an address as primary"""
    address = await db.addresses.find_one({"id": address_id, "user_id": user['id']})
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    # Unset all other primary addresses
    await db.addresses.update_many(
        {"user_id": user['id']},
        {"$set": {"is_primary": False}}
    )
    
    # Set this address as primary
    await db.addresses.update_one(
        {"id": address_id},
        {"$set": {"is_primary": True}}
    )
    
    return {"message": "Primary address updated successfully"}

# ==================== USER ORDERS ROUTES ====================

@api_router.get("/user/orders")
async def get_user_orders(user: dict = Depends(get_current_user)):
    """Get all orders for current user"""
    orders = await db.orders.find(
        {"user_id": user['id']}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return orders

@api_router.get("/user/orders/{order_id}")
async def get_user_order_details(order_id: str, user: dict = Depends(get_current_user)):
    """Get specific order details for current user"""
    order = await db.orders.find_one(
        {"order_id": order_id, "user_id": user['id']}, 
        {"_id": 0}
    )
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if isinstance(order.get('created_at'), str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return order

@api_router.post("/user/orders/{order_id}/cancel")
async def cancel_user_order(order_id: str, request: Request, user: dict = Depends(get_current_user)):
    """Cancel an order (only if not delivered)"""
    # Get reason from request body
    try:
        body = await request.json()
        cancel_reason = body.get('reason', '')
    except:
        cancel_reason = ''
    
    order = await db.orders.find_one({"order_id": order_id, "user_id": user['id']})
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if order can be cancelled
    non_cancellable_statuses = ['delivered', 'cancelled']
    if order.get('order_status') in non_cancellable_statuses:
        raise HTTPException(status_code=400, detail="This order cannot be cancelled")
    
    # Update order status to cancelled
    now = datetime.now(timezone.utc)
    tracking_events = order.get('tracking_events', [])
    tracking_events.append({
        "status": "cancelled",
        "description": f"Order cancelled by customer. Reason: {cancel_reason}" if cancel_reason else "Order cancelled by customer",
        "timestamp": now.isoformat(),
        "location": None
    })
    
    update_data = {
        "order_status": "cancelled",
        "tracking_events": tracking_events,
        "cancelled_at": now.isoformat(),
        "cancel_reason": cancel_reason
    }
    
    # If prepaid order (RAZORPAY) and payment was successful, initiate refund process
    if order.get('payment_method') == 'RAZORPAY' and order.get('payment_status') == 'paid':
        update_data['refund_status'] = 'processing'
        update_data['refund_initiated_at'] = now.isoformat()
        tracking_events.append({
            "status": "refund_initiated",
            "description": "Refund initiated. Amount will be credited within 1-2 business days.",
            "timestamp": now.isoformat(),
            "location": None
        })
        update_data['tracking_events'] = tracking_events
    
    await db.orders.update_one(
        {"order_id": order_id},
        {"$set": update_data}
    )
    
    # Restore stock for cancelled items
    for item in order.get('items', []):
        await db.products.update_one(
            {"id": item['id']},
            {"$inc": {"stock": item['quantity']}}
        )
    
    logger.info(f"Order {order_id} cancelled by user {user['id']}")
    
    # Return appropriate message based on payment method
    if order.get('payment_method') == 'RAZORPAY' and order.get('payment_status') == 'paid':
        return {
            "message": "Order cancelled successfully. Your refund is being processed and will be credited within 1-2 business days.",
            "refund_status": "processing"
        }
    
    return {"message": "Order cancelled successfully"}

@api_router.post("/user/orders/{order_id}/refund")
async def request_refund(order_id: str, user: dict = Depends(get_current_user)):
    """Request refund for a delivered order (within 7 days)"""
    order = await db.orders.find_one({"order_id": order_id, "user_id": user['id']})
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.get('order_status') != 'delivered':
        raise HTTPException(status_code=400, detail="Refund can only be requested for delivered orders")
    
    # Check if within 7 days of delivery
    delivered_at = None
    for event in order.get('tracking_events', []):
        if event.get('status') == 'delivered' and event.get('timestamp'):
            delivered_at = datetime.fromisoformat(event['timestamp'].replace('Z', '+00:00')) if isinstance(event['timestamp'], str) else event['timestamp']
            break
    
    if not delivered_at:
        # Use created_at as fallback
        delivered_at = order.get('created_at')
        if isinstance(delivered_at, str):
            delivered_at = datetime.fromisoformat(delivered_at)
    
    days_since_delivery = (datetime.now(timezone.utc) - delivered_at).days
    if days_since_delivery > 7:
        raise HTTPException(status_code=400, detail="Refund request period has expired (7 days)")
    
    # Check if already requested
    if order.get('refund_status'):
        raise HTTPException(status_code=400, detail="Refund has already been requested for this order")
    
    # Update order with refund request
    now = datetime.now(timezone.utc)
    await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {
            "refund_status": "requested",
            "refund_requested_at": now.isoformat(),
            "order_status": "refund_requested"
        }}
    )
    
    logger.info(f"Refund requested for order {order_id} by user {user['id']}")
    return {"message": "Refund request submitted successfully. We will process it within 3-5 business days."}

@api_router.post("/user/orders/{order_id}/replace")
async def request_replacement(order_id: str, request: Request, user: dict = Depends(get_current_user)):
    """Request replacement for a delivered order (within 7 days)"""
    # Get reason from request body
    try:
        body = await request.json()
        replace_reason = body.get('reason', '')
    except:
        replace_reason = ''
    
    order = await db.orders.find_one({"order_id": order_id, "user_id": user['id']})
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.get('order_status') != 'delivered':
        raise HTTPException(status_code=400, detail="Replacement can only be requested for delivered orders")
    
    # Check if within 7 days of delivery
    delivered_at = None
    for event in order.get('tracking_events', []):
        if event.get('status') == 'delivered' and event.get('timestamp'):
            delivered_at = datetime.fromisoformat(event['timestamp'].replace('Z', '+00:00')) if isinstance(event['timestamp'], str) else event['timestamp']
            break
    
    if not delivered_at:
        delivered_at = order.get('created_at')
        if isinstance(delivered_at, str):
            delivered_at = datetime.fromisoformat(delivered_at)
    
    days_since_delivery = (datetime.now(timezone.utc) - delivered_at).days
    if days_since_delivery > 7:
        raise HTTPException(status_code=400, detail="Replacement request period has expired (7 days)")
    
    # Check if already requested
    if order.get('replacement_status'):
        raise HTTPException(status_code=400, detail="Replacement has already been requested for this order")
    
    # Update order with replacement request
    now = datetime.now(timezone.utc)
    await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {
            "replacement_status": "requested",
            "replacement_requested_at": now.isoformat(),
            "replacement_reason": replace_reason,
            "order_status": "replacement_requested"
        }}
    )
    
    logger.info(f"Replacement requested for order {order_id} by user {user['id']}. Reason: {replace_reason}")
    return {"message": "Replacement request submitted successfully. We will contact you shortly."}

@api_router.get("/user/orders/{order_id}/track")
async def track_user_order(order_id: str, user: dict = Depends(get_current_user)):
    """Get tracking information for an order"""
    order = await db.orders.find_one(
        {"order_id": order_id, "user_id": user['id']}, 
        {"_id": 0}
    )
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Generate tracking events based on order status
    tracking_events = order.get('tracking_events', [])
    
    # If no tracking events, generate default ones based on status
    if not tracking_events:
        status = order.get('order_status', 'pending')
        created_at = order.get('created_at')
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        
        tracking_events = [
            {
                "status": "pending",
                "description": "Order placed successfully",
                "timestamp": created_at.isoformat() if created_at else datetime.now(timezone.utc).isoformat(),
                "completed": True
            }
        ]
        
        status_flow = ["confirmed", "processing", "shipped", "out_for_delivery", "delivered"]
        status_descriptions = {
            "confirmed": "Order confirmed by seller",
            "processing": "Order is being processed",
            "shipped": "Order has been shipped",
            "out_for_delivery": "Order is out for delivery",
            "delivered": "Order delivered successfully"
        }
        
        current_status_index = status_flow.index(status) if status in status_flow else -1
        
        for i, s in enumerate(status_flow):
            tracking_events.append({
                "status": s,
                "description": status_descriptions[s],
                "timestamp": None,
                "completed": i <= current_status_index
            })
    
    return {
        "order_id": order['order_id'],
        "order_status": order.get('order_status', 'pending'),
        "payment_status": order.get('payment_status', 'pending'),
        "estimated_delivery": order.get('estimated_delivery'),
        "tracking_events": tracking_events,
        "customer_info": order.get('customer_info'),
        "items": order.get('items', []),
        "total": order.get('total', 0)
    }

# ==================== REVIEW ROUTES ====================

@api_router.post("/reviews", response_model=Review)
async def create_review(review_data: ReviewCreate, user: dict = Depends(get_current_user)):
    """Create a product review"""
    try:
        # Verify the order exists and belongs to user
        order = await db.orders.find_one({"order_id": review_data.order_id, "user_id": user['id']})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Verify order is delivered
        if order.get('order_status') != 'delivered':
            raise HTTPException(status_code=400, detail="Can only review delivered orders")
        
        # Verify product was in the order
        product_in_order = any(item['id'] == review_data.product_id for item in order.get('items', []))
        if not product_in_order:
            raise HTTPException(status_code=400, detail="Product not found in this order")
        
        # Check if user already reviewed this product for this order
        existing_review = await db.reviews.find_one({
            "product_id": review_data.product_id,
            "user_id": user['id'],
            "order_id": review_data.order_id
        })
        if existing_review:
            raise HTTPException(status_code=400, detail="You have already reviewed this product for this order")
        
        # Validate rating
        if review_data.rating < 1 or review_data.rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
        review = Review(
            product_id=review_data.product_id,
            user_id=user['id'],
            user_name=user['name'],
            order_id=review_data.order_id,
            rating=review_data.rating,
            review_text=review_data.review_text
        )
        
        doc = review.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.reviews.insert_one(doc)
        logger.info(f"Review created for product {review_data.product_id} by user {user['id']}")
        return review
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating review: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create review: {str(e)}")

@api_router.get("/products/{product_id}/reviews")
async def get_product_reviews(product_id: str, limit: int = 10, skip: int = 0):
    """Get reviews for a product"""
    reviews = await db.reviews.find(
        {"product_id": product_id},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    total = await db.reviews.count_documents({"product_id": product_id})
    
    for review in reviews:
        if isinstance(review.get('created_at'), str):
            review['created_at'] = datetime.fromisoformat(review['created_at'])
    
    return {"reviews": reviews, "total": total}

@api_router.get("/products/{product_id}/rating")
async def get_product_rating(product_id: str):
    """Get average rating and distribution for a product"""
    reviews = await db.reviews.find({"product_id": product_id}, {"rating": 1}).to_list(1000)
    
    if not reviews:
        return {
            "product_id": product_id,
            "average_rating": 0,
            "total_reviews": 0,
            "rating_distribution": {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}
        }
    
    total = len(reviews)
    sum_ratings = sum(r['rating'] for r in reviews)
    average = round(sum_ratings / total, 1)
    
    distribution = {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}
    for r in reviews:
        distribution[str(r['rating'])] += 1
    
    return {
        "product_id": product_id,
        "average_rating": average,
        "total_reviews": total,
        "rating_distribution": distribution
    }

@api_router.get("/user/reviews")
async def get_user_reviews(user: dict = Depends(get_current_user)):
    """Get all reviews by current user"""
    reviews = await db.reviews.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
    for review in reviews:
        if isinstance(review.get('created_at'), str):
            review['created_at'] = datetime.fromisoformat(review['created_at'])
    return reviews

@api_router.get("/user/orders/{order_id}/reviewable-products")
async def get_reviewable_products(order_id: str, user: dict = Depends(get_current_user)):
    """Get products from an order that can be reviewed"""
    order = await db.orders.find_one({"order_id": order_id, "user_id": user['id']})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.get('order_status') != 'delivered':
        return {"products": [], "message": "Order not yet delivered"}
    
    # Get existing reviews for this order
    existing_reviews = await db.reviews.find({
        "order_id": order_id,
        "user_id": user['id']
    }).to_list(100)
    
    reviewed_product_ids = {r['product_id'] for r in existing_reviews}
    
    # Filter products that haven't been reviewed
    reviewable = []
    for item in order.get('items', []):
        reviewable.append({
            **item,
            "reviewed": item['id'] in reviewed_product_ids
        })
    
    return {"products": reviewable}

# ==================== CATEGORY ROUTES (PUBLIC) ====================

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    """Get all active categories"""
    categories = await db.categories.find({"is_active": True}, {"_id": 0}).to_list(100)
    for cat in categories:
        if isinstance(cat.get('created_at'), str):
            cat['created_at'] = datetime.fromisoformat(cat['created_at'])
    return categories

@api_router.get("/categories/{slug}")
async def get_category_by_slug(slug: str):
    """Get category by slug"""
    category = await db.categories.find_one({"slug": slug, "is_active": True}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if isinstance(category.get('created_at'), str):
        category['created_at'] = datetime.fromisoformat(category['created_at'])
    return category

# ==================== PRODUCT ROUTES (PUBLIC) ====================

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, bestseller: Optional[bool] = None):
    """Get all active products with optional filters"""
    query = {"is_active": True}
    if category:
        query["category"] = category
    if bestseller is not None:
        query["is_bestseller"] = bestseller
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for prod in products:
        if isinstance(prod.get('created_at'), str):
            prod['created_at'] = datetime.fromisoformat(prod['created_at'])
    return products

@api_router.get("/products/{product_id}")
async def get_product_by_id(product_id: str):
    """Get product by ID"""
    product = await db.products.find_one({"id": product_id, "is_active": True}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return product

# ==================== ORDER ROUTES (PUBLIC) ====================

@api_router.post("/orders", response_model=Order)
async def create_order(order_input: OrderCreate):
    """Create a new order"""
    try:
        # Check stock availability for all items
        for item in order_input.items:
            product = await db.products.find_one({"id": item.id, "is_active": True})
            if not product:
                raise HTTPException(status_code=400, detail=f"Product {item.name} not found")
            if product.get('stock', 0) < item.quantity:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Insufficient stock for {item.name}. Available: {product.get('stock', 0)}"
                )
        
        # Reduce stock for each item
        for item in order_input.items:
            await db.products.update_one(
                {"id": item.id},
                {"$inc": {"stock": -item.quantity}}
            )
            logger.info(f"Stock reduced for product {item.id} by {item.quantity}")
        
        order_obj = Order(**order_input.model_dump())
        
        if order_obj.payment_method == "COD":
            order_obj.payment_status = "pending"
        elif order_obj.payment_method == "RAZORPAY" and order_obj.razorpay_payment_id:
            order_obj.payment_status = "paid"
        
        # Add initial tracking event
        now = datetime.now(timezone.utc)
        order_obj.tracking_events = [{
            "status": "pending",
            "description": "Order placed successfully",
            "timestamp": now.isoformat(),
            "location": None
        }]
        
        # Set estimated delivery (5-7 days from now)
        estimated = now + timedelta(days=5)
        order_obj.estimated_delivery = estimated.strftime("%B %d, %Y")
        
        doc = order_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.orders.insert_one(doc)
        logger.info(f"Order created successfully: {order_obj.order_id}")
        return order_obj
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    """Get order by ID"""
    try:
        order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if isinstance(order['created_at'], str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
        return order
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch order: {str(e)}")

# ==================== RAZORPAY ROUTES ====================

@api_router.post("/razorpay/create-order", response_model=RazorpayOrderResponse)
async def create_razorpay_order(order_data: RazorpayOrderCreate):
    """Create a Razorpay order for payment"""
    try:
        # Convert amount to paise (Razorpay expects amount in smallest currency unit)
        amount_in_paise = int(order_data.amount * 100)
        
        # Create Razorpay order
        razorpay_order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": order_data.currency,
            "payment_capture": 1  # Auto capture payment
        })
        
        logger.info(f"Razorpay order created: {razorpay_order['id']}")
        
        return RazorpayOrderResponse(
            razorpay_order_id=razorpay_order['id'],
            razorpay_key_id=RAZORPAY_KEY_ID,
            amount=amount_in_paise,
            currency=order_data.currency
        )
        
    except Exception as e:
        logger.error(f"Error creating Razorpay order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create Razorpay order: {str(e)}")

@api_router.post("/razorpay/verify-payment")
async def verify_razorpay_payment(payment_data: RazorpayVerifyPayment):
    """Verify Razorpay payment signature"""
    try:
        # Create the signature verification string
        message = f"{payment_data.razorpay_order_id}|{payment_data.razorpay_payment_id}"
        
        # Generate expected signature
        expected_signature = hmac.new(
            RAZORPAY_KEY_SECRET.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        # Verify signature
        if expected_signature == payment_data.razorpay_signature:
            logger.info(f"Payment verified: {payment_data.razorpay_payment_id}")
            return {
                "verified": True,
                "razorpay_order_id": payment_data.razorpay_order_id,
                "razorpay_payment_id": payment_data.razorpay_payment_id,
                "message": "Payment signature verified successfully"
            }
        else:
            logger.warning(f"Payment verification failed: {payment_data.razorpay_payment_id}")
            raise HTTPException(status_code=400, detail="Payment signature verification failed")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying payment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to verify payment: {str(e)}")

@api_router.get("/razorpay/key")
async def get_razorpay_key():
    """Get Razorpay key ID for frontend"""
    return {"key_id": RAZORPAY_KEY_ID}

# ==================== PUBLIC BANNER ROUTES ====================

@api_router.get("/banners")
async def get_active_banners():
    """Get all active banners for hero section"""
    banners = await db.banners.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(100)
    for banner in banners:
        if isinstance(banner.get('created_at'), str):
            banner['created_at'] = datetime.fromisoformat(banner['created_at'])
    return banners

# ==================== ADMIN AUTH ROUTES ====================

@api_router.post("/admin/login", response_model=AdminLoginResponse)
async def admin_login(login_data: AdminLogin):
    """Admin login endpoint"""
    admin = await db.admins.find_one({"email": login_data.email}, {"_id": 0})
    
    if not admin:
        raise HTTPException(status_code=404, detail="Admin email not found. Please check your email.")
    
    if not verify_password(login_data.password, admin['password_hash']):
        raise HTTPException(status_code=401, detail="Incorrect password. Please try again.")
    
    if not admin.get('is_active', True):
        raise HTTPException(status_code=401, detail="Your account has been disabled. Please contact support.")
    
    access_token = create_access_token({"sub": admin['id'], "email": admin['email'], "role": admin['role']})
    
    return AdminLoginResponse(
        access_token=access_token,
        admin={
            "id": admin['id'],
            "email": admin['email'],
            "name": admin['name'],
            "role": admin['role']
        }
    )

@api_router.get("/admin/me")
async def get_admin_profile(admin: dict = Depends(get_current_admin)):
    """Get current admin profile"""
    return {
        "id": admin['id'],
        "email": admin['email'],
        "name": admin['name'],
        "role": admin['role']
    }

# ==================== ADMIN DASHBOARD ROUTES ====================

@api_router.get("/admin/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(admin: dict = Depends(get_current_admin)):
    """Get dashboard statistics"""
    total_orders = await db.orders.count_documents({})
    
    # Calculate total revenue from paid orders (excluding refunded orders)
    pipeline = [
        {"$match": {
            "payment_status": "paid",
            "$or": [
                {"refund_status": {"$exists": False}},
                {"refund_status": {"$ne": "completed"}}
            ]
        }},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}}
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]['total'] if revenue_result else 0
    
    pending_orders = await db.orders.count_documents({"order_status": "pending"})
    delivered_orders = await db.orders.count_documents({"order_status": "delivered"})
    total_products = await db.products.count_documents({"is_active": True})
    total_categories = await db.categories.count_documents({"is_active": True})
    total_banners = await db.banners.count_documents({"is_active": True})
    
    return DashboardStats(
        total_orders=total_orders,
        total_revenue=total_revenue,
        pending_orders=pending_orders,
        delivered_orders=delivered_orders,
        total_products=total_products,
        total_categories=total_categories,
        total_banners=total_banners
    )

# ==================== ADMIN CATEGORY ROUTES ====================

@api_router.get("/admin/categories")
async def admin_get_all_categories(admin: dict = Depends(get_current_admin)):
    """Get all categories (including inactive)"""
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    for cat in categories:
        if isinstance(cat.get('created_at'), str):
            cat['created_at'] = datetime.fromisoformat(cat['created_at'])
    return categories

@api_router.post("/admin/categories", response_model=Category)
async def admin_create_category(category_data: CategoryCreate, admin: dict = Depends(get_current_admin)):
    """Create a new category"""
    # Check if slug already exists
    existing = await db.categories.find_one({"slug": category_data.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Category with this slug already exists")
    
    category = Category(**category_data.model_dump())
    doc = category.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.categories.insert_one(doc)
    logger.info(f"Category created: {category.name}")
    return category

@api_router.put("/admin/categories/{category_id}")
async def admin_update_category(category_id: str, update_data: CategoryUpdate, admin: dict = Depends(get_current_admin)):
    """Update a category"""
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.categories.update_one({"id": category_id}, {"$set": update_dict})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    updated = await db.categories.find_one({"id": category_id}, {"_id": 0})
    return updated

@api_router.delete("/admin/categories/{category_id}")
async def admin_delete_category(category_id: str, admin: dict = Depends(get_current_admin)):
    """Delete (deactivate) a category"""
    result = await db.categories.update_one({"id": category_id}, {"$set": {"is_active": False}})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category deleted successfully"}

# ==================== ADMIN PRODUCT ROUTES ====================

@api_router.get("/admin/products")
async def admin_get_all_products(admin: dict = Depends(get_current_admin), category: Optional[str] = None):
    """Get all products (including inactive)"""
    query = {}
    if category:
        query["category"] = category
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for prod in products:
        if isinstance(prod.get('created_at'), str):
            prod['created_at'] = datetime.fromisoformat(prod['created_at'])
    return products

@api_router.post("/admin/products", response_model=Product)
async def admin_create_product(product_data: ProductCreate, admin: dict = Depends(get_current_admin)):
    """Create a new product"""
    product = Product(**product_data.model_dump())
    doc = product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.products.insert_one(doc)
    logger.info(f"Product created: {product.name}")
    return product

@api_router.put("/admin/products/{product_id}")
async def admin_update_product(product_id: str, update_data: ProductUpdate, admin: dict = Depends(get_current_admin)):
    """Update a product"""
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.products.update_one({"id": product_id}, {"$set": update_dict})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    return updated

@api_router.delete("/admin/products/{product_id}")
async def admin_delete_product(product_id: str, admin: dict = Depends(get_current_admin)):
    """Permanently delete a product from database"""
    result = await db.products.delete_one({"id": product_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    logger.info(f"Product {product_id} permanently deleted")
    return {"message": "Product deleted successfully"}

# ==================== ADMIN ORDER ROUTES ====================

@api_router.get("/admin/orders")
async def admin_get_all_orders(
    admin: dict = Depends(get_current_admin),
    order_status: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
):
    """Get all orders with pagination"""
    query = {}
    if order_status:
        query["order_status"] = order_status
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.orders.count_documents(query)
    
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return {"orders": orders, "total": total, "limit": limit, "skip": skip}

@api_router.put("/admin/orders/{order_id}")
async def admin_update_order_status(order_id: str, update_data: OrderStatusUpdate, admin: dict = Depends(get_current_admin)):
    """Update order status"""
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Get current order to update tracking events
    order = await db.orders.find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Add tracking event if order_status is being updated
    if 'order_status' in update_dict:
        new_status = update_dict['order_status']
        status_descriptions = {
            "pending": "Order placed successfully",
            "confirmed": "Order confirmed by seller",
            "processing": "Order is being processed",
            "shipped": "Order has been shipped",
            "out_for_delivery": "Order is out for delivery",
            "delivered": "Order delivered successfully",
            "cancelled": "Order has been cancelled",
            "refund_requested": "Refund requested by customer",
            "refund_approved": "Refund approved by admin",
            "refund_rejected": "Refund request rejected",
            "refund_processing": "Refund is being processed",
            "refund_completed": "Refund completed successfully",
            "replacement_requested": "Replacement requested by customer",
            "replacement_accepted": "Replacement request accepted",
            "replacement_rejected": "Replacement request rejected",
            "replacement_processing": "Replacement order is being processed",
            "replacement_shipped": "Replacement order has been shipped",
            "replacement_out_for_delivery": "Replacement order is out for delivery",
            "replacement_delivered": "Replacement order delivered successfully"
        }
        
        tracking_events = order.get('tracking_events', [])
        tracking_events.append({
            "status": new_status,
            "description": status_descriptions.get(new_status, f"Order status updated to {new_status}"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "location": None
        })
        update_dict['tracking_events'] = tracking_events
    
    result = await db.orders.update_one({"order_id": order_id}, {"$set": update_dict})
    
    updated = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    logger.info(f"Order {order_id} updated: {update_dict}")
    return updated

@api_router.get("/admin/orders/refunds")
async def admin_get_refund_orders(admin: dict = Depends(get_current_admin)):
    """Get all orders with refund requests"""
    refund_statuses = [
        "refund_requested",
        "refund_approved",
        "refund_rejected",
        "refund_processing",
        "refund_completed"
    ]
    
    orders = await db.orders.find(
        {"order_status": {"$in": refund_statuses}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return {"orders": orders, "total": len(orders)}

@api_router.get("/admin/orders/replacements")
async def admin_get_replacement_orders(admin: dict = Depends(get_current_admin)):
    """Get all orders with replacement requests"""
    replacement_statuses = [
        "replacement_requested",
        "replacement_accepted",
        "replacement_rejected",
        "replacement_processing",
        "replacement_shipped",
        "replacement_out_for_delivery",
        "replacement_delivered"
    ]
    
    orders = await db.orders.find(
        {"order_status": {"$in": replacement_statuses}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return {"orders": orders, "total": len(orders)}

@api_router.put("/admin/orders/{order_id}/refund")
async def admin_update_refund_status(order_id: str, update_data: OrderStatusUpdate, admin: dict = Depends(get_current_admin)):
    """Update refund status for an order"""
    order = await db.orders.find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if not order.get('refund_status'):
        raise HTTPException(status_code=400, detail="No refund request found for this order")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if 'order_status' in update_dict:
        new_status = update_dict['order_status']
        
        # Update refund_status field as well
        if new_status == 'refund_approved':
            update_dict['refund_status'] = 'approved'
        elif new_status == 'refund_rejected':
            update_dict['refund_status'] = 'rejected'
        elif new_status == 'refund_processing':
            update_dict['refund_status'] = 'processing'
        elif new_status == 'refund_completed':
            update_dict['refund_status'] = 'completed'
        
        # Add tracking event
        tracking_events = order.get('tracking_events', [])
        status_descriptions = {
            "refund_approved": "Refund approved by admin",
            "refund_rejected": "Refund request rejected",
            "refund_processing": "Refund is being processed",
            "refund_completed": "Refund completed successfully"
        }
        
        tracking_events.append({
            "status": new_status,
            "description": status_descriptions.get(new_status, f"Refund status updated to {new_status}"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "location": None
        })
        update_dict['tracking_events'] = tracking_events
    
    await db.orders.update_one({"order_id": order_id}, {"$set": update_dict})
    updated = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    logger.info(f"Refund status updated for order {order_id}: {update_dict}")
    return updated

@api_router.post("/admin/orders/{order_id}/process-refund")
async def admin_process_refund(order_id: str, admin: dict = Depends(get_current_admin)):
    """Process refund via Razorpay API - automatically transfers money back to customer"""
    order = await db.orders.find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Validate order is eligible for refund
    if order.get('order_status') != 'cancelled':
        raise HTTPException(status_code=400, detail="Only cancelled orders can be refunded")
    
    if order.get('payment_method') != 'RAZORPAY':
        raise HTTPException(status_code=400, detail="Only Razorpay payments can be refunded through this API")
    
    if order.get('payment_status') != 'paid':
        raise HTTPException(status_code=400, detail="Payment was not completed for this order")
    
    if order.get('refund_status') == 'completed':
        raise HTTPException(status_code=400, detail="Refund has already been processed for this order")
    
    razorpay_payment_id = order.get('razorpay_payment_id')
    if not razorpay_payment_id:
        raise HTTPException(status_code=400, detail="Razorpay payment ID not found for this order")
    
    now = datetime.now(timezone.utc)
    tracking_events = order.get('tracking_events', [])
    
    try:
        # Convert amount to paise (Razorpay expects amount in smallest currency unit)
        refund_amount = int(order['total'] * 100)
        
        # Create refund via Razorpay API
        refund = razorpay_client.payment.refund(razorpay_payment_id, {
            "amount": refund_amount,
            "speed": "normal",  # Can be "normal" or "optimum"
            "notes": {
                "order_id": order_id,
                "reason": "Order cancelled by customer"
            }
        })
        
        logger.info(f"Razorpay refund created: {refund}")
        
        # Update order with refund details
        tracking_events.append({
            "status": "refund_completed",
            "description": f"Refund of ₹{order['total']:.2f} processed successfully. Refund ID: {refund.get('id', 'N/A')}",
            "timestamp": now.isoformat(),
            "location": None
        })
        
        update_data = {
            "refund_status": "completed",
            "refund_completed_at": now.isoformat(),
            "razorpay_refund_id": refund.get('id'),
            "tracking_events": tracking_events
        }
        
        await db.orders.update_one({"order_id": order_id}, {"$set": update_data})
        
        logger.info(f"Refund processed successfully for order {order_id}")
        
        return {
            "success": True,
            "message": f"Refund of ₹{order['total']:.2f} processed successfully",
            "refund_id": refund.get('id'),
            "refund_status": "completed"
        }
        
    except razorpay.errors.BadRequestError as e:
        logger.error(f"Razorpay BadRequestError for order {order_id}: {str(e)}")
        
        # Update order - keep status as processing for user (not failed)
        # User will see "Payment under process" instead of error
        tracking_events.append({
            "status": "refund_processing",
            "description": "Refund is being processed. Please wait.",
            "timestamp": now.isoformat(),
            "location": None
        })
        
        await db.orders.update_one(
            {"order_id": order_id},
            {"$set": {
                "refund_status": "processing",  # Keep as processing for user
                "refund_error_internal": str(e),  # Store error internally for admin
                "tracking_events": tracking_events
            }}
        )
        
        raise HTTPException(status_code=400, detail=f"Refund failed: {str(e)}")
        
    except Exception as e:
        logger.error(f"Error processing refund for order {order_id}: {str(e)}")
        
        # Update order - keep status as processing for user (not failed)
        # User will see "Payment under process" instead of technical error
        tracking_events.append({
            "status": "refund_processing",
            "description": "Refund is being processed. Please wait.",
            "timestamp": now.isoformat(),
            "location": None
        })
        
        await db.orders.update_one(
            {"order_id": order_id},
            {"$set": {
                "refund_status": "processing",  # Keep as processing for user
                "refund_error_internal": str(e),  # Store error internally for admin
                "tracking_events": tracking_events
            }}
        )
        
        raise HTTPException(status_code=500, detail=f"Failed to process refund: {str(e)}")

@api_router.put("/admin/orders/{order_id}/replacement")
async def admin_update_replacement_status(order_id: str, update_data: OrderStatusUpdate, admin: dict = Depends(get_current_admin)):
    """Update replacement status for an order"""
    order = await db.orders.find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if not order.get('replacement_status'):
        raise HTTPException(status_code=400, detail="No replacement request found for this order")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if 'order_status' in update_dict:
        new_status = update_dict['order_status']
        
        # Update replacement_status field as well
        if new_status == 'replacement_accepted':
            update_dict['replacement_status'] = 'accepted'
        elif new_status == 'replacement_rejected':
            update_dict['replacement_status'] = 'rejected'
        elif new_status == 'replacement_processing':
            update_dict['replacement_status'] = 'processing'
        elif new_status == 'replacement_shipped':
            update_dict['replacement_status'] = 'shipped'
        elif new_status == 'replacement_out_for_delivery':
            update_dict['replacement_status'] = 'out_for_delivery'
        elif new_status == 'replacement_delivered':
            update_dict['replacement_status'] = 'delivered'
        
        # Add tracking event
        tracking_events = order.get('tracking_events', [])
        status_descriptions = {
            "replacement_accepted": "Replacement request accepted",
            "replacement_rejected": "Replacement request rejected",
            "replacement_processing": "Replacement order is being processed",
            "replacement_shipped": "Replacement order has been shipped",
            "replacement_out_for_delivery": "Replacement order is out for delivery",
            "replacement_delivered": "Replacement order delivered successfully"
        }
        
        tracking_events.append({
            "status": new_status,
            "description": status_descriptions.get(new_status, f"Replacement status updated to {new_status}"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "location": None
        })
        update_dict['tracking_events'] = tracking_events
    
    await db.orders.update_one({"order_id": order_id}, {"$set": update_dict})
    updated = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    logger.info(f"Replacement status updated for order {order_id}: {update_dict}")
    return updated

# ==================== ADMIN BANNER ROUTES ====================

@api_router.get("/admin/banners")
async def admin_get_all_banners(admin: dict = Depends(get_current_admin)):
    """Get all banners (including inactive)"""
    banners = await db.banners.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    for banner in banners:
        if isinstance(banner.get('created_at'), str):
            banner['created_at'] = datetime.fromisoformat(banner['created_at'])
    return banners

@api_router.post("/admin/banners", response_model=Banner)
async def admin_create_banner(banner_data: BannerCreate, admin: dict = Depends(get_current_admin)):
    """Create a new banner"""
    banner = Banner(**banner_data.model_dump())
    doc = banner.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.banners.insert_one(doc)
    logger.info(f"Banner created: {banner.title}")
    return banner

@api_router.put("/admin/banners/{banner_id}")
async def admin_update_banner(banner_id: str, update_data: BannerUpdate, admin: dict = Depends(get_current_admin)):
    """Update a banner"""
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.banners.update_one({"id": banner_id}, {"$set": update_dict})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    
    updated = await db.banners.find_one({"id": banner_id}, {"_id": 0})
    return updated

@api_router.delete("/admin/banners/{banner_id}")
async def admin_delete_banner(banner_id: str, admin: dict = Depends(get_current_admin)):
    """Delete a banner"""
    result = await db.banners.delete_one({"id": banner_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    
    return {"message": "Banner deleted successfully"}

# ==================== SEED DATA ROUTE ====================

@api_router.post("/admin/seed-data")
async def seed_database(admin: dict = Depends(get_current_admin)):
    """Seed database with initial data from mock.js"""
    try:
        # Categories data
        categories_data = [
            {"id": "1", "name": "Pulses", "image": "https://images.unsplash.com/photo-1705475388190-775066fd69a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxwdWxzZXN8ZW58MHx8fHwxNzY0MzEyODgyfDA&ixlib=rb-4.1.0&q=85", "slug": "pulses"},
            {"id": "2", "name": "Millets", "image": "https://images.unsplash.com/photo-1651241587503-a874db54a1a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxtaWxsZXRzfGVufDB8fHx8MTc2NDMxMjg3Nnww&ixlib=rb-4.1.0&q=85", "slug": "millets"},
            {"id": "3", "name": "Wood Pressed Oil", "image": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwb2lsc3xlbnwwfHx8fDE3NjQzMTI4OTh8MA&ixlib=rb-4.1.0&q=85", "slug": "wood-pressed-oil"},
            {"id": "4", "name": "Wild Honey", "image": "https://images.unsplash.com/photo-1587049352851-8d4e89133924?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxob25leXxlbnwwfHx8fDE3NjQzMTI4OTN8MA&ixlib=rb-4.1.0&q=85", "slug": "wild-honey"},
            {"id": "5", "name": "Desi Ghee", "image": "https://images.unsplash.com/photo-1573812461383-e5f8b759d12e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxnaGVlfGVufDB8fHx8MTc2NDMxMjg4N3ww&ixlib=rb-4.1.0&q=85", "slug": "desi-ghee"},
            {"id": "6", "name": "Skin Care", "image": "https://images.unsplash.com/photo-1599847935464-fde3827639c2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwc2tpbmNhcmV8ZW58MHx8fHwxNzY0MzEyOTAzfDA&ixlib=rb-4.1.0&q=85", "slug": "skin-care"},
            {"id": "7", "name": "Crockery", "image": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?crop=entropy&cs=srgb&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=85", "slug": "crockery"}
        ]
        
        # Products data
        products_data = [
            {"id": "1", "name": "Organic Toor Dal", "category": "pulses", "weight": "500 gms", "price": 145, "original_price": 175, "image": "https://images.unsplash.com/photo-1723999817243-e18f2904b140?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwzfHxwdWxzZXN8ZW58MHx8fHwxNzY0MzEyODgyfDA&ixlib=rb-4.1.0&q=85", "is_bestseller": True},
            {"id": "2", "name": "Organic Moong Dal", "category": "pulses", "weight": "500 gms", "price": 165, "original_price": 195, "image": "https://images.pexels.com/photos/1393382/pexels-photo-1393382.jpeg?auto=compress&cs=tinysrgb&w=400", "is_bestseller": True},
            {"id": "3", "name": "Organic Chana Dal", "category": "pulses", "weight": "500 gms", "price": 120, "original_price": 150, "image": "https://images.unsplash.com/photo-1705475388190-775066fd69a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxwdWxzZXN8ZW58MHx8fHwxNzY0MzEyODgyfDA&ixlib=rb-4.1.0&q=85", "is_bestseller": False},
            {"id": "4", "name": "Organic Urad Dal", "category": "pulses", "weight": "500 gms", "price": 155, "original_price": 185, "image": "https://images.pexels.com/photos/1393382/pexels-photo-1393382.jpeg?auto=compress&cs=tinysrgb&w=400", "is_bestseller": False},
            {"id": "5", "name": "Foxtail Millet (Korralu)", "category": "millets", "weight": "500 gms", "price": 110, "original_price": 140, "image": "https://images.unsplash.com/photo-1651241587503-a874db54a1a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxtaWxsZXRzfGVufDB8fHx8MTc2NDMxMjg3Nnww&ixlib=rb-4.1.0&q=85", "is_bestseller": True},
            {"id": "6", "name": "Little Millet (Samalu)", "category": "millets", "weight": "500 gms", "price": 105, "original_price": 130, "image": "https://images.pexels.com/photos/27959280/pexels-photo-27959280.jpeg?auto=compress&cs=tinysrgb&w=400", "is_bestseller": True},
            {"id": "7", "name": "Barnyard Millet (Udalu)", "category": "millets", "weight": "500 gms", "price": 115, "original_price": 145, "image": "https://images.unsplash.com/photo-1651241587503-a874db54a1a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxtaWxsZXRzfGVufDB8fHx8MTc2NDMxMjg3Nnww&ixlib=rb-4.1.0&q=85", "is_bestseller": False},
            {"id": "8", "name": "Pearl Millet (Bajra)", "category": "millets", "weight": "500 gms", "price": 85, "original_price": 110, "image": "https://images.pexels.com/photos/27959280/pexels-photo-27959280.jpeg?auto=compress&cs=tinysrgb&w=400", "is_bestseller": False},
            {"id": "9", "name": "Wood Pressed Groundnut Oil", "category": "wood-pressed-oil", "weight": "1 Litre", "price": 380, "original_price": 450, "image": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwb2lsc3xlbnwwfHx8fDE3NjQzMTI4OTh8MA&ixlib=rb-4.1.0&q=85", "is_bestseller": True},
            {"id": "10", "name": "Wood Pressed Coconut Oil", "category": "wood-pressed-oil", "weight": "1 Litre", "price": 420, "original_price": 500, "image": "https://images.pexels.com/photos/8469436/pexels-photo-8469436.jpeg?auto=compress&cs=tinysrgb&w=400", "is_bestseller": True},
            {"id": "11", "name": "Wood Pressed Sesame Oil", "category": "wood-pressed-oil", "weight": "500 ml", "price": 290, "original_price": 350, "image": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwb2lsc3xlbnwwfHx8fDE3NjQzMTI4OTh8MA&ixlib=rb-4.1.0&q=85", "is_bestseller": False},
            {"id": "12", "name": "Wood Pressed Mustard Oil", "category": "wood-pressed-oil", "weight": "1 Litre", "price": 340, "original_price": 400, "image": "https://images.pexels.com/photos/8469436/pexels-photo-8469436.jpeg?auto=compress&cs=tinysrgb&w=400", "is_bestseller": False},
            {"id": "13", "name": "Raw Wild Forest Honey", "category": "wild-honey", "weight": "500 gms", "price": 450, "original_price": 550, "image": "https://images.unsplash.com/photo-1587049352851-8d4e89133924?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxob25leXxlbnwwfHx8fDE3NjQzMTI4OTN8MA&ixlib=rb-4.1.0&q=85", "is_bestseller": True},
            {"id": "14", "name": "Himalayan Wild Honey", "category": "wild-honey", "weight": "250 gms", "price": 320, "original_price": 400, "image": "https://images.pexels.com/photos/33260/honey-sweet-syrup-organic.jpg?auto=compress&cs=tinysrgb&w=400", "is_bestseller": True},
            {"id": "15", "name": "Multiflora Wild Honey", "category": "wild-honey", "weight": "500 gms", "price": 380, "original_price": 470, "image": "https://images.unsplash.com/photo-1587049352851-8d4e89133924?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxob25leXxlbnwwfHx8fDE3NjQzMTI4OTN8MA&ixlib=rb-4.1.0&q=85", "is_bestseller": False},
            {"id": "16", "name": "A2 Desi Cow Ghee", "category": "desi-ghee", "weight": "500 gms", "price": 750, "original_price": 900, "image": "https://images.unsplash.com/photo-1573812461383-e5f8b759d12e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxnaGVlfGVufDB8fHx8MTc2NDMxMjg4N3ww&ixlib=rb-4.1.0&q=85", "is_bestseller": True},
            {"id": "17", "name": "Bilona Desi Ghee", "category": "desi-ghee", "weight": "500 gms", "price": 850, "original_price": 1000, "image": "https://images.unsplash.com/photo-1707425197195-240b7ad69047?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxnaGVlfGVufDB8fHx8MTc2NDMxMjg4N3ww&ixlib=rb-4.1.0&q=85", "is_bestseller": True},
            {"id": "18", "name": "Buffalo Ghee Traditional", "category": "desi-ghee", "weight": "500 gms", "price": 600, "original_price": 720, "image": "https://images.unsplash.com/photo-1573812461383-e5f8b759d12e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxnaGVlfGVufDB8fHx8MTc2NDMxMjg4N3ww&ixlib=rb-4.1.0&q=85", "is_bestseller": False},
            {"id": "19", "name": "Natural Aloe Vera Gel", "category": "skin-care", "weight": "200 gms", "price": 180, "original_price": 220, "image": "https://images.unsplash.com/photo-1599847935464-fde3827639c2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwc2tpbmNhcmV8ZW58MHx8fHwxNzY0MzEyOTAzfDA&ixlib=rb-4.1.0&q=85", "is_bestseller": True},
            {"id": "20", "name": "Herbal Face Pack", "category": "skin-care", "weight": "100 gms", "price": 150, "original_price": 190, "image": "https://images.unsplash.com/photo-1626783416763-67a92e5e7266?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwzfHxuYXR1cmFsJTIwc2tpbmNhcmV8ZW58MHx8fHwxNzY0MzEyOTAzfDA&ixlib=rb-4.1.0&q=85", "is_bestseller": True},
            {"id": "21", "name": "Turmeric Body Lotion", "category": "skin-care", "weight": "200 ml", "price": 220, "original_price": 280, "image": "https://images.unsplash.com/photo-1599847935464-fde3827639c2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwc2tpbmNhcmV8ZW58MHx8fHwxNzY0MzEyOTAzfDA&ixlib=rb-4.1.0&q=85", "is_bestseller": False},
            {"id": "22", "name": "Terracotta Water Pot", "category": "crockery", "weight": "5 Litres", "price": 450, "original_price": 550, "image": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?crop=entropy&cs=srgb&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=85", "is_bestseller": True},
            {"id": "23", "name": "Brass Cooking Utensils Set", "category": "crockery", "weight": "Set of 3", "price": 1200, "original_price": 1500, "image": "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?crop=entropy&cs=srgb&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=85", "is_bestseller": False},
            {"id": "24", "name": "Clay Kadai Traditional", "category": "crockery", "weight": "Medium", "price": 350, "original_price": 420, "image": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?crop=entropy&cs=srgb&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=85", "is_bestseller": False}
        ]
        
        # Banners data
        banners_data = [
            {
                "id": "1",
                "title": "Pure & Natural",
                "subtitle": "Wood Pressed Oils",
                "description": "Experience the authentic taste and health benefits of traditionally extracted oils",
                "bg_color": "#4CAF50",
                "image": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwb2lsc3xlbnwwfHx8fDE3NjQzMTI4OTh8MA&ixlib=rb-4.1.0&q=85",
                "button_text": "Shop Now",
                "button_link": "/products",
                "order": 0
            },
            {
                "id": "2",
                "title": "Organic Millets",
                "subtitle": "For Healthy Living",
                "description": "Unpolished, chemical-free millets sourced directly from farmers",
                "bg_color": "#FF9800",
                "image": "https://images.unsplash.com/photo-1651241587503-a874db54a1a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxtaWxsZXRzfGVufDB8fHx8MTc2NDMxMjg3Nnww&ixlib=rb-4.1.0&q=85",
                "button_text": "Explore",
                "button_link": "/products",
                "order": 1
            },
            {
                "id": "3",
                "title": "A2 Desi Ghee",
                "subtitle": "Traditional Bilona Method",
                "description": "Pure cow ghee made using the ancient bilona churning process",
                "bg_color": "#8BC34A",
                "image": "https://images.unsplash.com/photo-1573812461383-e5f8b759d12e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxnaGVlfGVufDB8fHx8MTc2NDMxMjg4N3ww&ixlib=rb-4.1.0&q=85",
                "button_text": "Shop Now",
                "button_link": "/products",
                "order": 2
            }
        ]
        
        # Clear existing data
        await db.categories.delete_many({})
        await db.products.delete_many({})
        await db.banners.delete_many({})
        
        # Insert categories
        for cat in categories_data:
            cat['created_at'] = datetime.now(timezone.utc).isoformat()
            cat['is_active'] = True
        await db.categories.insert_many(categories_data)
        
        # Insert products
        for prod in products_data:
            prod['created_at'] = datetime.now(timezone.utc).isoformat()
            prod['is_active'] = True
            prod['stock'] = 100
            prod['description'] = ""
        await db.products.insert_many(products_data)
        
        # Insert banners
        for banner in banners_data:
            banner['created_at'] = datetime.now(timezone.utc).isoformat()
            banner['is_active'] = True
        await db.banners.insert_many(banners_data)
        
        logger.info("Database seeded successfully")
        return {
            "message": "Database seeded successfully",
            "categories_count": len(categories_data),
            "products_count": len(products_data),
            "banners_count": len(banners_data)
        }
        
    except Exception as e:
        logger.error(f"Error seeding database: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to seed database: {str(e)}")

# ==================== INIT ADMIN ====================

@app.on_event("startup")
async def startup_event():
    """Create default admin user and seed banners on startup if not exists"""
    try:
        # Create default admin
        existing_admin = await db.admins.find_one({"email": "admin@gmail.com"})
        if not existing_admin:
            admin = {
                "id": str(uuid.uuid4()),
                "email": "admin@gmail.com",
                "password_hash": hash_password("admin@123"),
                "name": "Admin",
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "is_active": True
            }
            await db.admins.insert_one(admin)
            logger.info("Default admin user created: admin@gmail.com")
        else:
            logger.info("Admin user already exists")
        
        # Seed default banners if none exist
        banner_count = await db.banners.count_documents({})
        if banner_count == 0:
            banners_data = [
                {
                    "id": str(uuid.uuid4()),
                    "title": "Pure & Natural",
                    "subtitle": "Wood Pressed Oils",
                    "description": "Experience the authentic taste and health benefits of traditionally extracted oils",
                    "bg_color": "#4CAF50",
                    "image": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwb2lsc3xlbnwwfHx8fDE3NjQzMTI4OTh8MA&ixlib=rb-4.1.0&q=85",
                    "button_text": "Shop Now",
                    "button_link": "/products",
                    "order": 0,
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Organic Millets",
                    "subtitle": "For Healthy Living",
                    "description": "Unpolished, chemical-free millets sourced directly from farmers",
                    "bg_color": "#FF9800",
                    "image": "https://images.unsplash.com/photo-1651241587503-a874db54a1a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxtaWxsZXRzfGVufDB8fHx8MTc2NDMxMjg3Nnww&ixlib=rb-4.1.0&q=85",
                    "button_text": "Explore",
                    "button_link": "/products",
                    "order": 1,
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "A2 Desi Ghee",
                    "subtitle": "Traditional Bilona Method",
                    "description": "Pure cow ghee made using the ancient bilona churning process",
                    "bg_color": "#8BC34A",
                    "image": "https://images.unsplash.com/photo-1573812461383-e5f8b759d12e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxnaGVlfGVufDB8fHx8MTc2NDMxMjg4N3ww&ixlib=rb-4.1.0&q=85",
                    "button_text": "Shop Now",
                    "button_link": "/products",
                    "order": 2,
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
            ]
            await db.banners.insert_many(banners_data)
            logger.info("Default banners seeded")
    except Exception as e:
        logger.error(f"Error creating default admin: {str(e)}")

# Add CORS middleware BEFORE including routes
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the router in the main app
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
