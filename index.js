const ordersList = document.getElementById('ordersContainer');
const totalOrdersCounter = document.getElementById('total-orders');
const incomingOrdersCounter = document.getElementById('incoming-orders');
const deliveredOrdersCounter = document.getElementById('sent-orders');
const undeliveredOrdersCounter = document.getElementById('undelivered-orders');
let viewOrder;
let orders = [];

async function getOrders(url) {
  try {
    const response = await fetch(url, {
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
    console.error('Error al conectar con la API:', error);
  }
}

getOrders('https://api-pizzeria.vercel.app/api/v1/orders')
  .then(data => {
    orders = Object.entries(data);
    console.log(orders);
    orders.forEach(order => {
      const row = document.createElement('tr');

      const orderNumber = document.createElement('td');
      orderNumber.textContent = order[1]['ID PEDIDO'];
      orderNumber.classList = 'order-id';
      
      const deliveryDate = document.createElement('td');
      deliveryDate.textContent = order[1]['FECHA ENTREGA'];
      
      const sede = document.createElement('td');
      sede.textContent = order[1].SEDE;

      const state = document.createElement('td');
      state.textContent = order[1].ESTADO;

      const anchorsContainer = document.createElement('td');

      viewOrder = document.createElement('a');
      viewOrder.textContent = "Ver";
      viewOrder.href = './order.html';

      const print = document.createElement('a');
      print.textContent = " Imprimir";

      anchorsContainer.append(viewOrder, "|", print);

      const orderValue = document.createElement('td');
      orderValue.textContent = order[1].netCost;

      const totalOrderValue = document.createElement('td');
      totalOrderValue.textContent = order[1].costWithService;

      row.append(orderNumber, deliveryDate, sede, state, anchorsContainer, orderValue, totalOrderValue);

      ordersList.append(row);
    });

    totalOrdersCounter.textContent = orders.length;
    
    const deliveredOrders = orders.filter(order => order[1].ESTADO === 'enviado');
    deliveredOrdersCounter.textContent = deliveredOrders.length > 0 ? deliveredOrders.length : '0';
    
    const undeliveredOrders = orders.filter(order => order[1].ESTADO === 'pendiente');
    undeliveredOrdersCounter.textContent = undeliveredOrders.length > 0 ? undeliveredOrders.length : '0';
    localStorage.setItem('orders', JSON.stringify(data));
  })
  .catch(error => console.error('Error:', error));
  
ordersList.addEventListener("click", function (event) {
  if (event.target.matches("a")) {
    event.preventDefault();
    const row = event.target.closest("tr");
    const tdId = row.querySelector(".order-id");
    const informacion = encodeURIComponent(tdId.textContent);
    console.log(informacion);
    // Obtén el href original
    let href = event.target.getAttribute("href");
    console.log(href);
    // Añade el parámetro a la URL
    href += (href.includes("?") ? "&" : "?") + "id=" + informacion;

    // Redirige a la nueva URL
    window.location.href = href;
  }
});
  