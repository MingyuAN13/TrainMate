import json
import csv
import sys

def generate_analytic_csv(json_path, csv_path):
    with open(json_path, 'r') as json_file:
        data = json.load(json_file)

    components = data.get('components', [])

    with open(csv_path, 'w', newline='') as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow([
            "Kind", "Name", "File", 
            "AvgCyclomatic", "CountLineCode", 
            "MaxCyclomatic", "RatioCommentToCode", 
            "CountDeclFunction"
        ])

        for component in components:
            kind = component.get("qualifier", "FIL")
            name = component.get("name")
            file_path = component.get("path", name)

            # Initialize metrics
            avg_cyclomatic = None
            count_line_code = None
            max_cyclomatic = None
            ratio_comment_to_code = None
            count_decl_function = None

            # Extract measures
            for measure in component.get("measures", []):
                if measure["metric"] == "complexity":
                    avg_cyclomatic = int(measure["value"])
                    max_cyclomatic = max_cyclomatic or int(measure["value"])  # Ensure max is captured if set
                elif measure["metric"] == "ncloc":
                    count_line_code = int(measure["value"])
                elif measure["metric"] == "comment_lines_density":
                    ratio_comment_to_code = float(measure["value"])
                elif measure["metric"] == "functions":
                    count_decl_function = int(measure["value"])

            # Write to CSV
            writer.writerow([
                kind, name, file_path, 
                avg_cyclomatic, count_line_code, 
                max_cyclomatic, ratio_comment_to_code, 
                count_decl_function
            ])

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 generate_analytic_csv.py <input_json_path> <output_csv_path>")
        sys.exit(1)

    generate_analytic_csv(sys.argv[1], sys.argv[2])