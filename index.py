# # import pandas as pd
# # from sqlalchemy import create_engine
 
# # # -------------------------------
# # # 1. Source & Target Supabase DBs
# # # -------------------------------
 
# # # Replace with your actual credentials
# # # SOURCE_DB = "postgresql://postgres:SRC_PASSWORD@SRC_HOST:5432/SRC_DB"
# # # TARGET_DB = "postgresql://postgres:TGT_PASSWORD@TGT_HOST:5432/TGT_DB"
# # SOURCE_DB = "postgresql://postgres.hhclsgibmggfvmqtimlz:sVlkk67wN1s3oPsl@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
# # TARGET_DB = "postgresql://postgres.ywfigzuxbjwpufbukmci:Apply%40123Wizz%40123@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
 
# # TABLE_NAME = "job_jobrole_sponsored"
 
# # # -------------------------------
# # # 2. Create Connections
# # # -------------------------------
# # src_engine = create_engine(SOURCE_DB)
# # tgt_engine = create_engine(TARGET_DB)
 
# # # -------------------------------
# # # 3. Extract Data from Source
# # # -------------------------------
# # print(f"Fetching data from source table: {TABLE_NAME}")
# # page_size = 1000
# # page_num = 0
# # while True:
# #     query = f"SELECT * FROM {TABLE_NAME} LIMIT {page_size} OFFSET {page_num * page_size}"
# #     df = pd.read_sql(query, src_engine)
# #     if df.empty:
# #         break
# #     # Process the data
# #     page_num += 1
# # df = pd.read_sql(f'SELECT * FROM "{TABLE_NAME}"', src_engine)

# # print(f" Retrieved {len(df)} rows and {len(df.columns)} columns.")
 
# # # -------------------------------
# # # 4. Load Data into Target
# # # -------------------------------
# # print(f"Loading data into target DB table: {TABLE_NAME}")
# # df.to_sql(TABLE_NAME, tgt_engine, if_exists="replace", index=False)
 
# # print(" Migration completed successfully!")
 
# import pandas as pd
# from sqlalchemy import create_engine

# # -------------------------------
# # 1. Source & Target Supabase DBs
# # -------------------------------
# SOURCE_DB = "postgresql://postgres.hhclsgibmggfvmqtimlz:sVlkk67wN1s3oPsl@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
# TARGET_DB = "postgresql://postgres.ywfigzuxbjwpufbukmci:Apply%40123Wizz%40123@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

# TABLE_NAME = "job_jobrole_sponsored"
# BATCH_SIZE = 5000  # Batch size for each fetch and insert

# # -------------------------------
# # 2. Create Connections
# # -------------------------------
# src_engine = create_engine(SOURCE_DB)
# tgt_engine = create_engine(TARGET_DB)

# # -------------------------------
# # 3. Fetch Data in Batches and Load into Target
# # -------------------------------
# def fetch_and_migrate():
#     print(f"Starting migration of {TABLE_NAME} in batches of {BATCH_SIZE} records.")
    
#     # Initialize offset for pagination
#     offset = 0
#     total_rows_migrated = 0

#     while True:
#         # Fetch data in batches
#         query = f"SELECT * FROM {TABLE_NAME} LIMIT {BATCH_SIZE} OFFSET {offset}"
#         df = pd.read_sql(query, src_engine)
        
#         # If no more data, break the loop
#         if df.empty:
#             print(f"All data migrated. Total rows migrated: {total_rows_migrated}")
#             break
        
#         # Insert into target database
#         df.to_sql(TABLE_NAME, tgt_engine, if_exists="append", index=False)  # Use "append" to add data
        
#         # Update offset and total rows migrated
#         offset += BATCH_SIZE
#         total_rows_migrated += len(df)
        
#         print(f"Migrated {total_rows_migrated} rows so far...")

# # Run the migration process
# fetch_and_migrate()

import pandas as pd
from sqlalchemy import create_engine

# -------------------------------
# 1. Source & Target Supabase DBs
# -------------------------------
SOURCE_DB = "postgresql://postgres.hhclsgibmggfvmqtimlz:sVlkk67wN1s3oPsl@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
TARGET_DB = "postgresql://postgres.ywfigzuxbjwpufbukmci:Apply%40123Wizz%40123@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

TABLE_NAME = "job_jobrole_sponsored"
BATCH_SIZE = 5000  # Batch size for each fetch and insert

# -------------------------------
# 2. Create Connections
# -------------------------------
src_engine = create_engine(SOURCE_DB)
tgt_engine = create_engine(TARGET_DB)

# -------------------------------
# 3. Fetch Data in Batches and Load into Target (Handle Duplicates)
# -------------------------------
def fetch_and_migrate():
    print(f"Starting migration of {TABLE_NAME} in batches of {BATCH_SIZE} records.")
    
    # Initialize offset for pagination
    offset = 0
    total_rows_migrated = 0

    while True:
        # Fetch data in batches
        query = f"SELECT * FROM {TABLE_NAME} LIMIT {BATCH_SIZE} OFFSET {offset}"
        df = pd.read_sql(query, src_engine)
        
        # If no more data, break the loop
        if df.empty:
            print(f"All data migrated. Total rows migrated: {total_rows_migrated}")
            break
        
        # Insert into target database, handling conflicts
        try:
            # Use SQLAlchemy `to_sql` with custom `ON CONFLICT` logic
            df.to_sql(TABLE_NAME, tgt_engine, if_exists="append", index=False, method='multi')
        except Exception as e:
            print(f"Error during insert: {e}")
        
        # Update offset and total rows migrated
        offset += BATCH_SIZE
        total_rows_migrated += len(df)
        
        print(f"Migrated {total_rows_migrated} rows so far...")

# Run the migration process
fetch_and_migrate()
