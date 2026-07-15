const response = await fetch("https://api.mercadopago.com/users/me", {
  headers: {
    Authorization: `Bearer TEST-5695106262924398-070623-901d1f0b6dd3c4a547a973c20e2b6619-3123946455`,
  },
});

console.log(await response.json());
