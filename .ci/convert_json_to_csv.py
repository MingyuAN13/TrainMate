import json
import csv

# Load the dependency graph from cargo-deps JSON output
with open('dependency_graph.json', 'r') as json_file:
    dependencies = json.load(json_file)

# Prepare CSV output
output_csv_path = "../dependency_graph.csv"
with open(output_csv_path, mode='w', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=["From File", "To File", "References"])
    writer.writeheader()

    for dep in dependencies['dependencies']:
        from_file = dep['crate']
        for dep_info in dep['deps']:
            to_file = dep_info['crate']
            references = 1  # Default to 1 if no specific reference count is available
            writer.writerow({
                "From File": from_file,
                "To File": to_file,
                "References": references
            })

print(f"Dependency CSV generated at {output_csv_path}")