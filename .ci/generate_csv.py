import json
import csv
import sys

def generate_csv(json_file, csv_file):
    with open(json_file, 'r') as f:
        data = json.load(f)

    components = data.get('components', [])

    with open(csv_file, 'w', newline='') as f:
        writer = csv.writer(f)
        # 写入CSV表头
        writer.writerow([
            "File", "Kind", "Name", "AvgCyclomatic", 
            "CountLineCode", "MaxCyclomatic", "RatioCommentToCode", "CountDeclFunction"
        ])

        for component in components:
            file_path = component.get('path', '')
            measures = {m['metric']: m['value'] for m in component.get('measures', [])}

            writer.writerow([
                file_path, 
                "File", 
                component.get('name', ''), 
                measures.get('complexity', ''),
                measures.get('ncloc', ''),
                measures.get('max_complexity', ''),  # 
                measures.get('comment_lines_density', ''),
                measures.get('functions', '')
            ])

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python generate_csv.py <input_json_file> <output_csv_file>")
    else:
        generate_csv(sys.argv[1], sys.argv[2])