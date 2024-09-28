const table = document.getElementById('ordersContainer');
const productsTotalPriceCounter = document.getElementById('total-value-counter');
const outOfStockCounter = document.getElementById('out-of-stock-counter');

async function getProducts() {
  try {
    const response = await fetch('https://api-pizzeria.vercel.app/api/v1/products', {
      method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener los datos de los productos:', error);
  }
}

getProducts()
  .then(data => {
    const products = Object.values(data);
    let totalCount = 0;
    let outOfStock = 0;
    products.forEach(product => {
      if (product.stock === '' || product.stock === '0') {
        outOfStock++;
      }
      const priceStock = parseFloat(product.precio.split('$').join('').split('.').join('').trim()) * Number(product.stock);
      totalCount += priceStock;
      const row = document.createElement('tr');
      
      const productName = document.createElement('td');
      productName.textContent = product.nombre;

      const productStock = document.createElement('td');
      productStock.textContent = product.stock;

      const productPrice = document.createElement('td');
      productPrice.textContent = product.precio;

      row.append(productName, productStock, productPrice);

      table.append(row);
    });
    const formattedValue = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 

    }).format(totalCount);

    productsTotalPriceCounter.textContent = formattedValue;
    outOfStockCounter.textContent = outOfStock;
  })
  .catch(error => console.log(error))