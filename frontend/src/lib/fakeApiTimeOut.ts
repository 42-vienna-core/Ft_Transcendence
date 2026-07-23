const fakeApiSaveName = (newValidName: string): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 4000);
    });
  };

export default fakeApiSaveName;