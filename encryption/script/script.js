document.addEventListener("DOMContentLoaded", function () {
    //шаг 1
    let selectedType = null;
    const buttons = document.querySelectorAll(".option");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function () {
            for (let j = 0; j < buttons.length; j++) {
                buttons[j].classList.remove("active");
            }
            this.classList.add("active");
            selectedType = this.dataset.type;
        });
    }
    //слайдеры
    const steps = document.querySelectorAll(".content");
    let current = 0;
    steps[0].style.display = "flex";
    const nextButtons = document.querySelectorAll(".next");
    const backButtons = document.querySelectorAll(".back");
    for (let i = 0; i < nextButtons.length; i++) {
        nextButtons[i].addEventListener("click", function (e) {
            e.preventDefault();
            if (current < steps.length - 1) {
                steps[current].style.display = "none";
                current++;
                steps[current].style.display = "flex";
                if (current === steps.length - 1) showStep4();
            }
        });
    }
    for (let i = 0; i < backButtons.length; i++) {
        backButtons[i].addEventListener("click", function (e) {
            e.preventDefault();
            steps[current].style.display = "none";
            current--;
            steps[current].style.display = "flex";
        });
    }
    //шаг 4
    const textField = document.getElementById("userTextField");
    const fileField = document.getElementById("userFileField");
    const userText = document.getElementById("userText");
    const userFile = document.getElementById("userFile");
    const outputText = document.getElementById("outputText");
    let fileText = "";
    function showStep4() {
        textField.classList.remove("active");
        fileField.classList.remove("active");
        if (selectedType === "text") textField.classList.add("active");
        if (selectedType === "file") fileField.classList.add("active");
    }
    // Чтение файла
    userFile.addEventListener("change", function () {
        const file = userFile.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            fileText = e.target.result;
        };
        reader.readAsText(file);
    });
    //отрпавка данных
    const form = document.getElementById("encryptForm");
    form.addEventListener("submit", async function (e) {
        e.preventDefault(); 

        if (!selectedType) {
            alert("Please choose Text or File");
            return;
        }
        const encryptionSelect = document.getElementById("encryption");
        const encryptionKey = document.getElementById("encryptionKey").value;
        outputText.value = "Encryption...";
        const dataToSend = {
            inputType: selectedType,
            encryption: encryptionSelect.value,
            encryptionKey: encryptionKey
        };
        if (selectedType === "text") {
            dataToSend.userText = userText.value;
        } else {
            if (!fileText) {
                alert("Please select a file.");
                outputText.value = "";
                return;
            }
            dataToSend.userFile = { content: fileText };
        }
        try {
            const response = await fetch(form.action, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Server error: ${response.status}`);
            }
            const result = await response.json();
            outputText.value = result.encryptedText || "No response received";

        } catch (err) {
            console.error(err);
            outputText.value = "Error: " + err.message;
        }
    });
});