import csv
from collections import defaultdict

# Input and output file paths
input_file = '/home/runner/work/TrainMate/TrainMate/dependency_graph/dependency-check-report.csv'
output_file = '/home/runner/work/TrainMate/TrainMate/.ci/parsed_dependency_report.csv'

# Initialize a dictionary to count references
dependency_counts = defaultdict(int)

# Read the OWASP Dependency-Check CSV file
with open(input_file, 'r', newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)

    for row in reader:
        from_file = row['DependencyPath']  # Adjust according to your actual column name
        to_file = row['Identifiers']       # Adjust according to your actual column name

        # Count the reference
        dependency_counts[(from_file, to_file)] += 1

# Write the parsed output to a new CSV file
with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
    fieldnames = ['From File', 'To File', 'References']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for (from_file, to_file), count in dependency_counts.items():
        writer.writerow({
            'From File': from_file,
            'To File': to_file,
            'References': count
        })

print(f"Parsed dependency report written to {output_file}")