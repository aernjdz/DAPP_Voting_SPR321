module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Локальний хост
      port: 7545, // Порт для Ganache
      network_id: "*", // Будь-який ідентифікатор мережі
    },
  },
  compilers: {
    solc: {
      version: "0.6.0", // Версія компілятора
    },
  },
};
