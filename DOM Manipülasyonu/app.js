const itemInput = document.getElementById("itemInput");
const addButton = document.getElementById("addButton");
const itemList = document.getElementById("itemList");

addButton.addEventListener("click", function () {

    const itemValue = itemInput.value.trim();

    if (itemValue === "") {
        alert("Lütfen bir ürün giriniz.");
        return;
    }

    const listItem = document.createElement("li");

    listItem.textContent = itemValue;

    const silButonu = document.createElement("button");
    silButonu.textContent = "Sil";
    silButonu.classList.add("sil-butonu");

    silButonu.addEventListener("click", function () {
        listItem.remove();
    });

    listItem.appendChild(silButonu);

    itemList.appendChild(listItem);

    itemInput.value = "";
    itemInput.focus();

});

itemInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addButton.click();
    }
});
