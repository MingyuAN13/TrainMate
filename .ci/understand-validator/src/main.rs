use colored::{Color, Colorize};
use std::{
    collections::HashMap,
    fmt::{Display, Formatter},
    fs::{self, File},
    io::{self, BufRead},
};
use strum::{EnumMessage, IntoEnumIterator};

use strum_macros::{EnumIter, EnumMessage};

use itertools::Itertools;

enum Violation {
    CyclicDependency(u32),
    FanOut(u32),
    ModuleSize(u32),
    AverageCyclomaticComplexity(u32),
    MaxCyclomaticComplexity(u32),
    NumberOfFunctions(u32),
    CodeCommenting(f32),
}

impl Display for Violation {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Violation::CyclicDependency(references) => {
                write!(
                    f,
                    "Cyclic dependency: {} > max 0",
                    references.to_string().red()
                )
            }
            Violation::FanOut(references) => {
                write!(f, "Fan out: {} >= max 16", references.to_string().red())
            }
            Violation::ModuleSize(lines_of_code) => {
                write!(
                    f,
                    "Module size: {} > max 400",
                    lines_of_code.to_string().red()
                )
            }
            Violation::AverageCyclomaticComplexity(avg_cyclomatic) => {
                write!(
                    f,
                    "Average cyclomatic complexity: {} >= max 10",
                    avg_cyclomatic.to_string().red()
                )
            }
            Violation::MaxCyclomaticComplexity(max_cyclomatic) => {
                write!(
                    f,
                    "Max cyclomatic complexity: {} >= max 20",
                    max_cyclomatic.to_string().red()
                )
            }
            Violation::NumberOfFunctions(number_of_functions) => {
                write!(
                    f,
                    "Number of functions: {} > max 20",
                    number_of_functions.to_string().red()
                )
            }
            Violation::CodeCommenting(ratio_comment_to_code) => {
                write!(
                    f,
                    "Code commenting ratio: {} <= min 15%",
                    format!("{}%", (ratio_comment_to_code * 100.0).round()).red()
                )
            }
        }
    }
}

#[derive(Debug, EnumIter, Eq, PartialEq, Hash, Copy, Clone, EnumMessage)]
enum Characteristic {
    #[strum(message = "Module Size")]
    ModuleSize,
    #[strum(message = "Module Complexity")]
    ModuleComplexity,
    #[strum(message = "Module Design")]
    ModuleDesign, // Number of functions
    #[strum(message = "Internal Duplication")]
    InternalDuplication, // Always +2 since the other analyzer forces it to be perfect
    #[strum(message = "External Duplication")]
    ExternalDuplication, // Always +2 since the other analyzer forces it to be perfect
    #[strum(message = "Code Commenting")]
    CodeCommenting,
    #[strum(message = "Cyclic Dependency")]
    CyclicDependency,
    #[strum(message = "Module Coupling")]
    ModuleCoupling,
}

impl Characteristic {
    fn count_violation(&self, violation: &Violation) -> bool {
        match (self, violation) {
            (Characteristic::ModuleSize, Violation::ModuleSize(_)) => true,
            (Characteristic::ModuleComplexity, Violation::AverageCyclomaticComplexity(_)) => true,
            (Characteristic::ModuleComplexity, Violation::MaxCyclomaticComplexity(_)) => true,
            (Characteristic::ModuleDesign, Violation::NumberOfFunctions(_)) => true,
            (Characteristic::CodeCommenting, Violation::CodeCommenting(_)) => true,
            (Characteristic::CyclicDependency, Violation::CyclicDependency(_)) => true,
            (Characteristic::ModuleCoupling, Violation::FanOut(_)) => true,
            _ => false,
        }
    }
    fn calculate_grade(
        &self,
        total_files: usize,
        violations: &HashMap<String, Vec<Violation>>,
    ) -> i8 {
        let violated_files = violations
            .iter()
            .filter(|(_, v)| v.iter().any(|v| self.count_violation(v)))
            .count();

        let percentage = ((violated_files as f32 / total_files as f32) * 100.0).round() as i8;

        println!(
            "{}: {}% {}",
            self.get_message().unwrap(),
            percentage,
            format!("({}/{})", violated_files, total_files)
                .color(GRAY)
                .italic()
        );

        match percentage {
            0..=3 => 2,
            4..=5 => 1,
            6..=10 => 0,
            11..=20 => -1,
            _ => -2,
        }
    }
}

#[derive(Debug, EnumIter, Eq, PartialEq, Hash, EnumMessage, Copy, Clone)]
enum Attribute {
    #[strum(message = "Modularity")]
    Modularity,
    #[strum(message = "Reusability")]
    Reusability,
    #[strum(message = "Analyzability")]
    Analyzability,
    #[strum(message = "Modifiability")]
    Modifiability,
    #[strum(message = "Testability")]
    Testability,
}

impl Attribute {
    fn characterisitcs(&self) -> Vec<Characteristic> {
        match self {
            Attribute::Modularity => vec![
                Characteristic::ModuleDesign,
                Characteristic::CyclicDependency,
                Characteristic::ModuleCoupling,
                Characteristic::ExternalDuplication,
            ],
            Attribute::Reusability => vec![
                Characteristic::InternalDuplication,
                Characteristic::ModuleDesign,
                Characteristic::CyclicDependency,
                Characteristic::ModuleCoupling,
                Characteristic::ExternalDuplication,
            ],
            Attribute::Analyzability => vec![
                Characteristic::InternalDuplication,
                Characteristic::ModuleDesign,
                Characteristic::ModuleSize,
                Characteristic::CodeCommenting,
                Characteristic::CyclicDependency,
            ],
            Attribute::Modifiability => vec![
                Characteristic::ModuleComplexity,
                Characteristic::InternalDuplication,
                Characteristic::ModuleDesign,
                Characteristic::ModuleSize,
                Characteristic::CyclicDependency,
            ],
            Attribute::Testability => vec![
                Characteristic::ModuleComplexity,
                Characteristic::ModuleSize,
                Characteristic::CyclicDependency,
            ],
        }
    }

    fn calculate_grade(&self, characterisitcs: &HashMap<Characteristic, i8>) -> f32 {
        let important_characteristics = self.characterisitcs();

        important_characteristics
            .iter()
            .map(|c| characterisitcs.get(c).unwrap_or(&0))
            .sum::<i8>() as f32
            / important_characteristics.len() as f32
    }
}

const GRAY: Color = Color::TrueColor {
    r: 130,
    g: 130,
    b: 130,
};

fn main() {
    let depencency_violations = check_dependencies();
    let code_quality_violations = check_code_quality();

    let mut violations = join_violations(depencency_violations, code_quality_violations);

    let total_files = violations.len();

    violations.retain(|_, v| !v.is_empty());

    if violations.is_empty() {
        println!("No violations found");
        std::process::exit(0);
    }

    println!("{}", "Grading Scheme:".bold().underline().red());
    println!("");
    let grade = calculate_grade(total_files, &violations);

    println!(
        "{}",
        format!("Final Grade: {}", grade.to_string().green()).bold()
    );
    println!("");

    let mut found_non_ignored_files = false;

    // TODO: Print violations in a nicer way
    println!("{}", "Violations found:".bold().underline().red());
    println!("");
    for (file, violations) in violations.into_iter() {
        let is_ignored = is_ignored(&file);
        if is_ignored {
            println!("{}", format!("{} (IGNORED)", file).italic().color(GRAY));
            for violation in violations {
                println!("{}", format!(" - {}", violation.to_string().color(GRAY)));
            }
            println!("");
            continue;
        }

        found_non_ignored_files = true;
        println!("{}", file.blue());
        for violation in violations {
            println!(" - {}", violation);
        }
        println!("");
    }

    if !found_non_ignored_files {
        println!("No critical violations found");
        std::process::exit(0);
    }

    println!("Critical violations found, please fix them!");
    std::process::exit(1);
}

fn calculate_grade(total_files: usize, violations: &HashMap<String, Vec<Violation>>) -> f32 {
    println!("{}", "Characteristic Grades:".bold().blue());
    let characterisitcs = Characteristic::iter()
        .map(|c| (c, c.calculate_grade(total_files, violations)))
        .collect::<HashMap<_, _>>();

    println!("");

    let attributes = Attribute::iter()
        .map(|a| (a, a.calculate_grade(&characterisitcs)))
        .collect::<Vec<_>>();

    println!("{}", "Attribute Grades:".bold().blue());
    for (attribute, grade) in attributes.iter() {
        println!("{}: {}", attribute.get_message().unwrap(), grade);
    }
    println!("");

    let sum = attributes.iter().map(|(_, g)| g).sum::<f32>();

    (sum + 10.0) / 2.0
}

#[derive(Debug, serde::Deserialize)]
struct Dependency {
    #[serde(rename = "From File")]
    from_file: String,
    #[serde(rename = "To File")]
    to_file: String,
    #[serde(rename = "References")]
    references: u32,
}
fn check_dependencies() -> HashMap<String, Vec<Violation>> {
    let file = fs::File::open("../sonar_analysis.csv").unwrap();
    let mut reader = csv::Reader::from_reader(file);

    let depenciencies: Vec<Dependency> = reader
        .deserialize()
        .collect::<Result<Vec<Dependency>, csv::Error>>()
        .unwrap();

    let cyclic_violations = check_circular_dependencies(&depenciencies);
    let fan_out_violations = check_fan_out(&depenciencies);

    join_violations(cyclic_violations, fan_out_violations)
}

fn check_circular_dependencies(depenciencies: &[Dependency]) -> HashMap<String, Vec<Violation>> {
    let mut violations = HashMap::new();

    for dependency in depenciencies {
        if dependency.from_file != dependency.to_file {
            continue;
        }
        let mut violation = Vec::new();
        violation.push(Violation::CyclicDependency(dependency.references));
        violations
            .entry(dependency.from_file.clone())
            .or_insert(violation);
    }

    violations
}

fn check_fan_out(depenciencies: &[Dependency]) -> HashMap<String, Vec<Violation>> {
    let references: Vec<(String, u32)> = depenciencies
        .iter()
        .group_by(|d| d.from_file.clone())
        .into_iter()
        .map(|(k, v)| (k, v.map(|d| d.references).sum()))
        .collect_vec();

    let mut violations = HashMap::new();
    for (file, references) in references.iter() {
        if *references < 16 {
            continue;
        }
        let mut violation = Vec::new();
        violation.push(Violation::FanOut(*references));
        violations.entry(file.clone()).or_insert(violation);
    }
    violations
}

#[derive(Debug, serde::Deserialize)]
struct Analytic {
    #[serde(rename = "Kind")]
    kind: String,
    #[serde(rename = "Name")]
    name: String,
    #[serde(rename = "File")]
    file: Option<String>,
    #[serde(rename = "AvgCyclomatic")]
    avg_cyclomatic: Option<u32>,
    #[serde(rename = "CountLineCode")]
    count_line_code: Option<u32>,
    #[serde(rename = "MaxCyclomatic")]
    max_cyclomatic: Option<u32>,
    #[serde(rename = "RatioCommentToCode")]
    ratio_comment_to_code: Option<f32>,
    #[serde(rename = "CountDeclFunction")]
    count_decl_function: Option<u32>,
}

impl Display for Analytic {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{} {}", self.kind, self.name)?;
        if let Some(file) = &self.file {
            write!(f, " in {}", file)?;
        };
        Ok(())
    }
}

fn check_code_quality() -> HashMap<String, Vec<Violation>> {
    let file = fs::File::open("../sonar_analysis.csv").unwrap();
    let mut reader = csv::ReaderBuilder::new()
        .has_headers(true)
        .delimiter(b',')
        .from_reader(file);

    let violations = reader
        .deserialize()
        .into_iter()
        .map(|result: Result<Analytic, csv::Error>| result.unwrap())
        .filter(|analytic| analytic.file.is_some())
        .map(|analytic| (analytic.file.clone().unwrap(), check_analysers(&analytic)))
        .collect::<Vec<_>>();

    // Some files have multiple ways to violate, we need to merge the different violations by file
    let mut grouped_violations: HashMap<String, Vec<Violation>> = HashMap::new();
    for (file, violation) in violations.into_iter() {
        if let Some(existing_violations) = grouped_violations.get_mut(&file) {
            existing_violations.extend(violation);
        } else {
            grouped_violations.insert(file, violation);
        }
    }
    grouped_violations
}

fn check_analysers(analytic: &Analytic) -> Vec<Violation> {
    let mut violations = Vec::new();
    if let Some(violation) = check_module_size(analytic) {
        violations.push(violation);
    }
    if let Some(violation) = check_average_cyclomatic_complexity(analytic) {
        violations.push(violation);
    }
    if let Some(violation) = check_max_cyclomatic_complexity(analytic) {
        violations.push(violation);
    }
    if let Some(violation) = check_number_of_functions(analytic) {
        violations.push(violation);
    }
    if let Some(violation) = check_code_commenting(analytic) {
        violations.push(violation);
    }
    violations
}

fn check_module_size(analytic: &Analytic) -> Option<Violation> {
    let Some(module_size) = analytic.count_line_code else {
        return None;
    };
    if module_size <= 400 {
        None
    } else {
        Some(Violation::ModuleSize(module_size))
    }
}
fn check_average_cyclomatic_complexity(analytic: &Analytic) -> Option<Violation> {
    let Some(avg_cyclomatic) = analytic.avg_cyclomatic else {
        return None;
    };
    if avg_cyclomatic < 10 {
        None
    } else {
        Some(Violation::AverageCyclomaticComplexity(avg_cyclomatic))
    }
}

fn check_max_cyclomatic_complexity(analytic: &Analytic) -> Option<Violation> {
    let Some(max_cyclomatic) = analytic.max_cyclomatic else {
        return None;
    };
    if max_cyclomatic < 20 {
        None
    } else {
        Some(Violation::MaxCyclomaticComplexity(max_cyclomatic))
    }
}
fn check_number_of_functions(analytic: &Analytic) -> Option<Violation> {
    let Some(count_decl_function) = analytic.count_decl_function else {
        return None;
    };
    if count_decl_function <= 20 {
        None
    } else {
        Some(Violation::NumberOfFunctions(count_decl_function))
    }
}
fn check_code_commenting(analytic: &Analytic) -> Option<Violation> {
    let Some(ratio_comment_to_code) = analytic.ratio_comment_to_code else {
        return None;
    };
    if ratio_comment_to_code > 0.15 {
        None
    } else {
        Some(Violation::CodeCommenting(ratio_comment_to_code))
    }
}

fn join_violations(
    first_map: HashMap<String, Vec<Violation>>,
    second_map: HashMap<String, Vec<Violation>>,
) -> HashMap<String, Vec<Violation>> {
    let mut combined_violations = first_map;
    for (file, violations) in second_map.into_iter() {
        if let Some(existing_violations) = combined_violations.get_mut(&file) {
            existing_violations.extend(violations);
        } else {
            combined_violations.insert(file, violations);
        }
    }
    combined_violations
}

/// Reads the file and if the first line contains the string "validate-ignore" it will return true
/// otherwise it will return false
fn is_ignored(file: &str) -> bool {
    let file = File::open(format!("../../{}", file)).unwrap();
    let mut reader = io::BufReader::new(file);
    let mut line = String::new();
    reader.read_line(&mut line).unwrap();
    line.contains("validate-ignore")
}
