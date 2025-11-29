from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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

# Create the main app
app = FastAPI(title="Dheerghayush Naturals API")

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
    customer_info: CustomerInfo
    items: List[OrderItem]
    subtotal: float
    shipping_fee: float
    total: float
    payment_method: str
    razorpay_payment_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    order_status: str = "pending"  # pending, confirmed, shipped, delivered, cancelled
    payment_status: str = "pending"  # pending, paid, failed
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
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Check if phone already exists
        existing_phone = await db.users.find_one({"phone": signup_data.phone})
        if existing_phone:
            raise HTTPException(status_code=400, detail="Phone number already registered")
        
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
                raise HTTPException(status_code=401, detail="Invalid email or password")
            
            if not admin.get('is_active', True):
                raise HTTPException(status_code=401, detail="Account is disabled")
            
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
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        if not verify_password(login_data.password, user['password_hash']):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        if not user.get('is_active', True):
            raise HTTPException(status_code=401, detail="Account is disabled")
        
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
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@api_router.get("/auth/me", response_model=UserProfile)
async def get_user_profile(user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return UserProfile(
        id=user['id'],
        name=user['name'],
        email=user['email'],
        phone=user['phone']
    )

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
        order_obj = Order(**order_input.model_dump())
        
        if order_obj.payment_method == "COD":
            order_obj.payment_status = "pending"
        elif order_obj.payment_method == "RAZORPAY" and order_obj.razorpay_payment_id:
            order_obj.payment_status = "paid"
        
        doc = order_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.orders.insert_one(doc)
        logger.info(f"Order created successfully: {order_obj.order_id}")
        return order_obj
        
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
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(login_data.password, admin['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not admin.get('is_active', True):
        raise HTTPException(status_code=401, detail="Account is disabled")
    
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
    
    # Calculate total revenue
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$total"}}}]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]['total'] if revenue_result else 0
    
    pending_orders = await db.orders.count_documents({"order_status": "pending"})
    delivered_orders = await db.orders.count_documents({"order_status": "delivered"})
    total_products = await db.products.count_documents({"is_active": True})
    total_categories = await db.categories.count_documents({"is_active": True})
    
    return DashboardStats(
        total_orders=total_orders,
        total_revenue=total_revenue,
        pending_orders=pending_orders,
        delivered_orders=delivered_orders,
        total_products=total_products,
        total_categories=total_categories
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
    """Delete (deactivate) a product"""
    result = await db.products.update_one({"id": product_id}, {"$set": {"is_active": False}})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
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
    
    result = await db.orders.update_one({"order_id": order_id}, {"$set": update_dict})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    updated = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    logger.info(f"Order {order_id} updated: {update_dict}")
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

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
