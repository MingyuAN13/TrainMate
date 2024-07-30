"use client";
import React, { useState, useEffect } from "react";
import ReusableTable from "@components/TableComponent";
import { TableRow, TableCell, SortDescriptor, Chip } from "@nextui-org/react";
import SelectDropdown from "@components/SelectDropdown";
import UserSideMenu from "@app/app/users/UserSideMenu";

// Columns to be displayed in table
const columns = [
    { uid: "email", name: "Email", sortable: true },
    { uid: "tags", name: "Roles", sortable: true },
];
// User interface
interface User {
    email: string;
    roles: string[];
}

interface Roles {
    roles: string[];
}

export default function User() {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ column: "name", direction: "ascending" });
    const [sortedUsers, setSortedUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [filterValue, setFilterValue] = useState<string>("");
    const [selected, setSelected] = useState<string[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<string[]>([]);
    //Fetch users from database
    const fetchUsers = async () => {
        try {
            // Fetch from database
            const response = await fetch("/api/users/admin", { credentials: "include" });
            const data: User[] = (await response.json()) as User[];
            //Assign data to users
            setUsers(data);
        } catch (error: unknown) {
            //Return error if fetching does not work
            console.error("Error fetching users:", error);
        }
    };

    const fetchRoles = async () => {
        try {
            // Fetch from database
            const response = await fetch("/api/roles", { credentials: "include" });
            const data: Roles = (await response.json()) as Roles;
            setRoles(data.roles);
        } catch (error: unknown) {
            //Return error if fetching does not work
            console.error("Error fetching roles:", error);
        }
    };

    // Call fetchUsers, fetchRoles upon loading page, is seperate cause fetch is needed for reloading when changes are made in sidemenu
    useEffect(() => {
        void fetchUsers();
        void fetchRoles();
    }, []); // Empty dependency array ensures this runs only once

    //Sort alphabetically on email
    useEffect(() => {
        const sortedUsers = users;
        const sorted = [...sortedUsers].sort((a, b) => {
            const larger = a.email > b.email;
            const num = larger ? 1 : -1;
            return -num;
        });
        //Set sorted to users
        setSortedUsers(sorted);
        setFilteredUsers(sorted);
    }, [users]);
    //Display by ascending order
    useEffect(() => {
        const sorted = [...users].sort((a, b) => {
            const larger = a[sortDescriptor.column as string] > b[sortDescriptor.column as string];
            const num = larger ? 1 : -1;
            return sortDescriptor.direction === "ascending" ? -num : num;
        });
        setSortedUsers(sorted);
    }, [sortDescriptor, users]);
    //Allows filtering by role and email
    useEffect(() => {
        let filtered = [...sortedUsers];

        // Filter by email
        if (filterValue !== "") {
            filtered = filtered.filter((user) => user.email.toLowerCase().includes(filterValue.toLowerCase()));
        }

        // Filter by selected roles
        if (selected.length > 0) {
            filtered = filtered.filter((user) => selected.some((selectedRole) => user.roles.includes(selectedRole)));
        }
        // Pass filtered users
        setFilteredUsers(filtered);
    }, [filterValue, sortedUsers, selected]);
    //Set user to null when sidepanel closes
    const onClose = () => {
        //Set selected user to null
        setSelectedUser(null);
    };
    //Pass user data when opening sidemenu
    const onRowClick = (userEmail: string) => {
        // Set selected user to which row was clicked
        const user = users.find((user) => user.email === userEmail);
        if (user) {
            setSelectedUser(user);
        }
    };

    //Loads in top content for the table
    const topContent = (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between gap-3 items-end">
                {roles.length > 0 && (
                    <SelectDropdown
                        type=""
                        placeholder="Filter roles"
                        data={roles}
                        selected={selected} // Pass serializable prop
                        setSelected={setSelected} // Pass serializable prop
                        dataCy="input"
                    ></SelectDropdown>
                )}
            </div>
        </div>
    );
    //Loads in rest of table
    return (
        <div className="flex w-full">
            <div className="grow h-full p-6 mx-3 relative" data-cy="user-table-wrapper">
                {/* Reusable table used for user table */}
                <ReusableTable
                    setFilterValue={setFilterValue}
                    filterValue={filterValue}
                    sortDescriptor={sortDescriptor}
                    setSortDescriptor={(desc) => {
                        setSortDescriptor(desc);
                    }}
                    columns={columns}
                    topContent={topContent}
                    onRowAction={onRowClick}
                    selectionMode="single"
                    placeholder="Search Users"
                    dataCy="user"
                >
                    {filteredUsers.map((user) => (
                        // Load in each row for users
                        <TableRow key={user.email} id={user.email} data-cy="table-row">
                            {/* Email column */}
                            <TableCell>{user.email}</TableCell>
                            {/* Role column */}
                            <TableCell>
                                {user.roles.map((tag, index) => (
                                    <Chip key={index} size="sm" color="primary" className="mr-1">
                                        {tag}
                                    </Chip>
                                ))}
                            </TableCell>
                        </TableRow>
                    ))}
                </ReusableTable>
            </div>
            {selectedUser && <UserSideMenu user={selectedUser} fetchUsers={fetchUsers} onClose={onClose} />}
        </div>
    );
}
