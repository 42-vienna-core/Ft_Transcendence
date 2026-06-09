const fakeApiSaveName = (newValidName: string): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
      // Имитируем задержку сети в 1.5 секунды (1500 миллисекунд)
      setTimeout(() => {
        // Здесь можно даже добавить фейковую ошибку для проверки, например:
        // if (newValidName === "") return reject(new Error("Имя не может быть пустым"));
        
        resolve({ success: true });
      }, 4000);
    });
  };

export default fakeApiSaveName;