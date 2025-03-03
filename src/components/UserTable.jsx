import React from "react";
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Select, MenuItem, Switch } from "@mui/material";

const UserTable = ({ users, updateUserRole, toggleUserActive, updateUserSetor, currentUser }) => {
    return (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, overflow: "hidden" }}>
            <Table>
                <TableHead sx={{ backgroundColor: "#6A1B9A" }}>
                    <TableRow>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Nome</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Username</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Email</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Data de Criação</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Último Login</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Função</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Setor</TableCell> {/* Novo campo */}
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Ativo</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((user, index) => (
                        <TableRow
                            key={user.id}
                            sx={{
                                backgroundColor: index % 2 === 0 ? "#EDE7F6" : "#D1C4E9",
                            }}
                        >
                            <TableCell>{user.displayName || "N/A"}</TableCell>
                            <TableCell>{user.username || "N/A"}</TableCell>
                            <TableCell>{user.email || "N/A"}</TableCell>
                            <TableCell>{user.createdAt}</TableCell>
                            <TableCell>{user.lastLogin}</TableCell>
                            <TableCell>
                                <Select
                                    value={user.role}
                                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                                    disabled={user.email === currentUser.email}
                                >
                                    <MenuItem value="user">Usuário</MenuItem>
                                    <MenuItem value="technician">Técnico</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                    <MenuItem value="Financeiro">Financeiro</MenuItem>
                                    <MenuItem value="RH">RH</MenuItem>
                                    <MenuItem value="Marketing">Marketing</MenuItem>
                                    <MenuItem value="Vendas">Vendas</MenuItem>
                                    <MenuItem value="Recepção">Recepção</MenuItem>
                                </Select>
                            </TableCell>
                            <TableCell>
                                <Select
                                    value={user.setor || ''}
                                    onChange={(e) => updateUserSetor(user.id, e.target.value)}
                                >
                                    <MenuItem value="TI">TI</MenuItem>
                                    <MenuItem value="Administração">Administração</MenuItem>
                                    <MenuItem value="Jurídico">Jurídico</MenuItem>
                                    <MenuItem value="Financeiro">Financeiro</MenuItem>
                                    <MenuItem value="RH">RH</MenuItem>
                                    <MenuItem value="Marketing">Marketing</MenuItem>
                                    <MenuItem value="Vendas">Vendas</MenuItem>
                                    <MenuItem value="Recepção">Recepção</MenuItem>
                                </Select>
                            </TableCell>
                            <TableCell>
                                <Switch
                                    checked={user.isActive ?? true}
                                    onChange={() => toggleUserActive(user.id, user.isActive ?? true)}
                                    disabled={user.email === currentUser.email}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default UserTable;
