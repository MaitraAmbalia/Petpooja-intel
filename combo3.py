import pandas as pd

# 1. Load the dataset
df = pd.read_excel("Menu.xlsx")

# Filter out Add-ons
df_filtered = df[df['Category'] != 'Add-on'].copy()

# 2. Separate into snacks and desserts
snacks = df_filtered[df_filtered['Category'] == 'Snack']
desserts = df_filtered[df_filtered['Category'] == 'Dessert']

# 3. Function to find an item based on High/Low strategies
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

# 4. Select the Items for each combo
# Combo 1: High Popularity + High Margin
c1_snack = get_combo_item(snacks, 'High', 'High')
c1_dessert = get_combo_item(desserts, 'High', 'High')

# Combo 2: High Popularity + Low Margin
c2_snack = get_combo_item(snacks, 'High', 'Low')
c2_dessert = get_combo_item(desserts, 'High', 'Low')

# Combo 3: Low Popularity + High Margin
c3_snack = get_combo_item(snacks, 'Low', 'High')
c3_dessert = get_combo_item(desserts, 'Low', 'High')

# 5. Generate Combos and Apply Discounts
combo_configs = [
    {
        'Name': 'Combo 1',
        'Strategy': 'High Pop + High Margin',
        'Discount': 0.05,
        'Snack': c1_snack,
        'Dessert': c1_dessert
    },
    {
        'Name': 'Combo 2',
        'Strategy': 'High Pop + Low Margin',
        'Discount': 0.08,
        'Snack': c2_snack,
        'Dessert': c2_dessert
    },
    {
        'Name': 'Combo 3',
        'Strategy': 'Low Pop + High Margin',
        'Discount': 0.10,
        'Snack': c3_snack,
        'Dessert': c3_dessert
    }
]

final_combos = []

for config in combo_configs:
    snack = config['Snack']
    dessert = config['Dessert']
    discount_rate = config['Discount']
    
    items = f"{snack['Item Name']} + {dessert['Item Name']}"
    
    # Base Calculations
    base_price = snack['Selling Price'] + dessert['Selling Price']
    base_margin = snack['Margin'] + dessert['Margin']
    
    # Apply Discount
    discount_amount = base_price * discount_rate
    discounted_price = base_price - discount_amount
    new_margin = base_margin - discount_amount
    
    avg_orders = (snack['Orders'] + dessert['Orders']) / 2
    
    final_combos.append({
        'Combo Name': f"{config['Name']} ({int(discount_rate*100)}% Off)",
        'Items': items,
        'Base Price': base_price,
        'Discounted Price': round(discounted_price, 2),
        'Original Margin': base_margin,
        'Total Margin': round(new_margin, 2),
        
    })

# 6. Display and Save
combos_df = pd.DataFrame(final_combos)
print(combos_df)

combos_df.to_csv("Strategic_Discounted_Combos.csv", index=False)