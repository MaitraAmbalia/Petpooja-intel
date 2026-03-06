import pandas as pd

# 1. Load the 3 CSV files
df_day1 = pd.read_excel("D1.xlsx")
df_day2 = pd.read_excel("D2.xlsx")
df_day3 = pd.read_excel("D3.xlsx")

# Rename the 'Orders' columns to keep track of them during the merge
df_day1 = df_day1.rename(columns={'Orders': 'Orders_Day1'})
df_day2 = df_day2[['Item Name', 'Orders']].rename(columns={'Orders': 'Orders_Day2'})
df_day3 = df_day3[['Item Name', 'Orders']].rename(columns={'Orders': 'Orders_Day3'})

# Merge the datasets together using a left join on Day 1
df_merged = pd.merge(df_day1, df_day2, on='Item Name', how='left')
df_merged = pd.merge(df_merged, df_day3, on='Item Name', how='left')

# Fill missing historical orders with 0 for new items
df_merged['Orders_Day2'] = df_merged['Orders_Day2'].fillna(0)
df_merged['Orders_Day3'] = df_merged['Orders_Day3'].fillna(0)

# Filter out Add-ons
df_filtered = df_merged[df_merged['Category'] != 'Add-on'].copy()

# Apply the Weighted Moving Average (WMA)
# 50% for Day 1, 30% for Day 2, 20% for Day 3
df_filtered['Weighted_Orders'] = (
    (df_filtered['Orders_Day1'] * 0.5) +
    (df_filtered['Orders_Day2'] * 0.3) +
    (df_filtered['Orders_Day3'] * 0.2)
)

# Separate into snacks and beverages
snacks = df_filtered[df_filtered['Category'] == 'Snack']
beverages = df_filtered[df_filtered['Category'] == 'Beverage']

# 2. Function to find an item based on High/Low strategies using Weighted Orders
def get_combo_item(df_cat, pop_type, mar_type):
    # Calculate medians to establish the threshold for High vs Low
    # Now using the smoothed 'Weighted_Orders' instead of raw daily orders
    med_pop = df_cat['Weighted_Orders'].median()
    med_mar = df_cat['Margin'].median()
    
    # Filter based on Popularity (Weighted Orders)
    if pop_type == 'High':
        pop_cond = df_cat['Weighted_Orders'] >= med_pop
    else:
        pop_cond = df_cat['Weighted_Orders'] < med_pop
        
    # Filter based on Margin
    if mar_type == 'High':
        mar_cond = df_cat['Margin'] >= med_mar
    else:
        mar_cond = df_cat['Margin'] < med_mar
        
    candidates = df_cat[pop_cond & mar_cond]
    
    # If no exact match exists in the quadrant, fall back to the closest item
    if len(candidates) == 0:
        candidates = df_cat
    
    # Sort the candidates to pick the "best" representative of that strategy
    if pop_type == 'High' and mar_type == 'High':
        return candidates.sort_values(by=['Weighted_Orders', 'Margin'], ascending=[False, False]).iloc[0]
    elif pop_type == 'High' and mar_type == 'Low':
        return candidates.sort_values(by=['Weighted_Orders', 'Margin'], ascending=[False, True]).iloc[0]
    elif pop_type == 'Low' and mar_type == 'High':
        return candidates.sort_values(by=['Margin', 'Weighted_Orders'], ascending=[False, True]).iloc[0]

# 3. Select the Items for each combo
# Combo 1: High Popularity + High Margin
c1_snack = get_combo_item(snacks, 'High', 'High')
c1_beverage = get_combo_item(beverages, 'High', 'High')

# Combo 2: High Popularity + Low Margin
c2_snack = get_combo_item(snacks, 'High', 'Low')
c2_beverage = get_combo_item(beverages, 'High', 'Low')

# Combo 3: Low Popularity + High Margin
c3_snack = get_combo_item(snacks, 'Low', 'High')
c3_beverage = get_combo_item(beverages, 'Low', 'High')

# 4. Generate Combos and Apply Discounts
combo_configs = [
    {
        'Name': 'Combo 1 (Star Performers)',
        'Strategy': 'High Pop + High Margin',
        'Discount': 0.05,
        'Snack': c1_snack,
        'Beverage': c1_beverage
    },
    {
        'Name': 'Combo 2 (Traffic Builders)',
        'Strategy': 'High Pop + Low Margin',
        'Discount': 0.08,
        'Snack': c2_snack,
        'Beverage': c2_beverage
    },
    {
        'Name': 'Combo 3 (Hidden Gems)',
        'Strategy': 'Low Pop + High Margin',
        'Discount': 0.10,
        'Snack': c3_snack,
        'Beverage': c3_beverage
    }
]

final_combos = []

for config in combo_configs:
    snack = config['Snack']
    bev = config['Beverage']
    discount_rate = config['Discount']
    
    items = f"{snack['Item Name']} + {bev['Item Name']}"
    
    # Base Calculations
    base_price = snack['Selling Price'] + bev['Selling Price']
    base_margin = snack['Margin'] + bev['Margin']
    
    # Apply Discount
    discount_amount = base_price * discount_rate
    discounted_price = base_price - discount_amount
    new_margin = base_margin - discount_amount
    
    # Track the average of the 3-day weighted popularity
    avg_weighted_orders = (snack['Weighted_Orders'] + bev['Weighted_Orders']) / 2
    
    # FIXED: Using static dictionary keys so Pandas aligns them in the same columns
    final_combos.append({
        'Combo Name': config['Name'],
        'Items': items,
        'Base Price': base_price,
        'Discount %': f"{int(discount_rate*100)}%",         # New static column
        'Discounted Price': round(discounted_price, 2),     # New static column
        'Original Margin': base_margin,
        'New Total Margin': round(new_margin, 2),
    })

# 5. Display and Save
combos_df = pd.DataFrame(final_combos)
print(combos_df.to_string())

combos_df.to_csv("Strategic_Discounted_Combos_Weighted.csv", index=False)