const TodoList = artifacts.require("TodoList");

module.exports = async function (deployer) {
    await deployer.deploy(TodoList);
};
