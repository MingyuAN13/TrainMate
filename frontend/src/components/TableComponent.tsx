"use client";
import React, { useState, useEffect, Key } from "react";
import { Table, TableHeader, TableColumn, TableBody, Pagination, Selection } from "@nextui-org/react";
import { SortDescriptor } from "@nextui-org/react";
import FilterSearch from "@components/FilterSearch";

interface Column {
    name: string;
    uid: string;
    sortable: boolean;
}

// Helper function to clean a substring from keys
function cleanKeys(keys: Key[]): string[] {
    return keys.map((key) => key.toString().slice(2));
}

interface Props {
    children: React.ReactNode[] | React.ReactNode;
    topContent: React.ReactNode;
    columns: Column[];
    setSortDescriptor: (descriptor: SortDescriptor) => void;
    sortDescriptor: SortDescriptor;
    filterValue: string;
    setFilterValue: (value: string) => void;
    onRowAction?: (row: string) => void;
    selectionMode?: "single" | "multiple" | "none" | undefined;
    placeholder: string;
    onSelectionChange?: (input: string[] | string) => void;
    selectedKeys?: string[];
    dataCy: string;
}

export default function ReusableTable({
    children,
    columns,
    topContent,
    setSortDescriptor,
    sortDescriptor,
    setFilterValue,
    filterValue,
    onRowAction,
    selectionMode,
    placeholder,
    onSelectionChange,
    selectedKeys,
    dataCy,
}: Props) {
    // State variables
    const rowsPerPage = 10;
    const [page, setPage] = useState(1);

    // Go back to page 1 when filtering
    useEffect(() => {
        setPage(1);
    }, [filterValue]);

    // Calculate the total number of pages
    const totalItems = React.Children.count(children);
    const pages = Math.ceil(totalItems / rowsPerPage);

    // Paginate the filtered items
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const items = React.Children.toArray(children).slice(start, end);

    // Content displayed above the table, including the search input
    const innerTopContent = (
        <div className="flex gap-3 p-3 bg-white rounded-xl">
            <FilterSearch
                filterValue={filterValue}
                setFilterValue={setFilterValue}
                placeholder={placeholder}
                dataCy={dataCy}
            />
            {topContent}
        </div>
    );

    // Content displayed below the table, including pagination controls
    const bottomContent = (
        <div className="py-2 px-2 flex justify-between items-center">
            <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={pages}
                onChange={setPage}
            />
        </div>
    );

    const handleSelectionChange = (keys: Selection) => {
        if (!onSelectionChange) return;
        if (keys === "all") {
            onSelectionChange("all");
        }
        const cleanedKeys = cleanKeys(Array.from(keys));
        onSelectionChange(cleanedKeys);
    };

    const handleRowAction = (key: Key) => {
        if (onRowAction) onRowAction(key.toString().slice(2));
    };

    return (
        <Table
            isHeaderSticky
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            classNames={{ wrapper: "max-h-[500px]" }}
            topContent={innerTopContent}
            topContentPlacement="outside"
            sortDescriptor={sortDescriptor}
            onSortChange={(descriptor: SortDescriptor) => setSortDescriptor(descriptor)}
            selectionMode={selectionMode}
            onRowAction={onRowAction && handleRowAction}
            onSelectionChange={handleSelectionChange}
            selectedKeys={selectedKeys}
            data-cy={`${dataCy}-table`}
        >
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn
                        key={column.uid}
                        align={column.uid === "actions" ? "center" : "start"}
                        allowsSorting={column.sortable}
                    >
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            {/* @ts-expect-error, Body template needs a specific type that is not exported by nextui. So we just skip the type checking*/}
            <TableBody emptyContent={"No items found"}>{items}</TableBody>
        </Table>
    );
}

/*
=====================
EXAMPLE USECASE
=====================

"use client";
import ReusableTable from "../../components/table_component";
import {TableHeader, TableColumn, TableBody, TableRow, TableCell, divider, SortDescriptor, Chip} from "@nextui-org/react";
import {users} from "../tasks/data";
import { useEffect, useState } from "react";

//Import the data that is used in the table
const columns = [
  { uid: "name", name: "Name", sortable: true },
  { uid: "tags", name: "Tags", sortable: false },
  { uid: "status", name: "Status", sortable: false }
];

interface User {
    id: string;
    name: string;
    tags: string[];
    status: string
}

export default function Tables() {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>(
        {column: "name", direction: "ascending"}
    );
    const [sortedUsers, setSortedUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [filterValue, setFilterValue] = useState<string>("");

    useEffect(() => {
        const sorted = [...users].sort((a, b) => {
            const larger = a.name > b.name;
            const num =  larger ? 1 : -1;
            return -num;
        })
        setSortedUsers(sorted);
        setFilteredUsers(sorted);
    }, [])

    useEffect(() => {
        const sorted = [...users].sort((a, b) => {
            const larger = a[sortDescriptor.column as string] > b[sortDescriptor.column as string];
            const num =  larger ? 1 : -1;
            return sortDescriptor.direction === "ascending" ? -num : num;
        })
        setSortedUsers(sorted);
    }, [sortDescriptor])

    useEffect(() => {
        if (filterValue === "") {setFilteredUsers(sortedUsers); return;}
        const filtered = [...sortedUsers].filter(user => {
            return user.name.toLowerCase().includes(filterValue.toLowerCase());
        })
        setFilteredUsers(filtered);
    }, [filterValue, sortedUsers] )

  return (
    <div className="grow border h-full p-6 rounded-2xl shadow mx-3 overflow-hidden">
      <ReusableTable setFilterValue={setFilterValue} filterValue={filterValue} sortDescriptor={sortDescriptor} setSortDescriptor={(desc) => {setSortDescriptor(desc);}} columns={columns} topContent={<div></div>} >
          {filteredUsers && filteredUsers.map(user => (
            <TableRow key={user.id} id={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.tags.map((tag, index) => (
                <Chip key={index} size="sm" color="primary" className="mr-1">
                  {tag}
                </Chip>
              ))}</TableCell>
              <TableCell>{user.status}</TableCell>
            </TableRow>
          ))}
      </ReusableTable>
    </div>
  );
}

=====================
data.js file example
=====================

"use client"
import React from "react";
const columns = [
  {name: "ID", uid: "id", sortable: true},
  {name: "NAME", uid: "name", sortable: true},
  {name: "TAGS", uid: "tags", sortable: true},
  {name: "STATUS", uid: "status", sortable: true},
];

const statusOptions = [
  {name: "To Do", uid: "todo"},
  {name: "Busy", uid: "busy"},
  {name: "Done", uid: "done"},
  {name: "Error", uid: "error"},
];

const tags = [
  {name: "tbt", uid: 0},
  {name: "fbf", uid: 1},
  {name: "brb", uid: 2},
];

const users = [
  {
    id: "1",
    name: "VisionTransformer1",
    tags: ["tbt", "fbf"],
    status: "todo",
  },
];

export {columns, users, tags, statusOptions};
*/
