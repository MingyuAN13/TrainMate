import React from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import { Chip } from "@nextui-org/react";

//the interface for general information
interface GeneralInformationProps {
    name?: string;
    starttime?: string;
    runtime?: string;
    status?: string;
    statusCode?: string;
    imageName?: string;
}
// Interface for individual parameter
interface Parameter {
    name: string;
    value: string;
}
// Interface for task parameters
interface ParameterTableProps {
    parameters?: Parameter[];
}
//  Interface for tag
export interface Tag {
    name: string;
    id: string;
    type: string;
}

//Component for the parameters table
export function ParameterTable({ parameters }: ParameterTableProps): JSX.Element {
    //Columns for the parameter table
    const columns = [
        { key: "label", label: "NAME" },
        { key: "value", label: "VALUE" },
    ];
    //Returns the parameters as a table
    return (
        <Table aria-label="Example table with dynamic content" className="w-full">
            {/* Table header with column names */}
            <TableHeader columns={columns}>
                {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
            </TableHeader>
            {/**Printing paramater labels and values for each row */}
            <TableBody items={parameters}>
                {(item: Parameter) => (
                    <TableRow key={item.name} data-cy="table-row">
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.value}</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}

type Status = "done" | "error" | "todo" | "locked";

type ChipColor = "default" | "primary" | "danger" | "secondary" | "success" | "warning" | undefined;
// Map status to chip color
const statusColorMap: Record<Status, ChipColor> = {
    todo: "primary",
    error: "danger",
    done: "success",
    locked: "warning",
};

export function GeneralInformation({
    starttime,
    runtime,
    status,
    name,
    statusCode,
    imageName,
}: GeneralInformationProps): JSX.Element {
    return (
        <div className="bg-white shadow rounded-2xl">
            {/**Returns the task title */}
            <div className="flex flex-row justify-center mx-4 pt-2">
                {/* Name of task */}
                <h1
                    className="overflow-hidden whitespace-nowrap text-ellipsis font-semibold text-xl mr-4"
                    data-cy="task-name"
                >
                    {name}
                </h1>
            </div>
            {/* Overview with all task properties */}
            <div className="flex flex-row justify-around gap-4 p-2 items-center">
                <div data-cy="image">
                    {/**Returns the runtime of the task */}
                    <b>Image: </b>
                    {imageName}
                </div>
                <div data-cy="start-time">
                    {/**Returns the creation date of the task */}
                    <b>Start time: </b>
                    {starttime}
                </div>
                <div data-cy="run-time">
                    {/**Returns the runtime of the task */}
                    <b>Runtime: </b>
                    {runtime}
                </div>
                <div data-cy="status-code">
                    {/**Returns the runtime of the task */}
                    <b>Status code: </b>
                    {statusCode}
                </div>
                <div>
                    {/**Returns the status of the task */}
                    <b>Status: </b>
                    {/* Loads in chip with corresponding chip color */}
                    <Chip
                        className="capitalize"
                        color={statusColorMap[status as Status]}
                        size="lg"
                        variant="flat"
                        data-cy="status"
                    >
                        {status}
                    </Chip>
                </div>
            </div>
        </div>
    );
}

// Exporting the components
const exports = { ParameterTable, GeneralInformation };
export default exports;
