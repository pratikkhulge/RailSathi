let sharedData = {};
console.log(sharedData);

function setSharedData(data) {
    sharedData = data;
}

function getSharedData() {
    return Promise.resolve(sharedData);
}
