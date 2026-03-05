import pandas as pd
from sklearn.preprocessing import MinMaxScaler

# Load the dataset
df = pd.read_excel("Menu.xlsx")

# 1. Filter out Add-ons
df_filtered = df[df['Category'] != 'Add-on'].copy()

# 2. Normalize Margin and Orders to standard scale (0 to 1)
scaler = MinMaxScaler()
df_filtered[['Margin_norm', 'Orders_norm']] = scaler.fit_transform(df_filtered[['Margin', 'Orders']])

# 3. Calculate a combined score
# Equal weight to popularity and margin
df_filtered['Score'] = df_filtered['Margin_norm'] + df_filtered['Orders_norm']

# Separate into categories and sort by the highest score
snacks = df_filtered[df_filtered['Category'] == 'Snack'].sort_values('Score', ascending=False)
beverages = df_filtered[df_filtered['Category'] == 'Beverage'].sort_values('Score', ascending=False)
desserts = df_filtered[df_filtered['Category'] == 'Dessert'].sort_values('Score', ascending=False)

# Set the discount rate (5%)
discount_rate = 0.05

# 4. Generate 5 combos
combos = []
for i in range(5):
    # Picking the i-th best snack, beverage, and dessert
    snack = snacks.iloc[i]
    beverage = beverages.iloc[i]
    dessert = desserts.iloc[i]
    
    combo_name = f"Combo {i+1}"
    items = f"{snack['Item Name']} + {beverage['Item Name']} + {dessert['Item Name']}"
    
    # Calculate base price and margin
    base_price = snack['Selling Price'] + beverage['Selling Price'] + dessert['Selling Price']
    base_margin = snack['Margin'] + beverage['Margin'] + dessert['Margin']
    
    # Apply the 5% discount
    discount_amount = base_price * discount_rate
    discounted_price = base_price - discount_amount
    
    # The discount eats directly into the profit margin, so we subtract it from the base margin
    discounted_margin = base_margin - discount_amount
    
    avg_orders = (snack['Orders'] + beverage['Orders'] + dessert['Orders']) / 3
    
    combos.append({
        'Combo Name': combo_name,
        'Items': items,
        'Base Price': base_price,
        'Discounted Price (5%)': discounted_price,
        'Original Margin': base_margin,
        'New Total Margin': discounted_margin,
    })

# Convert to DataFrame and view
combos_df = pd.DataFrame(combos)
print(combos_df)

# Optionally save to a CSV file
combos_df.to_csv("Suggested_Combos_Discounted.csv", index=False)