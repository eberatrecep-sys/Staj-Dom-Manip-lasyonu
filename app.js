const itemInput = document.getElementById("itemInput");
const itemQuantity = document.getElementById("itemQuantity");
const addButton = document.getElementById("addButton");
const itemList = document.getElementById("itemList");

addButton.addEventListener("click", function () {

    const itemValue = itemInput.value.trim();
    const quantityValue = itemQuantity.value.trim();


    if (itemValue === "" || quantityValue === "") {
        alert("Lütfen hem ürün adını hem de adet bilgisini giriniz.");
        return;
    }

    if (Number(quantityValue) <= 0) {
        alert("Adet değeri 0 veya negatif olamaz.");
        return;
    }

    const listItem = document.createElement("li");


    const nameSpan = document.createElement("span");
    nameSpan.classList.add("item-name");
    nameSpan.textContent = itemValue;

    const quantitySpan = document.createElement("span");
    quantitySpan.classList.add("item-quantity");
    quantitySpan.textContent = quantityValue + " adet";

    const itemAction = document.createElement("span");
    itemAction.classList.add("item-action");
    
    const silButonu = document.createElement("button");
    silButonu.textContent = "Sil";
    silButonu.classList.add("sil-butonu");

    silButonu.addEventListener("click", function () {
        listItem.remove();
    });

    itemAction.appendChild(silButonu);

    listItem.appendChild(nameSpan);
    listItem.appendChild(quantitySpan);
    listItem.appendChild(itemAction);

    itemList.appendChild(listItem);

    itemInput.value = "";
    itemQuantity.value = "";
    itemInput.focus();

});

itemInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addButton.click();
    }
});

itemQuantity.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addButton.click();
    }
});
