import traceback
import sys

try:
    print("Testing imports from app.main...")
    
    print("1. Import FastAPI...")
    from fastapi import FastAPI
    print("   ✓ FastAPI OK")
    
    print("2. Import chat router...")
    from app.api.chat import router as chat_router
    print("   ✓ Chat router OK")
    
    print("3. Import CORS middleware...")
    from fastapi.middleware.cors import CORSMiddleware
    print("   ✓ CORS middleware OK")
    
    print("4. Create app...")
    app = FastAPI()
    print("   ✓ App created OK")
    
    print("5. Add middleware...")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    print("   ✓ Middleware added OK")
    
    print("6. Include router...")
    app.include_router(chat_router)
    print("   ✓ Router included OK")
    
    print("\n✓ All imports and setup successful!")
        
except Exception as e:
    print(f"\nError:")
    traceback.print_exc()
    sys.exit(1)
