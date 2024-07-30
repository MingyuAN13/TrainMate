"use client";
import ReusableTable from "@components/TableComponent";
import { TableRow, TableCell, SortDescriptor, Chip, Button, Link } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import SelectDropdown from "@components/SelectDropdown";

//Import the data that is used in the table
const columns = [
    { uid: "name", name: "Name", sortable: true },
    { uid: "image", name: "Image Name", sortable: false },
    { uid: "tags", name: "Tags", sortable: false },
    { uid: "status", name: "Status", sortable: false },
];

//Defining status types a task can have
type Status = "done" | "error" | "todo" | "locked";
//Defining colors a status chip can have
type ChipColor = "primary" | "success" | "warning" | "danger";

//Mapping statuses to chip colors
const statusColorMap: Record<Status, ChipColor> = {
    done: "success",
    error: "danger",
    locked: "warning",
    todo: "primary",
};

//Interface for the task parameters
interface Task {
    id: string;
    token_id: string;
    name: string;
    image: string;
    tags: { id: string; name: string; type: string }[];
    status: string;
}

interface TaskTableProps {
    tasks: Task[];
}

// Defines task table that will show the overview of all tasks
export default function TaskTable({ tasks }: TaskTableProps) {
    //Defining the constants that are used
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ column: "name", direction: "ascending" });
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [sortedTasks, setSortedTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [filterValue, setFilterValue] = useState<string>("");

    // Extract unique tag names from tasks
    const uniqueTags = Array.from(new Set(tasks.flatMap((task) => task.tags.map((tag) => tag.name))));
    // Extract unique image names from tasks
    const uniqueImages = Array.from(new Set(tasks.map((task) => task.image)));

    //Sorting tasks by sorting descriptors
    useEffect(() => {
        const sorted = tasks.toSorted((a, b) => {
            const larger = a[sortDescriptor.column as string] > b[sortDescriptor.column as string];
            const num = larger ? 1 : -1;
            return sortDescriptor.direction === "ascending" ? -num : num;
        });
        setSortedTasks(sorted);
    }, [sortDescriptor, tasks]);

    //Filtering values
    useEffect(() => {
        {
            /**Filtering by name */
        }
        const filteredName = sortedTasks.filter((task) => {
            return task.name.toLowerCase().includes(filterValue.toLowerCase());
        });
        {
            /**Filtering by tag */
        }
        const filteredTag = filteredName.filter((task) =>
            selectedTags.every((tag) => task.tags.some((tTag) => tTag.name === tag)),
        );
        {
            /**Filtering by image name */
        }
        const filteredImage = filteredTag.filter(
            (task) => selectedImages.length === 0 || selectedImages.includes(task.image),
        );
        setFilteredTasks(filteredImage);
    }, [filterValue, sortedTasks, selectedImages, selectedTags]);

    //Redirecting to task view page for each row
    const router = useRouter();

    const onRowClick = (taskId: string) => {
        const task = tasks.find((task) => String(task.id) === taskId);
        const tokenId = task?.token_id;
        // If the task is found, navigate to the task using the taskId or another property
        if (tokenId) {
            // Assuming the tokenId is derived from the task ID or another property
            router.push(`/app/tasks/${tokenId}`);
        }
    };

    return (
        <div data-cy="task-table-wrapper">
            <ReusableTable
                setFilterValue={setFilterValue}
                filterValue={filterValue}
                //Table shall not allow selection
                selectionMode="none"
                placeholder=""
                sortDescriptor={sortDescriptor}
                setSortDescriptor={setSortDescriptor}
                columns={columns}
                onRowAction={onRowClick}
                topContent={
                    //Adds button to the existing top content
                    <div className="flex flex-row justify-between space-x-2">
                        {/**The dropdown for filtering tasks by tag */}
                        <SelectDropdown
                            placeholder=" Filter tags"
                            data={uniqueTags}
                            type={""}
                            selected={selectedTags}
                            setSelected={setSelectedTags}
                            dataCy="tags"
                        />
                        {/**The dropdown for filtering tasks by image */}
                        <SelectDropdown
                            placeholder=" Filter images"
                            data={uniqueImages}
                            type={""}
                            selected={selectedImages}
                            setSelected={setSelectedImages}
                            dataCy="images"
                        />
                        {/**The button for new task redirection */}
                        <Link href="../app/tasks/run">
                            <Button color="primary" endContent={<FaChevronRight />} data-cy="new-task-button">
                                Add New Task
                            </Button>
                        </Link>
                    </div>
                }
                dataCy="task-table"
            >
                {/**Displaying data and parameters in each row */}
                {filteredTasks.map((task) => (
                    <TableRow key={task.id} id={task.id} data-cy="table-row">
                        {/**Print out task names */}
                        <TableCell>{task.name}</TableCell>
                        {/**Print out image names */}
                        <TableCell>{task.image}</TableCell>
                        {/**Print out each tag separetely for task*/}
                        <TableCell>
                            {task.tags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    size="sm"
                                    className="mr-1"
                                    variant="flat"
                                    color="primary"
                                    data-cy="tag"
                                >
                                    {tag.name}
                                </Chip>
                            ))}
                        </TableCell>
                        <TableCell>
                            {/**The chip parameters for the task status*/}
                            <Chip
                                className="capitalize"
                                color={statusColorMap[task.status as Status]}
                                size="md"
                                variant="flat"
                                data-cy="status"
                            >
                                {/**Print the task status */}
                                {task.status}
                            </Chip>
                        </TableCell>
                    </TableRow>
                ))}
            </ReusableTable>
        </div>
    );
}
