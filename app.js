const itemInput = document.getElementById("itemInput");
const itemQuantity = document.getElementById("itemQuantity");
const addButton = document.getElementById("addButton");
const itemList = document.getElementById("itemList");
const errorContainer = document.getElementById("errorContainer");

// Navbar Tab Elements
const shoppingTabBtn = document.getElementById("shoppingTabBtn");
const settingsTabBtn = document.getElementById("settingsTabBtn");
const shoppingSection = document.getElementById("shoppingSection");
const settingsSection = document.getElementById("settingsSection");

// Settings Elements
const themeToggleBtn = document.getElementById("themeToggleBtn");

// Tab Switching Logic
function switchTab(activeBtn, activeSection, inactiveBtn, inactiveSection) {
    activeBtn.classList.add("active");
    activeSection.classList.add("active");
    
    inactiveBtn.classList.remove("active");
    inactiveSection.classList.remove("active");
}

shoppingTabBtn.addEventListener("click", () => {
    switchTab(shoppingTabBtn, shoppingSection, settingsTabBtn, settingsSection);
});

settingsTabBtn.addEventListener("click", () => {
    switchTab(settingsTabBtn, settingsSection, shoppingTabBtn, shoppingSection);
});

// Theme Toggling
themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
});

// Adding Item Logic
addButton.addEventListener("click", function () {
    const itemValue = itemInput.value.trim();
    const quantityValue = itemQuantity.value.trim();

    itemInput.classList.remove("error-border");
    itemQuantity.classList.remove("error-border");
    errorContainer.textContent = "";

    if (itemValue === "" || quantityValue === "") {
        if (itemValue === "") itemInput.classList.add("error-border");
        if (quantityValue === "") itemQuantity.classList.add("error-border");
        
        errorContainer.textContent = "Lütfen hem ürün adını hem de adet bilgisini giriniz.";
        return;
    }

    if (Number(quantityValue) <= 0) {
        itemQuantity.classList.add("error-border");
        errorContainer.textContent = "Adet değeri 0 veya negatif olamaz.";
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
