let db;

const request = indexedDB.open(budget_DB, 1);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    db.creaateObjectStore("offline-store", { autoIncrement: true });
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

request.onsuccess = (event) => {
    if (navigator.onLine) {
        checkDB();
    }
};

const saveRecord = (record) => {
    const transaction = db.transaction(["offline-store"], "readwrite");
    const store = transaction.objectStore("offline-store");
    store.add(record);
};

function checkDB() {
    const transaction = db.transaction(["offline-store"], "readwrite");
    const store = transaction.objectStore("offline-store");
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                    return response.json();
                })
                .then(() => {
                    const transaction = db.transaction(["offline-store"], "readwrite");
                    const store = transaction.objectStore("offline-store");

                    store.clear();
                });
        }
    };
}

window.addEventListener("online", checkDB)
