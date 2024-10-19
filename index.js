const ordersList = document.getElementById('ordersContainer');
const totalOrdersCounter = document.getElementById('total-orders');
const paidOrdersCounter = document.getElementById('paid-orders');
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
          stateSelect.append(liquidadoOption);
        }
      state.appendChild(stateSelect);

      const anchorsContainer = document.createElement('td');

      viewOrder = document.createElement('a');
      viewOrder.textContent = "Ver";
      viewOrder.classList = "Ver-link";
      viewOrder.href = './order.html';

      const print = document.createElement('a');
      print.textContent = " Imprimir";
      print.classList = "ImprimirHiden";

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

    const undeliveredOrders = orders.filter(order => order[1].ESTADO === 'Pendiente');
    undeliveredOrdersCounter.textContent = undeliveredOrders.length > 0 ? undeliveredOrders.length : '0';
    
    const deliveredOrders = orders.filter(order => order[1].ESTADO === 'Entregado');
    deliveredOrdersCounter.textContent = deliveredOrders.length > 0 ? deliveredOrders.length : '0';
    
    const paidOrders = orders.filter(order => order[1].ESTADO === 'Liquidado');
    paidOrdersCounter.textContent = paidOrders.length > 0 ? paidOrders.length : '0';
    
    totalOrdersCounter.textContent = orders.length;

    localStorage.setItem('orders', JSON.stringify(data));
  })
  .catch(error => console.error('Error:', error));
  


ordersList.addEventListener("click", function (event) {



  // función para imprimir desde botón imprimir de Dashboard sin ver contenido

  event.preventDefault();

  const row = event.target.closest("tr");
  const tdId = row.querySelector(".order-id");
  const tdPrint = row.querySelector(".ImprimirHiden");

  if (event.target.matches(".ImprimirHiden")){
    console.log(tdPrint.textContent)
    
      // Crear el iframe oculto
      const iframe = document.createElement('iframe');
      iframe.id = 'hiddenIframe';
      document.body.appendChild(iframe);
  
      // Escribir el contenido a imprimir en el iframe
      const doc = iframe.contentWindow.document;
      doc.open();
  
      const dataOrders = JSON.parse(localStorage.getItem("orders"));
  
      dataOrders.forEach(order=>{ 
       
        if (order["ID PEDIDO"] === tdId.textContent) {
          console.log(order)
          doc.write(`
            
            <header class="car_header">        
                <img src="./Imagenes/logo_drive.png" alt="logo drive pizza">
                <h1>PEDIDO SEDE</h1>
            </header>
            <form class="car_container">
            <div class="car_data_container">        
                <div class="car_data_branch">
                    <p>SEDE</p>
                    <p id="sede-name">${order.SEDE}</p>
                </div>  
                <div class="car_data_date">
                    <p>FECHA</p>
                    <p id="delibery-date">${order["FECHA ENTREGA"]}</p>
                </div>  
            </div>
            <table class="car_product_list">
                    <thead class="table_head">
                        <tr>
                            <th>PRODUCTO</th>
                            <th>CANTIDAD</th>
                            <th>VALOR</th>
                        </tr>
                    </thead>
                    <tbody class="table_body" id="table-body">

                      ${order.products.map(product => {
                        return `<tr>
                            <td>${product.name}</td>
                            <td>${product.quantity}</td>
                            <td>${product.totalPrice}</td>
                        </tr>`

                      }
                      )}
                    </tbody>
            </table>
            <div class="car_data_observation">
                <p>OBSERVACIÓN:</p>
                <p id="comment">${order.OBSERVACIONES}</p>          
            </div>  
            <div class="car_total" id="total">
                Total Productos: <span id="total-amount">${order.products.length}</span>
            </div>
            <div class="car_total" id="valor-neto">
                Valor Neto: <span id="valor-neto-amount">${order.netCost}</span>
            </div>
            <div class="car_total" id="valor-servicio">
                Valor con servicio: <span id="valor-servicio-amount">${order.costWithService}</span>
            </div>
            </form>
            `);
        }
      })
    
      doc.close();
  
      // Esperar un momento para asegurar que el contenido esté cargado
      iframe.contentWindow.focus();
  
      // Imprimir el contenido del iframe
      iframe.contentWindow.print();
  
      // Eliminar el iframe después de la impresión para limpiar el DOM
      document.body.removeChild(iframe);
  
  }









  // funcion para ver la orden de cada pedido

  if (event.target.matches(".Ver-link")) {
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
      if (response) {
        if (state === 'Entregado') {
          for (let i = event.target.options.length - 1; i >= 0; i--) {
            if (event.target.options[i].textContent !== 'Entregado' && event.target.options[i].textContent !== 'Liquidado') {
              event.target.options.remove(i);
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
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