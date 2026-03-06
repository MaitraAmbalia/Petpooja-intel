import pandas as pd
from sklearn.preprocessing import MinMaxScaler

# 1. Load the 3 CSV files
# Day 1 is assumed to be the most recent day (highest weight)
df_day1 = pd.read_excel("D1.xlsx")
df_day2 = pd.read_excel("D2.xlsx")
df_day3 = pd.read_excel("D3.xlsx")

# 2. Rename the 'Orders' columns to keep track of them during the merge
df_day1 = df_day1.rename(columns={'Orders': 'Orders_Day1'})

# For Day 2 and Day 3, we only extract 'Item Name' and 'Orders' 
# This prevents duplicating columns like 'Selling Price' and 'Margin'
df_day2 = df_day2[['Item Name', 'Orders']].rename(columns={'Orders': 'Orders_Day2'})
df_day3 = df_day3[['Item Name', 'Orders']].rename(columns={'Orders': 'Orders_Day3'})

# 3. Merge the datasets together
# We use a 'left' join on Day 1. This ensures our final menu only contains items active on the most recent day.
df_merged = pd.merge(df_day1, df_day2, on='Item Name', how='left')
df_merged = pd.merge(df_merged, df_day3, on='Item Name', how='left')

# If an item was introduced recently and has no sales data on Day 2 or 3, fill the missing values with 0
df_merged['Orders_Day2'] = df_merged['Orders_Day2'].fillna(0)
df_merged['Orders_Day3'] = df_merged['Orders_Day3'].fillna(0)

# 4. Filter out Add-ons (Just in case they exist in the raw data)
df_filtered = df_merged[df_merged['Category'] != 'Add-on'].copy()

# 5. Apply the Weighted Moving Average (WMA)
# 50% for Day 1, 30% for Day 2, 20% for Day 3
df_filtered['Weighted_Orders'] = (
    (df_filtered['Orders_Day1'] * 0.5) +
    (df_filtered['Orders_Day2'] * 0.3) +
    (df_filtered['Orders_Day3'] * 0.2)
)

# 6. Normalize the Static Margin and the new Dynamic Weighted Orders to a 0-1 scale
scaler = MinMaxScaler()
df_filtered[['Margin_norm', 'Orders_norm']] = scaler.fit_transform(df_filtered[['Margin', 'Weighted_Orders']])

# 7. Calculate the unified performance score
# Equal weight is given to profitability (margin) and consistent popularity (weighted orders)
df_filtered['Score'] = df_filtered['Margin_norm'] + df_filtered['Orders_norm']

# Separate the items into their respective categories and sort them by the highest score
snacks = df_filtered[df_filtered['Category'] == 'Snack'].sort_values('Score', ascending=False)
beverages = df_filtered[df_filtered['Category'] == 'Beverage'].sort_values('Score', ascending=False)
desserts = df_filtered[df_filtered['Category'] == 'Dessert'].sort_values('Score', ascending=False)

# 8. Generate Combos
discount_rate = 0.05
combos = []

# Safety check: Prevent errors if a category happens to have fewer than 5 items available
max_combos = min(3, len(snacks), len(beverages), len(desserts)) 

for i in range(max_combos):
    # Select the i-th best performing item from each category
    snack = snacks.iloc[i]
    beverage = beverages.iloc[i]
    dessert = desserts.iloc[i]
    
    combo_name = f"Combo {i+1}"
    items = f"{snack['Item Name']} + {beverage['Item Name']} + {dessert['Item Name']}"
    
    # Financial calculations
    base_price = snack['Selling Price'] + beverage['Selling Price'] + dessert['Selling Price']
    base_margin = snack['Margin'] + beverage['Margin'] + dessert['Margin']
    
    discount_amount = base_price * discount_rate
    discounted_price = base_price - discount_amount
    discounted_margin = base_margin - discount_amount
    
    # Calculate the average weighted orders for the whole combo to assess overall combo popularity
    avg_weighted_orders = (snack['Weighted_Orders'] + beverage['Weighted_Orders'] + dessert['Weighted_Orders']) / 3
    
    combos.append({
        'Combo Name': combo_name,
        'Items': items,
        'Base Price': round(base_price, 2),
        'Discounted Price (5%)': round(discounted_price, 2),
        'Original Margin': round(base_margin, 2),
        'New Total Margin': round(discounted_margin, 2),
    })

# Convert the generated combos into a clean DataFrame and display them
combos_df = pd.DataFrame(combos)
print(combos_df)

# Export the final result to a new CSV file
combos_df.to_csv("Suggested_Combos_Weighted.csv", index=False)