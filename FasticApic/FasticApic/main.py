import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def caesar_cipher(text, shift):
    result = []
    for ch in text:
        if ch.isalpha():
            base = ord('A') if ch.isupper() else ord('a')
            result.append(chr((ord(ch) - base + shift) % 26 + base))
        else:
            result.append(ch)
    return ''.join(result)


def vigenere_cipher(text, key, decrypt=False):
    key = key.lower()
    res = []
    k = 0
    for ch in text:
        if ch.isalpha():
            base = ord('A') if ch.isupper() else ord('a')
            shift = ord(key[k % len(key)]) - ord('a') + 1
            if decrypt: shift = -shift
            res.append(chr((ord(ch) - base + shift) % 26 + base))
            k += 1
        else:
            res.append(ch)
    return ''.join(res)


def vernam_cipher(text, key):
    if len(key) != len(text):
        key = (key * ((len(text) + len(key) - 1) // len(key)))[:len(text)]
    return ''.join(chr(ord(t) ^ ord(k)) for t, k in zip(text, key))


@app.post("/home")
def home(data: dict):
    return {"encryptedText": "Hello World!"}


@app.post("/cipher")
async def process_cipher(data: dict):
    print(data)

    # Данные фронтендика
    input_type = data.get("inputType")
    encryption_method = data.get("encryption", "").lower()
    encryption_key = data.get("encryptionKey")

    text = None
    if input_type == "text":
        text = data.get("userText")
    elif input_type == "file":
        user_file = data.get("userFile")
        if user_file:
            text = user_file.get("content")

    if not text:
        raise HTTPException(status_code=400, detail="Invalid content")

    if encryption_method not in ["caesar", "vigenere", "vernam"]:
        raise HTTPException(status_code=400, detail="Invalid encryption method")

    # Цезарь
    if encryption_method == "caesar":
        if encryption_key is None or encryption_key == "":
            raise HTTPException(status_code=400, detail="Encryption key is required for Caesar cipher")

        try:
            shift = int(encryption_key)
        except ValueError:
            raise HTTPException(status_code=400, detail="For Caesar cipher, the key must be a number")

        result = caesar_cipher(text, shift)
        print(result)
        return {"encryptedText": result}

    # Виженер
    elif encryption_method == "vigenere":
        if not encryption_key:
            raise HTTPException(status_code=400, detail="Encryption key is required for Vigenere cipher")

        result = vigenere_cipher(text, encryption_key, decrypt=False)
        return {"encryptedText": result}

    # Вернам
    elif encryption_method == "vernam":
        if not encryption_key:
            raise HTTPException(status_code=400, detail="Encryption key is required for Vernam cipher")

        result = vernam_cipher(text, encryption_key)
        return {"encryptedText": result}


if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)