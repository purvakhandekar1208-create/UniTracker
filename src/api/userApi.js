import axios from "axios";

const API_URL = "http://localhost:8081/api/users";

export const getUsers = async () => {
return axios.get(API_URL);
};

export const createUser = async (user) => {
return axios.post(API_URL, user);
};

export const updateUser = async (id, user) => {
return axios.put("${API_URL}/${id}", user);
};

export const deleteUser = async (id) => {
return axios.delete("${API_URL}/${id}");
};