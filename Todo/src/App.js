import { Container } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import Web3 from "web3";

import TODO from "./build/TodoList.json";

import { TextField, Typography, Divider, Paper } from "@mui/material";
import { Box } from "@mui/system";

const App = () => {
    const [account, setAccount] = useState("");
    const [task, setTask] = useState("");
    const [tasks, setTasks] = useState([]);
    const [todo, setTodo] = useState();

    const loadBlockchainData = async () => {
        const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
        const accounts = await web3.eth.requestAccounts();
        setAccount(accounts[0]);

        const todoList = new web3.eth.Contract(TODO.abi, TODO.networks[5777].address);
        setTodo(todoList);
    };

    const handleFetch = useCallback(async () => {
        const taskCount = await todo.methods.taskCount().call();

        let fetchedTasks = [];
        for (var i = 1; i <= taskCount; i++) {
            const task = await todo.methods.tasks(i).call();
            fetchedTasks.push(task);
        }
        setTasks(fetchedTasks);
    }, [todo]);

    const onSubmit = async (e) => {
        e.preventDefault();

        await todo.methods
            .createTask(task)
            .send({ from: account })
            .once("receipt", (_) => {
                handleFetch();
                setTask("");
            });
    };

    const onMarkCompleted = async (id) => {
        await todo.methods
            .toggleCompleted(id)
            .send({ from: account })
            .once("receipt", (_) => {
                handleFetch();
            });
    };

    useEffect(() => {
        if (todo) {
            handleFetch();
        }
    }, [todo, handleFetch]);

    useEffect(() => {
        loadBlockchainData();
    }, []);

    return (
        <>
            <Container>
                <Box mt={5}>
                    <Typography variant="h2" textAlign="center" fontWeight="bold">
                        Web3.0 Todo App
                    </Typography>
                    <Divider />

                    <Box mt={2}>
                        <form onSubmit={onSubmit}>
                            <TextField
                                id="outlined-basic"
                                label="Enter Todo"
                                variant="outlined"
                                value={task}
                                onChange={(e) => setTask(e.target.value)}
                                fullWidth
                            />
                        </form>
                    </Box>
                    <Divider />
                    <Box mt={5}>
                        {tasks?.map((val, ind) => {
                            return (
                                <Box my={4} key={ind}>
                                    <Paper onClick={() => onMarkCompleted(val.id)}>
                                        <Box padding={2}>
                                            <Typography variant="h5" fontWeight="bold" style={{ textDecoration: "" }}>
                                                {val.completed ? (
                                                    <strike>{val.content}</strike>
                                                ) : (
                                                    <span>{val.content}</span>
                                                )}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Container>
        </>
    );
};

export default App;
