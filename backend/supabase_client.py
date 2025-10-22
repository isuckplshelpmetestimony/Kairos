import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_supabase_client() -> Client:
    """Create and return a Supabase client with service role key"""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not supabase_url or not supabase_service_key:
        print("Warning: Supabase environment variables not set, returning None")
        return None
    
    return create_client(supabase_url, supabase_service_key)

def update_appraisal(appraisal_id: str, status: str, **kwargs):
    """Update an appraisal record with completion data"""
    try:
        supabase = create_supabase_client()
        if not supabase:
            print("Supabase not available, skipping appraisal update")
            return True  # Return True to not break the flow
        
        update_data = {"status": status}
        update_data.update(kwargs)
        
        result = supabase.table('appraisals').update(update_data).eq('id', appraisal_id).execute()
        
        if result.data:
            print(f"✅ Updated appraisal {appraisal_id} with status: {status}")
            return result.data[0]
        else:
            print(f"❌ Failed to update appraisal {appraisal_id}")
            return None
            
    except Exception as e:
        print(f"❌ Error updating appraisal {appraisal_id}: {str(e)}")
        return None

def log_error(user_id: str, error_type: str, error_message: str, stack_trace: str = None):
    """Log an error to activity_logs"""
    try:
        supabase = create_supabase_client()
        if not supabase:
            print("Supabase not available, skipping error logging")
            return True  # Return True to not break the flow
        
        error_data = {
            "user_id": user_id,
            "event_type": "error",
            "event_description": f"Backend error: {error_type}",
            "error_type": error_type,
            "error_message": error_message,
            "stack_trace": stack_trace
        }
        
        result = supabase.table('activity_logs').insert(error_data).execute()
        
        if result.data:
            print(f"✅ Logged error for user {user_id}: {error_type}")
            return result.data[0]
        else:
            print(f"❌ Failed to log error for user {user_id}")
            return None
            
    except Exception as e:
        print(f"❌ Error logging error for user {user_id}: {str(e)}")
        return None
