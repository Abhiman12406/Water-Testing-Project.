"""
Script to convert water_dataset.mat to CSV format.

Original dataset:
- Spatio-temporal water quality prediction dataset (USGS data for Georgia, USA)
- 37 water monitoring locations
- 11 input features
- Target variable: pH median ('pH, water, unfiltered, field, standard units (Median)')
- Train: 423 contiguous dates from 2016-01-28 to 2017-03-25
- Test: 282 contiguous dates from 2017-03-26 to 2018-01-01
- Total observations: 705 days * 37 locations = 26,085 records
"""

import os
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
import scipy.io


def convert_water_dataset():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    mat_path = os.path.join(base_dir, "water+quality+prediction-1", "water_dataset.mat")
    output_dir = os.path.join(base_dir, "water+quality+prediction-1")

    print(f"Loading {mat_path}...")
    data = scipy.io.loadmat(mat_path)

    loc_ids = data["location_ids"].flatten()

    # Map each 1-based station index to its location group (0, 1, or 2)
    group_map = {}
    for g_idx, g in enumerate(data["location_group"][0]):
        for loc_idx_1based in g.flatten():
            group_map[loc_idx_1based] = g_idx

    # Export locations metadata
    locations_df = pd.DataFrame([
        {
            "location_index": i + 1,
            "location_id": int(loc_ids[i]),
            "location_group": group_map[i + 1]
        }
        for i in range(len(loc_ids))
    ])
    locations_csv_path = os.path.join(output_dir, "locations.csv")
    locations_df.to_csv(locations_csv_path, index=False)
    print(f"Saved station metadata to: {locations_csv_path}")

    # Feature names
    feature_names = [
        "Specific_conductance_Max",
        "pH_Max",
        "pH_Min",
        "Specific_conductance_Min",
        "Specific_conductance_Mean",
        "Dissolved_oxygen_Max",
        "Dissolved_oxygen_Mean",
        "Dissolved_oxygen_Min",
        "Temperature_Mean",
        "Temperature_Min",
        "Temperature_Max"
    ]
    target_name = "pH_Median"

    train_rows = []
    test_rows = []

    # 1. Process Train Set: 423 contiguous dates starting 2016-01-28
    start_tr = datetime(2016, 1, 28)
    X_tr = data["X_tr"]
    Y_tr = data["Y_tr"]

    for t in range(423):
        cur_date = (start_tr + timedelta(days=t)).strftime("%Y-%m-%d")
        x_mat = X_tr[0, t]      # shape (37, 11)
        y_vec = Y_tr[:, t]      # shape (37,)

        for loc_i in range(37):
            loc_1based = loc_i + 1
            row = {
                "date": cur_date,
                "split": "train",
                "location_index": loc_1based,
                "location_id": int(loc_ids[loc_i]),
                "location_group": group_map[loc_1based],
            }
            for f_i, f_col in enumerate(feature_names):
                row[f_col] = float(x_mat[loc_i, f_i])
            row[target_name] = float(y_vec[loc_i])
            train_rows.append(row)

    # 2. Process Test Set: 282 contiguous dates starting 2017-03-26 to 2018-01-01
    start_te = datetime(2017, 3, 26)
    X_te = data["X_te"]
    Y_te = data["Y_te"]

    for t in range(282):
        cur_date = (start_te + timedelta(days=t)).strftime("%Y-%m-%d")
        x_mat = X_te[0, t]      # shape (37, 11)
        y_vec = Y_te[:, t]      # shape (37,)

        for loc_i in range(37):
            loc_1based = loc_i + 1
            row = {
                "date": cur_date,
                "split": "test",
                "location_index": loc_1based,
                "location_id": int(loc_ids[loc_i]),
                "location_group": group_map[loc_1based],
            }
            for f_i, f_col in enumerate(feature_names):
                row[f_col] = float(x_mat[loc_i, f_i])
            row[target_name] = float(y_vec[loc_i])
            test_rows.append(row)

    df_train = pd.DataFrame(train_rows)
    df_test = pd.DataFrame(test_rows)
    df_all = pd.concat([df_train, df_test], ignore_index=True)

    # Save to water+quality+prediction-1/
    full_csv_path = os.path.join(output_dir, "water_dataset.csv")
    train_csv_path = os.path.join(output_dir, "water_train.csv")
    test_csv_path = os.path.join(output_dir, "water_test.csv")

    df_all.to_csv(full_csv_path, index=False)
    df_train.to_csv(train_csv_path, index=False)
    df_test.to_csv(test_csv_path, index=False)

    # Also save a copy of water_dataset.csv in the root folder for easy access
    root_csv_path = os.path.join(base_dir, "water_dataset.csv")
    df_all.to_csv(root_csv_path, index=False)

    print(f"Successfully generated:")
    print(f" - Full dataset: {full_csv_path} ({len(df_all):,} rows, {len(df_all.columns)} columns)")
    print(f" - Train set:    {train_csv_path} ({len(df_train):,} rows)")
    print(f" - Test set:     {test_csv_path} ({len(df_test):,} rows)")
    print(f" - Root copy:    {root_csv_path}")


if __name__ == "__main__":
    convert_water_dataset()
