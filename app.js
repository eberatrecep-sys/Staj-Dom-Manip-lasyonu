const itemInput = document.getElementById("itemInput");
const itemQuantity = document.getElementById("itemQuantity");
const addButton = document.getElementById("addButton");
const itemList = document.getElementById("itemList");

addButton.addEventListener("click", function () {

    const itemValue = itemInput.value.trim();
    const quantityValue = itemQuantity.value.trim();

    itemInput.classList.remove("error-border");
    itemQuantity.classList.remove("error-border");

    if (itemValue === "" || quantityValue === "") {
        if (itemValue === "") itemInput.classList.add("error-border");
        if (quantityValue === "") itemQuantity.classList.add("error-border");

        setTimeout(() => {
            alert("Lütfen hem ürün adını hem de adet bilgisini giriniz.");
        }, 10);
        return;
    }

    if (Number(quantityValue) <= 0) {
        itemQuantity.classList.add("error-border");

        setTimeout(() => {
            alert("Adet değeri 0 veya negatif olamaz.");
        }, 10);
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
    itemInput.classList.remove("error-border");
    itemQuantity.classList.remove("error-border");
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
    if (["e", "E", "+", "-", ".", ","].includes(event.key)) {
        event.preventDefault();
    }
});
itemQuantity.addEventListener("input", function (event) {
    this.value = this.value.replace(/[^0-9]/g, "");
});
