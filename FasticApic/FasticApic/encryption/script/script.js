document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("encryptForm");
    const inputType = document.getElementById("inputType");
    const userText = document.getElementById("userText");
    const userFile = document.getElementById("userFile");
    const encryption = document.getElementById("encryption");
    const encryptionKey = document.getElementById("encryptionKey");
    const outputText = document.getElementById("outputText");
    const fileLabel = document.querySelector(".areafile p");

    //замена поля текста или файла
    inputType.addEventListener("change", () => {
        if (inputType.value === "file") {
            userText.style.display = "none";
            document.querySelector(".areafile").style.display = "block";
        } else {
            userText.style.display = "block";
            document.querySelector(".areafile").style.display = "none";
        }
    });
    //какой файл выбран
    userFile.addEventListener("change", () => {
        if (userFile.files.length > 0) {
            fileLabel.textContent = `Файл выбран: ${userFile.files[0].name}`;
        } else {
            fileLabel.textContent = "Paste the file here";
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        let dataToSend = {
            inputType: inputType.value,
            encryption: encryption.value,
            encryptionKey: encryptionKey.value
        };

        //текст
        if (inputType.value === "text") {
            dataToSend.userText = userText.value.trim();
        }
        //файл
        else if (inputType.value === "file") {
            const file = userFile.files[0];
            if (!file) {
                alert("Please select a file.");
                return;
            }
            const fileContent = await readFileAsText(file);
            dataToSend.userFile = {
                name: file.name,
                content: fileContent
            };
        }
        outputText.value = "Encryption...";

        try {
            const response = await fetch("http://localhost:8000/cipher", { //вот сюда надо вставить ссылку на сервер
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.detail || `Server error: ${response.status}`;
                throw new Error(errorMessage);
            }

            const result = await response.json();
            outputText.value = result.encryptedText || "No response text received.";
        } catch (error) {
            console.error(error);
            outputText.value = "Error: " + error.message;
        }
    });

    // функция для чтения файла как текста
    function readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
});