import pandas as pd

# 1. Load the dataset
df = pd.read_csv("Menu.xlsx - Sheet1.csv")

# Filter out Add-ons
df_filtered = df[df['Category'] != 'Add-on'].copy()

# Separate into snacks and beverages
snacks = df_filtered[df_filtered['Category'] == 'Snack']
beverages = df_filtered[df_filtered['Category'] == 'Beverage']

# 2. Function to find an item based on High/Low strategies
def get_combo_item(df_cat, pop_type, mar_type):
    # Calculate medians to establish the threshold for High vs Low
    med_pop = df_cat['Orders'].median()
    med_mar = df_cat['Margin'].median()
    
    # Filter based on Popularity (Orders)
    if pop_type == 'High':
        pop_cond = df_cat['Orders'] >= med_pop
    else:
        pop_cond = df_cat['Orders'] < med_pop
        
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
        return candidates.sort_values(by=['Orders', 'Margin'], ascending=[False, False]).iloc[0]
    elif pop_type == 'High' and mar_type == 'Low':
        return candidates.sort_values(by=['Orders', 'Margin'], ascending=[False, True]).iloc[0]
    elif pop_type == 'Low' and mar_type == 'High':
        return candidates.sort_values(by=['Margin', 'Orders'], ascending=[False, True]).iloc[0]

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
    
    avg_orders = (snack['Orders'] + bev['Orders']) / 2
    
    final_combos.append({
        'Combo Name': config['Name'],
        'Items': items,
        'Base Price': base_price,
        f"Discounted Price ({int(discount_rate*100)}%)": round(discounted_price, 2),
        'Original Margin': base_margin,
        'New Total Margin': round(new_margin, 2),
    })

# 5. Display and Save
combos_df = pd.DataFrame(final_combos)
print(combos_df.to_string())

combos_df.to_csv("Strategic_Discounted_Combos.csv", index=False)