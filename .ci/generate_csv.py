import json
import csv

# Read the JSON file
with open('sonar_analysis.json', 'r') as json_file:
    data = json.load(json_file)

# Define the column names for the CSV file
csv_columns = [
    "File", 
    "AvgCyclomatic", 
    "MaxCyclomatic", 
    "CountLineCode", 
    "RatioCommentToCode", 
    "CountDeclFunction"
]

# Open the CSV file and write the data
with open('understand-settings.csv', 'w', newline='') as csv_file:
    writer = csv.DictWriter(csv_file, fieldnames=csv_columns)
    writer.writeheader()

    for component in data['components']:
        # Construct the data for each row
        file_data = {
            "File": component['path'],
            "AvgCyclomatic": component['measures'][1]['value'] if len(component['measures']) > 1 else None,
            "MaxCyclomatic": component['measures'][2]['value'] if len(component['measures']) > 2 else None,
            "CountLineCode": component['measures'][3]['value'] if len(component['measures']) > 3 else None,
            "RatioCommentToCode": float(component['measures'][0]['value']) / 100 if len(component['measures']) > 0 else None,
            "CountDeclFunction": component['measures'][2]['value'] if len(component['measures']) > 2 else None,
        }
        writer.writerow(file_data)