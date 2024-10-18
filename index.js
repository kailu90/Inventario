const ordersList = document.getElementById('ordersContainer');
const totalOrdersCounter = document.getElementById('total-orders');
const incomingOrdersCounter = document.getElementById('incoming-orders');
const deliveredOrdersCounter = document.getElementById('sent-orders');
const undeliveredOrdersCounter = document.getElementById('undelivered-orders');
const sortSelect = document.getElementById('sort');
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
      const stateSelect = document.createElement('select');
      stateSelect.classList = 'state-select';
      const pendienteOption = document.createElement('option');
      const enviadoOption = document.createElement('option');
      const entregadoOption = document.createElement('option');
      const liquidadoOption = document.createElement('option');
      pendienteOption.textContent = 'Pendiente';
      enviadoOption.textContent = 'Enviado';
      entregadoOption.textContent = 'Entregado';
      liquidadoOption.textContent = 'Liquidado';
      if (order[1].ESTADO === 'Entregado') {
        stateSelect.append(entregadoOption,
          pendienteOption,
          enviadoOption,
          liquidadoOption);
      } else if (order[1].ESTADO === 'Enviado') {
        stateSelect.append(enviadoOption, pendienteOption,
          entregadoOption,
          liquidadoOption);
        }else if (order[1].ESTADO === 'Pendiente') {
          stateSelect.append(pendienteOption, enviadoOption, 
          entregadoOption,
          liquidadoOption);
        } else if (order[1].ESTADO === 'Liquidado') {
          stateSelect.append(liquidadoOption, pendienteOption, enviadoOption, entregadoOption);
        }
      state.appendChild(stateSelect);

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
      const rows = Array.from(ordersList.rows);

      sortOrders(rows, '0', 'desc');
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

ordersList.addEventListener('change', async function (event) {
  if (event.target.options) {
    try {
      const state = event.target.value;
      const row = event.target.closest('tr');
      const orderId = row.querySelector('.order-id').textContent;
      const response = await updateStateOrder(orderId, state);
      console.log(response);
    } catch (error) {
      
    }
  }
});

sortSelect.addEventListener('change', function (event) {
  const [column, direction ] = event.target.value.split('-');
  const rows = Array.from(ordersList.rows);

  sortOrders(rows, column, direction);
});

function sortOrders(orders, column, direction) {
  orders.sort((a, b) => {
    let aValue = parseInt(a.cells[column].textContent);
    let bValue = parseInt(b.cells[column].textContent);

    if (column == 0) {
      return direction === 'asc' ?
        aValue - bValue :
        bValue - aValue;
    }  
  });

  orders.forEach(row => ordersList.appendChild(row));
}

async function updateStateOrder(orderId, state) {
  try {
    const response = await fetch(`https://api-pizzeria.vercel.app/api/v1/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ESTADO: state,
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response;
  } catch (error) {
    return error;
  }

}